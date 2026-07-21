import { describe, expect, it } from "vitest"

import {
  filterSalonsByCityPreferExact,
  isSalonInCity,
  normalizeCityName,
} from "@/lib/salons/city-filter"
import type { Salon } from "@/types/salon"

function salon(partial: Partial<Salon> & Pick<Salon, "id" | "name" | "city">): Salon {
  return {
    slug: partial.id,
    area: partial.area ?? partial.city,
    imageUrl: "/placeholder.jpg",
    rating: 0,
    reviews: 0,
    priceFrom: 0,
    isOpenNow: false,
    isFeatured: false,
    services: [],
    staff: [],
    ...partial,
  } as Salon
}

describe("city-filter", () => {
  it("aliases Bangalore to Bengaluru", () => {
    expect(normalizeCityName("Bangalore")).toBe("bengaluru")
    expect(
      isSalonInCity(salon({ id: "1", name: "A", city: "Bengaluru" }), "Bangalore"),
    ).toBe(true)
  })

  it("falls back to all published salons when the browse city has none", () => {
    const salons = [
      salon({ id: "1", name: "Govardhan", city: "Jamnagar" }),
      salon({ id: "2", name: "Other", city: "Ahmedabad" }),
    ]

    const result = filterSalonsByCityPreferExact(salons, "Bengaluru")
    expect(result.usedFallback).toBe(true)
    expect(result.salons).toHaveLength(2)
  })

  it("keeps exact city matches without fallback", () => {
    const salons = [
      salon({ id: "1", name: "Govardhan", city: "Jamnagar" }),
      salon({ id: "2", name: "Local", city: "Bengaluru" }),
    ]

    const result = filterSalonsByCityPreferExact(salons, "Bengaluru")
    expect(result.usedFallback).toBe(false)
    expect(result.salons.map((item) => item.id)).toEqual(["2"])
  })
})
