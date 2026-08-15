import "server-only"

import { SignJWT, jwtVerify } from "jose"

import { resolveAuthSecret, shouldExposeDebugOtp } from "@/lib/auth/auth-secret"
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit"
import {
  normalizeCustomerPhone,
  normalizeCustomerPhoneDigits,
} from "@/lib/phone/normalize"
import { getActiveSmsProvider } from "@/lib/sms"
import { resolveOtpCode } from "@/lib/sms/otp"

type ChallengePayload = {
  phoneDigits: string
  phoneE164: string
  otp: string
  purpose: "mobile_otp"
}

export type MobileOtpRequestResult =
  | {
      ok: true
      challengeToken: string
      message: string
      debugOtp?: string
    }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string>
    }

export type MobileOtpVerifyResult =
  | {
      ok: true
      phoneDigits: string
      phoneE164: string
    }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string>
      debugOtp?: string
      step?: "phone" | "otp"
    }

async function signChallenge(payload: ChallengePayload): Promise<string> {
  const secretResult = resolveAuthSecret()
  if (!secretResult.ok) {
    throw new Error(secretResult.message)
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretResult.secret)
}

async function readChallenge(token: string): Promise<ChallengePayload | null> {
  const secretResult = resolveAuthSecret()
  if (!secretResult.ok) return null

  try {
    const { payload } = await jwtVerify(token, secretResult.secret, {
      algorithms: ["HS256"],
    })
    const data = payload as unknown as ChallengePayload
    if (data.purpose !== "mobile_otp") return null
    if (!data.phoneDigits || !data.phoneE164 || !data.otp) return null
    return data
  } catch {
    return null
  }
}

/**
 * Mobile OTP request — cookie-free challenge token.
 * Does not touch glamzzo_phone_challenge / browser session cookies.
 */
export async function requestMobileOtp(phoneRaw: string): Promise<MobileOtpRequestResult> {
  const secretResult = resolveAuthSecret()
  if (!secretResult.ok) {
    return { ok: false, error: secretResult.message }
  }

  const trimmed = phoneRaw.trim()
  if (!trimmed) {
    return {
      ok: false,
      error: "Please check the form.",
      fieldErrors: { phone: "Mobile number is required." },
    }
  }

  const phoneDigits = normalizeCustomerPhoneDigits(trimmed)
  const isIndianMobile = /^91[6-9]\d{9}$/.test(phoneDigits)
  if (!isIndianMobile) {
    return {
      ok: false,
      error: "Enter a valid mobile number.",
      fieldErrors: { phone: "Enter a valid mobile number." },
    }
  }

  const rateLimited = await enforceAuthRateLimit("otp-request", phoneDigits)
  if (rateLimited) {
    return { ok: false, error: rateLimited }
  }

  const phoneE164 = normalizeCustomerPhone(trimmed)
  const otp = resolveOtpCode()
  const challengeToken = await signChallenge({
    phoneDigits,
    phoneE164,
    otp,
    purpose: "mobile_otp",
  })

  const sms = getActiveSmsProvider()
  const smsResult = await sms.sendSms({
    to: phoneE164,
    body: `Your Glammzo verification code is ${otp}. It expires in 10 minutes.`,
  })

  // Staging / mock: never fail the request solely because SMS is mocked.
  if (!smsResult.success && process.env.SMS_PROVIDER !== "mock" && process.env.SMS_PROVIDER?.trim()) {
    return {
      ok: false,
      error:
        smsResult.error ||
        "We couldn't send a verification code. Please try again shortly.",
    }
  }

  return {
    ok: true,
    challengeToken,
    message: "We sent a 6-digit code to your mobile number.",
    debugOtp: shouldExposeDebugOtp() ? otp : undefined,
  }
}

/** Verify mobile challengeToken + OTP; does not set browser cookies. */
export async function verifyMobileOtp(
  challengeToken: string,
  otpRaw: string,
): Promise<MobileOtpVerifyResult> {
  const secretResult = resolveAuthSecret()
  if (!secretResult.ok) {
    return { ok: false, error: secretResult.message, step: "phone" }
  }

  const otp = otpRaw.trim()
  if (!otp) {
    return {
      ok: false,
      error: "Please check the form.",
      fieldErrors: { otp: "Code is required." },
      step: "otp",
    }
  }
  if (!/^\d{6}$/.test(otp)) {
    return {
      ok: false,
      error: "Please check the form.",
      fieldErrors: { otp: "Enter the 6-digit code." },
      step: "otp",
    }
  }

  const challenge = await readChallenge(challengeToken.trim())
  if (!challenge) {
    return {
      ok: false,
      error: "That code expired. Request a new one.",
      step: "phone",
    }
  }

  const rateLimited = await enforceAuthRateLimit("otp-verify", challenge.phoneDigits)
  if (rateLimited) {
    return { ok: false, error: rateLimited, step: "otp" }
  }

  if (otp !== challenge.otp) {
    return {
      ok: false,
      error: "Incorrect code. Try again.",
      fieldErrors: { otp: "Incorrect code. Try again." },
      step: "otp",
      debugOtp: shouldExposeDebugOtp() ? challenge.otp : undefined,
    }
  }

  return {
    ok: true,
    phoneDigits: challenge.phoneDigits,
    phoneE164: challenge.phoneE164,
  }
}
