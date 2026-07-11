import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

import { resolveAuthSecret } from "@/lib/auth/auth-secret"
import {
  resolveSessionDisplayEmail,
  resolveSessionDisplayName,
} from "@/lib/auth/display"
import { authCookieOptions } from "@/lib/auth/cookie-options"

const COOKIE_NAME = "glamzzo_session"

type SessionPayload = {
  sub: string
  phone: string
  email?: string
  name?: string
}

export type WebSession = SessionPayload

export async function createSessionToken(payload: SessionPayload) {
  const secretResult = resolveAuthSecret()
  if (!secretResult.ok) {
    throw new Error(secretResult.message)
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretResult.secret)
}

export async function verifySessionToken(token: string) {
  const secretResult = resolveAuthSecret()
  if (!secretResult.ok) {
    throw new Error(secretResult.message)
  }

  const { payload } = await jwtVerify(token, secretResult.secret, { algorithms: ["HS256"] })
  return payload as unknown as SessionPayload
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload)
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, authCookieOptions(60 * 60 * 24 * 14))
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.set(COOKIE_NAME, "", authCookieOptions(0))
}

export async function getSession() {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    return await verifySessionToken(token)
  } catch {
    return null
  }
}

export async function updateSessionProfile(input: {
  name?: string
  email?: string
}) {
  const session = await getSession()
  if (!session) {
    return false
  }

  const name = input.name?.trim()
  const email = input.email?.trim()

  await setSessionCookie({
    sub: session.sub,
    phone: session.phone,
    name: name || resolveSessionDisplayName(session.name) || undefined,
    email: email || resolveSessionDisplayEmail(session.email) || undefined,
  })

  return true
}

