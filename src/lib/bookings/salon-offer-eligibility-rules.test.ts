import { describe, expect, it } from "vitest"

import {
  evaluateSalonOfferReservations,
  salonOfferAlreadyUsedMessage,
  salonOfferReservedMessage,
} from "@/lib/bookings/salon-offer-eligibility-rules"

describe("evaluateSalonOfferReservations", () => {
  it("allows apply when there is no prior offer booking", () => {
    expect(evaluateSalonOfferReservations([], "SAVE20")).toEqual({ ok: true })
  })

  it("reserves the code while an earlier booking is still open", () => {
    expect(evaluateSalonOfferReservations([{ status: "pending" }], "SAVE20")).toEqual({
      ok: false,
      reason: "reserved",
      message: salonOfferReservedMessage("SAVE20"),
    })
  })

  it("releases the code when bookings were cancelled or expired", () => {
    expect(
      evaluateSalonOfferReservations(
        [
          { status: "cancelled_by_customer" },
          { status: "expired" },
          { status: "rejected" },
        ],
        "SAVE20",
      ),
    ).toEqual({ ok: true })
  })

  it("permanently consumes the code after a completed booking", () => {
    expect(
      evaluateSalonOfferReservations([{ status: "completed" }], "SAVE20"),
    ).toEqual({
      ok: false,
      reason: "already_used",
      message: salonOfferAlreadyUsedMessage("SAVE20"),
    })
  })
})
