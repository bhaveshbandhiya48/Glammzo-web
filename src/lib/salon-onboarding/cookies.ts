import "server-only"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

import { resolveAuthSecret } from "@/lib/auth/auth-secret"
import { authCookieOptions } from "@/lib/auth/cookie-options"
import {
  ONBOARDING_COOKIE,
  ONBOARDING_COOKIE_TTL_SECONDS,
  ONBOARDING_OTP_COOKIE,
  ONBOARDING_OTP_TTL_SECONDS,
  type SalonOnboardingProgress,
} from "@/lib/salon-onboarding/constants"

type OtpChallenge = {
  phoneDigits: string
  otp: string
}

function secretOrThrow() {
  const result = resolveAuthSecret()
  if (!result.ok) {
    throw new Error(result.message)
  }
  return result.secret
}

export async function readOnboardingProgress(): Promise<SalonOnboardingProgress | null> {
  const jar = await cookies()
  const token = jar.get(ONBOARDING_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secretOrThrow(), { algorithms: ["HS256"] })
    return payload as unknown as SalonOnboardingProgress
  } catch {
    return null
  }
}

export async function writeOnboardingProgress(progress: SalonOnboardingProgress) {
  const token = await new SignJWT({ ...progress })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ONBOARDING_COOKIE_TTL_SECONDS}s`)
    .sign(secretOrThrow())

  const jar = await cookies()
  jar.set(ONBOARDING_COOKIE, token, authCookieOptions(ONBOARDING_COOKIE_TTL_SECONDS))
}

export async function clearOnboardingProgress() {
  const jar = await cookies()
  jar.set(ONBOARDING_COOKIE, "", authCookieOptions(0))
}

export async function writeOnboardingOtp(challenge: OtpChallenge) {
  const token = await new SignJWT({ ...challenge })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ONBOARDING_OTP_TTL_SECONDS}s`)
    .sign(secretOrThrow())

  const jar = await cookies()
  jar.set(ONBOARDING_OTP_COOKIE, token, authCookieOptions(ONBOARDING_OTP_TTL_SECONDS))
}

export async function readOnboardingOtp(): Promise<OtpChallenge | null> {
  const jar = await cookies()
  const token = jar.get(ONBOARDING_OTP_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secretOrThrow(), { algorithms: ["HS256"] })
    return payload as unknown as OtpChallenge
  } catch {
    return null
  }
}

export async function clearOnboardingOtp() {
  const jar = await cookies()
  jar.set(ONBOARDING_OTP_COOKIE, "", authCookieOptions(0))
}
