import { describe, expect, it } from "vitest"

import { pickHeroSalonSlides } from "@/lib/salons/pick-hero-salon-slides"
import type { Salon } from "@/types/salon"

function salon(
  id: string,
  opts: {
    city?: string
    featured?: boolean
    lat?: number
    lng?: number
  } = {},
): Salon {
  return {
    id,
    name: id,
    slug: id,
    area: "Area",
    city: opts.city ?? "Bengaluru",
    address: "Addr",
    rating: 4.5,
    reviewCount: 10,
    priceFrom: 499,
    imageUrl: "https://example.com/s.jpg",
    coverImageUrl: "https://example.com/s.jpg",
    isOpenNow: true,
    isFeatured: opts.featured ?? false,
    latitude: opts.lat ?? 12.97,
    longitude: opts.lng ?? 77.59,
    services: [],
    team: [],
    gallery: [],
    reviews: [],
  } as unknown as Salon
}

describe("pickHeroSalonSlides", () => {
  it("puts featured salons first when present", () => {
    const { slides, usedNearbyFallback } = pickHeroSalonSlides({
      salons: [
        salon("near", { lat: 12.971, lng: 77.591 }),
        salon("feat-far", { featured: true, lat: 12.98, lng: 77.6 }),
        salon("feat-near", { featured: true, lat: 12.972, lng: 77.592 }),
      ],
      latitude: 12.97,
      longitude: 77.59,
      browseCity: "Bengaluru",
      maxSlides: 6,
    })

    expect(usedNearbyFallback).toBe(false)
    expect(slides.map((item) => item.id)).toEqual(["feat-near", "feat-far"])
  })

  it("falls back to nearest when no featured", () => {
    const { slides, usedNearbyFallback } = pickHeroSalonSlides({
      salons: [
        salon("far", { lat: 13.0, lng: 77.7 }),
        salon("near", { lat: 12.971, lng: 77.591 }),
      ],
      latitude: 12.97,
      longitude: 77.59,
      browseCity: "Bengaluru",
      maxSlides: 6,
    })

    expect(usedNearbyFallback).toBe(true)
    expect(slides[0]?.id).toBe("near")
  })
})
