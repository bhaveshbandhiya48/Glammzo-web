import "server-only"

import { headers } from "next/headers"

export const AUTH_RATE_LIMIT_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again."

export const BOOKING_RATE_LIMIT_MESSAGE =
  "Too many booking attempts. Please wait a few minutes and try again."

export type AuthRateLimitScope = "otp-request" | "otp-verify" | "booking-create"

type ScopeConfig = {
  ip: { limit: number; windowMs: number }
  identifier: { limit: number; windowMs: number }
}

const SCOPE_CONFIG: Record<AuthRateLimitScope, ScopeConfig> = {
  "otp-request": {
    ip: { limit: 20, windowMs: 15 * 60_000 },
    identifier: { limit: 6, windowMs: 15 * 60_000 },
  },
  "otp-verify": {
    ip: { limit: 30, windowMs: 15 * 60_000 },
    identifier: { limit: 10, windowMs: 15 * 60_000 },
  },
  "booking-create": {
    ip: { limit: 25, windowMs: 15 * 60_000 },
    identifier: { limit: 8, windowMs: 15 * 60_000 },
  },
}

const SCOPE_MESSAGE: Record<AuthRateLimitScope, string> = {
  "otp-request": AUTH_RATE_LIMIT_MESSAGE,
  "otp-verify": AUTH_RATE_LIMIT_MESSAGE,
  "booking-create": BOOKING_RATE_LIMIT_MESSAGE,
}

type MemoryEntry = {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryEntry>()

function normalizeIp(ip: string) {
  if (ip.startsWith("::ffff:")) return ip.slice(7)
  return ip.trim() || "unknown"
}

function trustProxyHeaders(): boolean {
  return process.env.TRUST_PROXY_HEADERS?.trim() === "true"
}

export async function getServerActionClientIp(): Promise<string> {
  const headerStore = await headers()

  if (trustProxyHeaders()) {
    const realIp = headerStore.get("x-real-ip")?.trim()
    if (realIp) return normalizeIp(realIp)

    const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim()
    if (forwarded) return normalizeIp(forwarded)
  }

  return "unknown"
}

export function normalizePhoneRateLimitIdentifier(
  phone: string | null | undefined,
): string | null {
  if (!phone?.trim()) return null
  const digits = phone.replace(/\D/g, "").slice(-10)
  return digits.length === 10 ? digits : null
}

function consumeMemoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count += 1
  return true
}

export function resetAuthRateLimitsForTests() {
  memoryStore.clear()
}

/**
 * Returns an error message when limited, otherwise null.
 * In-process only (shared across requests in one Node worker).
 */
export async function enforceAuthRateLimit(
  scope: AuthRateLimitScope,
  identifier?: string | null,
): Promise<string | null> {
  const config = SCOPE_CONFIG[scope]
  const ip = await getServerActionClientIp()
  const phone = normalizePhoneRateLimitIdentifier(identifier)
  const message = SCOPE_MESSAGE[scope]

  // When proxy headers are off, IP is "unknown". Do not share one global
  // booking bucket across every customer — still throttle by phone.
  const skipSharedUnknownIp = scope === "booking-create" && ip === "unknown"

  if (
    !skipSharedUnknownIp &&
    !consumeMemoryLimit(`${scope}:ip:${ip}`, config.ip.limit, config.ip.windowMs)
  ) {
    return message
  }

  if (
    phone &&
    !consumeMemoryLimit(
      `${scope}:id:${phone}`,
      config.identifier.limit,
      config.identifier.windowMs,
    )
  ) {
    return message
  }

  return null
}
