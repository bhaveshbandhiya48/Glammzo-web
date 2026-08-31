import { describe, expect, it } from "vitest"

import {
  clampPricingUnitQuantity,
  formatPriceWithUnit,
  formatPricingUnitQuantityCaption,
  parsePricingUnit,
  pricingUnitUsesQuantity,
  quantityForService,
} from "./pricing-unit"

describe("nail pricing units", () => {
  it("parses known units only", () => {
    expect(parsePricingUnit("per_finger")).toBe("per_finger")
    expect(parsePricingUnit("per_hand")).toBe("per_hand")
    expect(parsePricingUnit("both_hands")).toBe("both_hands")
    expect(parsePricingUnit("flat")).toBeNull()
    expect(parsePricingUnit(null)).toBeNull()
  })

  it("clamps quantity by unit", () => {
    expect(clampPricingUnitQuantity("per_finger", 3)).toBe(3)
    expect(clampPricingUnitQuantity("per_finger", 99)).toBe(10)
    expect(clampPricingUnitQuantity("per_hand", 5)).toBe(2)
    expect(clampPricingUnitQuantity("both_hands", 4)).toBe(1)
    expect(clampPricingUnitQuantity(null, 7)).toBe(7)
  })

  it("uses quantity only for per-hand and per-finger", () => {
    expect(pricingUnitUsesQuantity("per_finger")).toBe(true)
    expect(pricingUnitUsesQuantity("per_hand")).toBe(true)
    expect(pricingUnitUsesQuantity("both_hands")).toBe(false)
    expect(pricingUnitUsesQuantity(null)).toBe(false)
  })

  it("reads a clamped quantity from the cart map", () => {
    expect(
      quantityForService({ id: "gel", pricingUnit: "per_finger" }, { gel: 4 }),
    ).toBe(4)
    expect(
      quantityForService({ id: "gel", pricingUnit: "per_finger" }, { gel: 99 }),
    ).toBe(10)
    expect(quantityForService({ id: "gel", pricingUnit: "per_finger" }, {})).toBe(1)
    expect(quantityForService({ id: "cut", pricingUnit: "both_hands" }, { cut: 3 })).toBe(1)
    expect(quantityForService({ id: "cut" }, { cut: 3 })).toBe(1)
  })

  it("formats labels", () => {
    expect(formatPriceWithUnit("₹149", "per_finger")).toBe("₹149 / finger")
    expect(formatPriceWithUnit("₹998", "both_hands")).toBe("₹998 / both hands")
    expect(formatPricingUnitQuantityCaption("per_finger", 1)).toBe("1 finger")
    expect(formatPricingUnitQuantityCaption("per_finger", 3)).toBe("3 fingers")
    expect(formatPricingUnitQuantityCaption("per_hand", 2)).toBe("2 hands")
    expect(formatPricingUnitQuantityCaption("both_hands", 1)).toBeNull()
  })
})
