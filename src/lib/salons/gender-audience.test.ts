import { describe, expect, it } from "vitest"

import {
  filterPackagesByGenderAudience,
  filterServicesByGenderAudience,
  isUnisexSalonBusiness,
  parseServiceGenderAudience,
  serviceGenderLabel,
  serviceMatchesGenderAudience,
} from "./gender-audience"
import type { SalonPackage, SalonService } from "@/types/salon"

function service(overrides: Partial<SalonService>): SalonService {
  return {
    id: "s1",
    name: "Haircut",
    durationMin: 30,
    price: 400,
    category: "Hair",
    imageUrl: "",
    includes: [],
    ...overrides,
  }
}

describe("unisex salon gender audience", () => {
  it("returns a label only when the service is tagged men or women", () => {
    expect(serviceGenderLabel("men")).toBe("Men")
    expect(serviceGenderLabel("women")).toBe("Women's")
    expect(serviceGenderLabel(null)).toBeNull()
  })

  it("detects Unisex Salon business type", () => {
    expect(isUnisexSalonBusiness("Unisex Salon")).toBe(true)
    expect(isUnisexSalonBusiness("Salon")).toBe(false)
  })

  it("treats untagged services as matching both audiences", () => {
    expect(serviceMatchesGenderAudience(null, "men")).toBe(true)
    expect(serviceMatchesGenderAudience("women", "men")).toBe(false)
  })

  it("filters services and packages by selected audience", () => {
    const men = service({ id: "m", genderAudience: "men" })
    const women = service({ id: "w", genderAudience: "women" })
    const both = service({ id: "b", genderAudience: null })
    const services = [men, women, both]
    const packages: SalonPackage[] = [
      {
        id: "p-men",
        name: "Men pack",
        description: "",
        shortDescription: "",
        detailedDescription: "",
        imageUrl: "",
        packagePrice: 900,
        comparePrice: 1000,
        amountSaved: 100,
        discountPercent: 10,
        totalDurationMin: 60,
        showComparePrice: true,
        showSavings: true,
        allowOnlineBooking: true,
        servicePreviewCount: 2,
        badge: null,
        isFeatured: false,
        sortOrder: 0,
        items: [{ serviceId: "m", serviceName: "Haircut", quantity: 1 }],
      },
      {
        id: "p-women",
        name: "Women pack",
        description: "",
        shortDescription: "",
        detailedDescription: "",
        imageUrl: "",
        packagePrice: 1200,
        comparePrice: 1400,
        amountSaved: 200,
        discountPercent: 14,
        totalDurationMin: 90,
        showComparePrice: true,
        showSavings: true,
        allowOnlineBooking: true,
        servicePreviewCount: 2,
        badge: null,
        isFeatured: false,
        sortOrder: 1,
        items: [{ serviceId: "w", serviceName: "Haircut", quantity: 1 }],
      },
    ]

    expect(filterServicesByGenderAudience(services, "men").map((entry) => entry.id)).toEqual([
      "m",
      "b",
    ])
    expect(filterPackagesByGenderAudience(packages, services, "women").map((entry) => entry.id)).toEqual([
      "p-women",
    ])
    expect(
      filterPackagesByGenderAudience(
        [{ ...packages[1], genderAudience: "women", items: [{ serviceId: "m", serviceName: "Haircut", quantity: 1 }] }],
        services,
        "women",
      ).map((entry) => entry.id),
    ).toEqual(["p-women"])
    expect(
      filterPackagesByGenderAudience(
        [{ ...packages[1], genderAudience: "women", items: [{ serviceId: "m", serviceName: "Haircut", quantity: 1 }] }],
        services,
        "men",
      ),
    ).toEqual([])
    expect(parseServiceGenderAudience("women")).toBe("women")
    expect(parseServiceGenderAudience("kids")).toBeNull()
  })
})
