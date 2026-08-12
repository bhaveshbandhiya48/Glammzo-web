import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: () => null,
  })),
}))

import {
  AUTH_RATE_LIMIT_MESSAGE,
  enforceAuthRateLimit,
  normalizePhoneRateLimitIdentifier,
  resetAuthRateLimitsForTests,
} from "@/lib/auth/rate-limit"

describe("web auth rate limit", () => {
  beforeEach(() => {
    resetAuthRateLimitsForTests()
  })

  it("normalizes Indian mobiles to last 10 digits", () => {
    expect(normalizePhoneRateLimitIdentifier("+91 98765 43210")).toBe("9876543210")
    expect(normalizePhoneRateLimitIdentifier("9876543210")).toBe("9876543210")
    expect(normalizePhoneRateLimitIdentifier("123")).toBeNull()
  })

  it("limits repeated otp-request for the same phone", async () => {
    for (let i = 0; i < 6; i += 1) {
      await expect(enforceAuthRateLimit("otp-request", "9876543210")).resolves.toBeNull()
    }
    await expect(enforceAuthRateLimit("otp-request", "9876543210")).resolves.toBe(
      AUTH_RATE_LIMIT_MESSAGE,
    )
  })
})
