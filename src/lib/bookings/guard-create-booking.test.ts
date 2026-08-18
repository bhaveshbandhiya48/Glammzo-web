import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: () => null,
  })),
}))

import { resetAuthRateLimitsForTests } from "@/lib/auth/rate-limit"
import { BOOKING_RATE_LIMIT_MESSAGE, guardCreateBooking } from "@/lib/bookings/guard-create-booking"

describe("guardCreateBooking", () => {
  beforeEach(() => {
    resetAuthRateLimitsForTests()
  })

  it("binds the booking to the signed-in phone", async () => {
    await expect(guardCreateBooking("+91 98765 43210")).resolves.toEqual({
      ok: true,
      customerPhone: "+919876543210",
    })
  })

  it("rejects a missing session phone", async () => {
    await expect(guardCreateBooking("")).resolves.toMatchObject({
      ok: false,
      code: "no_session_phone",
    })
  })

  it("rate-limits repeated creates for the same phone", async () => {
    for (let i = 0; i < 8; i += 1) {
      await expect(guardCreateBooking("9876543210")).resolves.toMatchObject({ ok: true })
    }
    await expect(guardCreateBooking("9876543210")).resolves.toEqual({
      ok: false,
      code: "rate_limit",
      message: BOOKING_RATE_LIMIT_MESSAGE,
    })
  })
})
