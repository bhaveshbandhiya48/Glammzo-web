import { describe, expect, it } from "vitest"

import {
  canCancelWithNotice,
  CUSTOMER_CANCEL_MIN_NOTICE_HOURS,
  getCustomerCancelBlockedMessage,
  parseSalonCancelPolicyFromSettings,
  resolveCustomerCancelNoticeHours,
} from "./cancel-policy"

describe("resolveCustomerCancelNoticeHours", () => {
  it("uses the platform default when the policy is inactive", () => {
    expect(
      resolveCustomerCancelNoticeHours({ active: false, freeCancelHours: 24 }),
    ).toBe(CUSTOMER_CANCEL_MIN_NOTICE_HOURS)
  })

  it("uses salon hours when the policy is active", () => {
    expect(resolveCustomerCancelNoticeHours({ active: true, freeCancelHours: 24 })).toBe(
      24,
    )
  })

  it("coerces numeric strings from JSON", () => {
    expect(resolveCustomerCancelNoticeHours({ active: true, freeCancelHours: "24" as never })).toBe(
      24,
    )
  })
})

describe("canCancelWithNotice", () => {
  const start = "2026-08-18T12:00:00.000Z"

  it("blocks when inside the salon window", () => {
    const now = new Date("2026-08-18T11:00:00.000Z")
    expect(canCancelWithNotice(start, 24, now).allowed).toBe(false)
  })

  it("allows when outside the salon window", () => {
    const now = new Date("2026-08-17T10:00:00.000Z")
    expect(canCancelWithNotice(start, 24, now).allowed).toBe(true)
  })

  it("allows until start when notice hours are 0", () => {
    const before = new Date("2026-08-18T11:59:00.000Z")
    const after = new Date("2026-08-18T12:01:00.000Z")
    expect(canCancelWithNotice(start, 0, before).allowed).toBe(true)
    expect(canCancelWithNotice(start, 0, after).allowed).toBe(false)
  })
})

describe("parseSalonCancelPolicyFromSettings", () => {
  it("reads an active policy from salon settings", () => {
    expect(
      parseSalonCancelPolicyFromSettings({
        policies: { cancellation: { active: true, freeCancelHours: 12 } },
      }),
    ).toEqual({ active: true, freeCancelHours: 12 })
  })
})

describe("getCustomerCancelBlockedMessage", () => {
  it("names the required hours", () => {
    expect(getCustomerCancelBlockedMessage(24)).toContain("24 hours")
  })
})
