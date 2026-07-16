"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

import { resolveAuthSecret, shouldExposeDebugOtp } from "@/lib/auth/auth-secret"
import type { AuthState } from "@/lib/auth/auth-types"
import { authCookieOptions } from "@/lib/auth/cookie-options"
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session"
import { normalizeCustomerPhoneDigits, normalizeCustomerPhone } from "@/lib/phone/normalize"
import { getActiveSmsProvider } from "@/lib/sms"
import { SALON_REVIEW_TYPES, type SalonReviewType } from "@/lib/reviews/review-types"

const CHALLENGE_COOKIE = "glamzzo_phone_challenge"

type ChallengePayload = {
  phoneDigits: string
  phoneE164: string
  otp: string
}

async function setChallengeCookie(payload: ChallengePayload) {
  const secretResult = resolveAuthSecret()
  if (!secretResult.ok) {
    throw new Error(secretResult.message)
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretResult.secret)

  const jar = await cookies()
  jar.set(CHALLENGE_COOKIE, token, authCookieOptions(60 * 10))
}

async function readChallengeCookie(): Promise<ChallengePayload | null> {
  const jar = await cookies()
  const token = jar.get(CHALLENGE_COOKIE)?.value
  if (!token) return null

  const secretResult = resolveAuthSecret()
  if (!secretResult.ok) return null

  try {
    const { payload } = await jwtVerify(token, secretResult.secret, { algorithms: ["HS256"] })
    return payload as unknown as ChallengePayload
  } catch {
    return null
  }
}

async function clearChallengeCookie() {
  const jar = await cookies()
  jar.set(CHALLENGE_COOKIE, "", authCookieOptions(0))
}

export async function requestOtpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  try {
    const secretResult = resolveAuthSecret()
    if (!secretResult.ok) {
      return { ok: false, message: secretResult.message, step: "phone" }
    }

    const phoneRaw = String(formData.get("phone") ?? "").trim()

    const fieldErrors: Record<string, string> = {}
    if (!phoneRaw) fieldErrors.phone = "Mobile number is required."

    if (Object.keys(fieldErrors).length) {
      return { ok: false, message: "Please check the form.", fieldErrors, step: "phone" }
    }

    const phoneDigits = normalizeCustomerPhoneDigits(phoneRaw)
    const isIndianMobile = /^91[6-9]\d{9}$/.test(phoneDigits)
    if (!isIndianMobile) {
      return {
        ok: false,
        message: "Enter a valid mobile number.",
        fieldErrors: { phone: "Enter a valid mobile number." },
        step: "phone",
      }
    }

    const phoneE164 = normalizeCustomerPhone(phoneRaw)
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    await setChallengeCookie({ phoneDigits, phoneE164, otp })

    const sms = getActiveSmsProvider()
    const smsResult = await sms.sendSms({
      to: phoneE164,
      body: `Your Glammzo verification code is ${otp}. It expires in 10 minutes.`,
    })

    if (!smsResult.success && process.env.SMS_PROVIDER !== "mock") {
      return {
        ok: false,
        message: "We couldn't send a verification code. Please try again shortly.",
        step: "phone",
      }
    }

    return {
      ok: false,
      message: "We sent a 6-digit code to your mobile number.",
      step: "otp",
      debugOtp: shouldExposeDebugOtp() ? otp : undefined,
    }
  } catch (error) {
    console.error("[auth] requestOtpAction failed:", error)
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We couldn't send a verification code. Please try again.",
      step: "phone",
    }
  }
}

export async function verifyOtpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  try {
    const secretResult = resolveAuthSecret()
    if (!secretResult.ok) {
      return { ok: false, message: secretResult.message, step: "phone" }
    }

    const otp = String(formData.get("otp") ?? "").trim()
    const nextPathRaw = String(formData.get("next") ?? "/") || "/"

    const fieldErrors: Record<string, string> = {}
    if (!otp) fieldErrors.otp = "Code is required."
    else if (!/^\d{6}$/.test(otp)) fieldErrors.otp = "Enter the 6-digit code."

    if (Object.keys(fieldErrors).length) {
      return { ok: false, message: "Please check the form.", fieldErrors, step: "otp" }
    }

    const challenge = await readChallengeCookie()
    if (!challenge) {
      return {
        ok: false,
        message: "That code expired. Request a new one.",
        step: "phone",
      }
    }

    if (otp !== challenge.otp) {
      return {
        ok: false,
        message: "Incorrect code. Try again.",
        fieldErrors: { otp: "Incorrect code. Try again." },
        step: "otp",
        debugOtp: shouldExposeDebugOtp() ? challenge.otp : undefined,
      }
    }

    await clearChallengeCookie()

    await setSessionCookie({
      sub: `phone:${challenge.phoneDigits}`,
      phone: challenge.phoneE164,
    })

    // Return the destination instead of redirect() — soft redirects from
    // client-invoked server actions often fail in production ("page couldn't load").
    return {
      ok: true,
      redirectTo: resolveSafeNextPath(nextPathRaw),
    }
  } catch (error) {
    console.error("[auth] verifyOtpAction failed:", error)
    return {
      ok: false,
      message: "We couldn't verify that code. Please try again.",
      step: "otp",
    }
  }
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect("/")
}

// Signup is identical to login in phone-only flows.
export const signupRequestOtpAction = requestOtpAction
export const signupVerifyOtpAction = verifyOtpAction

function resolveSafeNextPath(value: string) {
  const raw = value.trim()
  const next = raw.startsWith("/") ? raw : "/"

  let pathname = next
  try {
    pathname = new URL(next, "http://local").pathname
  } catch {
    pathname = next.split("?")[0] ?? next
  }

  const blocked = ["/login", "/signup", "/forgot-password", "/partner-signup", "/for-salons/start"]
  if (blocked.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return "/"
  }

  if (pathname === "/dashboard") {
    return "/dashboard/bookings"
  }

  return next
}
