"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session"
import { normalizeCustomerPhoneDigits, normalizeCustomerPhone } from "@/lib/phone/normalize"
import { getActiveSmsProvider } from "@/lib/sms"

type AuthState =
  | { ok: true }
  | {
      ok: false
      message: string
      step?: "phone" | "otp"
      fieldErrors?: Partial<Record<string, string>>
      /** Only set in dev to help test OTP without SMS provider. */
      debugOtp?: string
    }

const CHALLENGE_COOKIE = "glamzzo_phone_challenge"

type ChallengePayload = {
  phoneDigits: string
  phoneE164: string
  otp: string
}

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (secret) return new TextEncoder().encode(secret)

  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("glamzzo-dev-auth-secret")
  }

  throw new Error("Missing AUTH_SECRET env var")
}

async function setChallengeCookie(payload: ChallengePayload) {
  const secret = getSecret()
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret)

  const jar = await cookies()
  jar.set(CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })
}

async function readChallengeCookie(): Promise<ChallengePayload | null> {
  const jar = await cookies()
  const token = jar.get(CHALLENGE_COOKIE)?.value
  if (!token) return null

  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] })
    return payload as unknown as ChallengePayload
  } catch {
    return null
  }
}

async function clearChallengeCookie() {
  const jar = await cookies()
  jar.set(CHALLENGE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export async function requestOtpAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
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

  if (!smsResult.success && process.env.NODE_ENV === "production") {
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
    debugOtp: process.env.NODE_ENV === "production" ? undefined : otp,
  }
}

export async function verifyOtpAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
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
      debugOtp: process.env.NODE_ENV === "production" ? undefined : challenge.otp,
    }
  }

  await clearChallengeCookie()

  await setSessionCookie({
    sub: `phone:${challenge.phoneDigits}`,
    phone: challenge.phoneE164,
  })

  const safeNext = resolveSafeNextPath(nextPathRaw)
  redirect(safeNext)
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

  // Normalize (strip query/hash) so `/login?next=/book/...` is treated as `/login`.
  let pathname = next
  try {
    pathname = new URL(next, "http://local").pathname
  } catch {
    pathname = next.split("?")[0] ?? next
  }

  const blocked = ["/login", "/signup", "/forgot-password", "/partner-signup"]
  if (blocked.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return "/"
  }

  if (pathname === "/dashboard") {
    return "/dashboard/bookings"
  }

  return next
}

