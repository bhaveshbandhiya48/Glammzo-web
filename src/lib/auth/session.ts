import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

import {
  resolveSessionDisplayEmail,
  resolveSessionDisplayName,
} from "@/lib/auth/display"

const COOKIE_NAME = "glamzzo_session"

type SessionPayload = {
  sub: string
  phone: string
  email?: string
  name?: string
}

export type WebSession = SessionPayload

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (secret) return new TextEncoder().encode(secret)

  // Local/dev fallback so auth flows work out-of-the-box.
  // In production we require an explicit secret.
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("glamzzo-dev-auth-secret")
  }

  throw new Error("Missing AUTH_SECRET env var")
}

export async function createSessionToken(payload: SessionPayload) {
  const secret = getSecret()
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret)
}

export async function verifySessionToken(token: string) {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] })
  return payload as unknown as SessionPayload
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload)
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
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

