import { describe, expect, it } from "vitest"

import {
  BENGALURU_SEO_INTENTS,
  filterSalonsByBengaluruIntent,
  resolveBengaluruSeoIntent,
  salonMatchesBengaluruIntent,
} from "@/lib/seo/bengaluru-intents"
import type { Salon } from "@/types/salon"

function salon(overrides: Partial<Salon> & Pick<Salon, "id" | "name">): Salon {
  return {
    area: "Indiranagar",
    city: "Bengaluru",
    imageUrl: "",
    coverImageUrl: "",
    rating: 4.6,
    reviews: 12,
    distanceKm: 1,
    isOpenNow: true,
    priceFrom: 499,
    services: [],
    packages: [],
    offers: [],
    staff: [],
    team: [],
    amenities: { categories: [] },
    hours: "",
    address: "",
    phone: "",
    ...overrides,
  } as Salon
}

describe("bengaluru SEO intents", () => {
  it("resolves keyword landing slugs", () => {
    expect(resolveBengaluruSeoIntent("hair-salon-in-bengaluru")?.h1).toBe(
      "Hair salons in Bengaluru",
    )
    expect(resolveBengaluruSeoIntent("unknown")).toBeNull()
    expect(BENGALURU_SEO_INTENTS).toHaveLength(6)
  })

  it("matches hair salons by business type or service keywords", () => {
    const intent = resolveBengaluruSeoIntent("hair-salon-in-bengaluru")!
    expect(
      salonMatchesBengaluruIntent(
        salon({ id: "1", name: "Cut Co", businessType: "Unisex Salon" }),
        intent,
      ),
    ).toBe(true)
    expect(
      salonMatchesBengaluruIntent(
        salon({
          id: "2",
          name: "Colour Bar",
          businessType: "Spa",
          services: [
            {
              id: "s1",
              name: "Hair colour",
              durationMin: 60,
              price: 1200,
              category: "Hair",
              imageUrl: "",
              includes: [],
            },
          ],
        }),
        intent,
      ),
    ).toBe(true)
  })

  it("filters to Bengaluru and sorts best-salons by rating", () => {
    const intent = resolveBengaluruSeoIntent("best-salons-in-bengaluru")!
    const ranked = filterSalonsByBengaluruIntent(
      [
        salon({ id: "low", name: "A", city: "Bengaluru", rating: 3.9, reviews: 40 }),
        salon({ id: "high", name: "B", city: "Bengaluru", rating: 4.9, reviews: 8 }),
        salon({ id: "other", name: "C", city: "Mumbai", rating: 5, reviews: 100 }),
      ],
      intent,
    )
    expect(ranked.map((entry) => entry.id)).toEqual(["high", "low"])
  })
})
