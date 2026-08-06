import { describe, expect, it } from "vitest"

import {
  evaluateLaunchPromoReservations,
  launchPromoAlreadyUsedMessage,
  launchPromoReservedMessage,
} from "@/lib/marketing/launch-promo-eligibility-rules"

describe("evaluateLaunchPromoReservations", () => {
  it("allows apply when there is no prior launch booking", () => {
    expect(evaluateLaunchPromoReservations([])).toEqual({ ok: true })
  })

  it("reserves the code while an earlier booking is still open", () => {
    expect(
      evaluateLaunchPromoReservations([{ status: "pending" }]),
    ).toEqual({
      ok: false,
      reason: "reserved",
      message: launchPromoReservedMessage(),
    })

    expect(
      evaluateLaunchPromoReservations([{ status: "confirmed" }]),
    ).toMatchObject({ reason: "reserved" })
  })

  it("releases the code when open bookings were cancelled or expired", () => {
    expect(
      evaluateLaunchPromoReservations([
        { status: "cancelled_by_customer" },
        { status: "expired" },
        { status: "rejected" },
        { status: "no_show" },
      ]),
    ).toEqual({ ok: true })
  })

  it("permanently consumes the code after a completed booking", () => {
    expect(
      evaluateLaunchPromoReservations([
        { status: "cancelled" },
        { status: "completed" },
      ]),
    ).toEqual({
      ok: false,
      reason: "already_used",
      message: launchPromoAlreadyUsedMessage(),
    })
  })

  it("blocks when welcome cashback was already credited", () => {
    expect(
      evaluateLaunchPromoReservations([], { cashbackAlreadyCredited: true }),
    ).toEqual({
      ok: false,
      reason: "already_used",
      message: launchPromoAlreadyUsedMessage(),
    })
  })
})
