import { describe, expect, it } from "vitest"

import { defaultPriceOptionId, resolveServiceOptionPrice } from "@/lib/salons/catalog-utils"
import type { SalonService } from "@/types/salon"

const haircut = {
  id: "cut",
  price: 450,
  priceOptions: [
    { id: "regular", name: "Regular", price: 650 },
    { id: "rica", name: "Rica", price: 450 },
  ],
} as SalonService

describe("resolveServiceOptionPrice", () => {
  it("uses Regular when that option is selected, not the catalog from-price", () => {
    expect(resolveServiceOptionPrice(haircut, "regular")).toBe(650)
    expect(resolveServiceOptionPrice(haircut, "rica")).toBe(450)
  })

  it("defaults to the first listed option instead of the cheapest from-price", () => {
    expect(defaultPriceOptionId(haircut)).toBe("regular")
    expect(resolveServiceOptionPrice(haircut, null)).toBe(650)
    expect(resolveServiceOptionPrice(haircut, undefined)).toBe(650)
  })
})
