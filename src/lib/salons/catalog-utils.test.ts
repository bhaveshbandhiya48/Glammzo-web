import { describe, expect, it } from "vitest"

import { defaultPriceOptionId, getPackageSavings, resolveServiceOptionPrice } from "@/lib/salons/catalog-utils"
import type { SalonPackage, SalonService } from "@/types/salon"

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

function packageForSavings(overrides: Partial<SalonPackage>): SalonPackage {
  return {
    id: "pkg",
    name: "Glow package",
    description: "",
    shortDescription: "",
    detailedDescription: "",
    imageUrl: "",
    packagePrice: 1999,
    comparePrice: 0,
    amountSaved: 0,
    discountPercent: 0,
    totalDurationMin: 90,
    showComparePrice: true,
    showSavings: true,
    allowOnlineBooking: true,
    servicePreviewCount: 3,
    badge: null,
    isFeatured: false,
    sortOrder: 0,
    items: [],
    ...overrides,
  }
}

describe("getPackageSavings", () => {
  it("hides strikethrough when a custom item is included", () => {
    const savings = getPackageSavings(
      packageForSavings({
        packagePrice: 1499,
        comparePrice: 1800,
        amountSaved: 301,
        items: [
          { serviceId: "a", serviceName: "Cut", quantity: 1, isCustom: false },
          { serviceId: "b", serviceName: "Color", quantity: 1, isCustom: false },
          { serviceId: null, serviceName: "Bridal trial", quantity: 1, isCustom: true },
        ],
      }),
    )
    expect(savings.shouldShowCompare).toBe(false)
    expect(savings.savings).toBe(0)
  })

  it("shows strikethrough only for catalog-only packages", () => {
    const savings = getPackageSavings(
      packageForSavings({
        packagePrice: 1999,
        comparePrice: 3500,
        amountSaved: 1501,
        discountPercent: 43,
        items: [
          { serviceId: "a", serviceName: "Cut", quantity: 1, isCustom: false },
          { serviceId: "b", serviceName: "Color", quantity: 1, isCustom: false },
        ],
      }),
    )
    expect(savings.shouldShowCompare).toBe(true)
    expect(savings.savings).toBe(1501)
  })
})
