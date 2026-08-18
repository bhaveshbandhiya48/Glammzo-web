import { describe, expect, it } from "vitest"

import { resolveSessionBookingPhone } from "@/lib/bookings/session-phone"

describe("resolveSessionBookingPhone", () => {
  it("normalizes a signed-in Indian mobile", () => {
    expect(resolveSessionBookingPhone("+91 98765 43210")).toBe("+919876543210")
    expect(resolveSessionBookingPhone("9876543210")).toBe("+919876543210")
  })

  it("rejects missing or too-short numbers", () => {
    expect(resolveSessionBookingPhone(null)).toBeNull()
    expect(resolveSessionBookingPhone("")).toBeNull()
    expect(resolveSessionBookingPhone("12345")).toBeNull()
  })
})
