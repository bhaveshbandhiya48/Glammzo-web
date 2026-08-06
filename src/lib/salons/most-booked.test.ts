import { describe, expect, it } from "vitest"

import {
  MOST_BOOKED_MIN_COUNT,
  resolveMostBookedSalonIds,
} from "./most-booked"
import type { Salon } from "@/types/salon"

function stubSalon(
  partial: Pick<Salon, "id" | "latitude" | "longitude" | "completedBookingCount">,
): Salon {
  return {
    id: partial.id,
    name: partial.id,
    area: "Test",
    imageUrl: "/x.jpg",
    coverImageUrl: "/x.jpg",
    rating: 4.5,
    reviews: 10,
    distanceKm: 0,
    latitude: partial.latitude,
    longitude: partial.longitude,
    completedBookingCount: partial.completedBookingCount,
    isOpenNow: true,
    priceFrom: 500,
    description: "",
    address: "",
    phone: "",
    hours: "",
    services: [],
    packages: [],
    offers: [],
    gallery: [],
    customerReviews: [],
    team: [],
  }
}

describe("resolveMostBookedSalonIds", () => {
  const origin = { latitude: 12.97, longitude: 77.59, isDefaultCity: true }

  it("returns empty when no salon meets the minimum count", () => {
    const salons = [
      stubSalon({
        id: "a",
        latitude: 12.971,
        longitude: 77.591,
        completedBookingCount: MOST_BOOKED_MIN_COUNT - 1,
      }),
    ]
    expect(resolveMostBookedSalonIds(salons, origin).size).toBe(0)
  })

  it("picks the top salon within 10km", () => {
    const salons = [
      stubSalon({
        id: "near-low",
        latitude: 12.972,
        longitude: 77.592,
        completedBookingCount: 4,
      }),
      stubSalon({
        id: "near-high",
        latitude: 12.973,
        longitude: 77.593,
        completedBookingCount: 12,
      }),
      stubSalon({
        id: "far-high",
        // ~20km north
        latitude: 13.15,
        longitude: 77.59,
        completedBookingCount: 99,
      }),
    ]

    const winners = resolveMostBookedSalonIds(salons, origin)
    expect([...winners]).toEqual(["near-high"])
  })

  it("includes ties for the top count", () => {
    const salons = [
      stubSalon({
        id: "a",
        latitude: 12.972,
        longitude: 77.592,
        completedBookingCount: 8,
      }),
      stubSalon({
        id: "b",
        latitude: 12.974,
        longitude: 77.594,
        completedBookingCount: 8,
      }),
    ]

    const winners = resolveMostBookedSalonIds(salons, origin)
    expect(winners.has("a")).toBe(true)
    expect(winners.has("b")).toBe(true)
  })
})
