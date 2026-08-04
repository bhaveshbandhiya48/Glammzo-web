import { describe, expect, it } from "vitest"

import {
  formatBookingNotesForDisplay,
  parseBookingPriceBreakdown,
  parsePayAtSalonAmount,
  resolveBookingPayableTotal,
} from "@/lib/bookings/utils"

const SAMPLE_NOTES = [
  "Promo JNMSHTMI20 applied (estimated savings 90)",
  "Glammzo wallet used: ₹200",
  "Pay at salon: ₹609",
].join("\n")

describe("parsePayAtSalonAmount", () => {
  it("reads pay-at-salon from consumer notes", () => {
    expect(parsePayAtSalonAmount(SAMPLE_NOTES)).toBe(609)
  })

  it("prefers internal_notes metadata", () => {
    expect(
      parsePayAtSalonAmount("Pay at salon: ₹899", "source:glamzzo_web|pay_at_salon:609|wallet_paise:20000"),
    ).toBe(609)
  })

  it("returns null when missing", () => {
    expect(parsePayAtSalonAmount("Thanks!")).toBeNull()
  })
})

describe("parseBookingPriceBreakdown", () => {
  it("builds subtotal → promo → wallet → payable", () => {
    expect(
      parseBookingPriceBreakdown({
        price: 899,
        notes: SAMPLE_NOTES,
        services: [{ price: 899 }],
      }),
    ).toEqual({
      subtotal: 899,
      promoCode: "JNMSHTMI20",
      promoDiscount: 90,
      loyaltyDiscount: 0,
      walletUsed: 200,
      payable: 609,
      hasAdjustments: true,
    })
  })
})

describe("formatBookingNotesForDisplay", () => {
  it("strips pricing system lines from consumer notes", () => {
    expect(
      formatBookingNotesForDisplay(`${SAMPLE_NOTES}\nPlease use soft water`),
    ).toBe("Please use soft water")
  })
})

describe("resolveBookingPayableTotal", () => {
  it("uses pay-at-salon note over stored service subtotal", () => {
    expect(
      resolveBookingPayableTotal({
        price: 899,
        notes: "Pay at salon: ₹609",
      }),
    ).toBe(609)
  })

  it("falls back to stored price", () => {
    expect(resolveBookingPayableTotal({ price: 899, notes: "Thanks" })).toBe(899)
  })
})
