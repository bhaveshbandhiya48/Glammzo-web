import { describe, expect, it } from "vitest"

import {
  applyOfferDiscount,
  bestOfferForService,
  countOffersForServices,
  eligibleServicesForOffer,
  filterBookableOffers,
  isOfferBookableNow,
  isServiceEligibleForOffer,
  offersForService,
  pickBestSalonOffer,
  salonOfferBadgeLabel,
} from "@/lib/salons/offer-utils"
import type { SalonOffer, SalonService } from "@/types/salon"

function makeOffer(overrides: Partial<SalonOffer> = {}): SalonOffer {
  return {
    id: "offer-1",
    code: "SUMMER20",
    title: "Summer Special",
    description: null,
    discountType: "percent",
    discountValue: 20,
    appliesTo: "selected_services",
    serviceIds: ["svc-1"],
    startsAt: null,
    endsAt: null,
    maxRedemptions: null,
    redemptionCount: 0,
    isActive: true,
    minOrderRupees: null,
    customerEligibility: "all_customers",
    terms: null,
    ctaLabel: "Book now",
    ...overrides,
  }
}

function makeService(overrides: Partial<SalonService> = {}): SalonService {
  return {
    id: "svc-1",
    name: "Hair Spa",
    category: "Hair",
    durationMin: 60,
    price: 1000,
    ...overrides,
  } as SalonService
}

describe("offer eligibility helpers", () => {
  it("hides inactive, expired, and future offers", () => {
    const now = new Date("2026-08-04T12:00:00.000Z")
    const offers = [
      makeOffer({ id: "active", isActive: true }),
      makeOffer({ id: "inactive", isActive: false }),
      makeOffer({
        id: "expired",
        endsAt: "2026-08-01T00:00:00.000Z",
      }),
      makeOffer({
        id: "future",
        startsAt: "2026-08-10T00:00:00.000Z",
      }),
    ]

    const bookable = filterBookableOffers(offers, now)
    expect(bookable.map((offer) => offer.id)).toEqual(["active"])
    expect(isOfferBookableNow(offers[2]!, now)).toBe(false)
    expect(isOfferBookableNow(offers[3]!, now)).toBe(false)
  })

  it("marks only linked services as eligible for selected offers", () => {
    const offer = makeOffer({ serviceIds: ["svc-1", "svc-3"] })
    expect(isServiceEligibleForOffer(offer, "svc-1")).toBe(true)
    expect(isServiceEligibleForOffer(offer, "svc-2")).toBe(false)

    const allOffer = makeOffer({ appliesTo: "all_services", serviceIds: [] })
    expect(isServiceEligibleForOffer(allOffer, "svc-2")).toBe(true)
  })

  it("returns offers and best badge only for eligible services", () => {
    const offers = [
      makeOffer({
        id: "ten",
        code: "TEN",
        discountValue: 10,
        serviceIds: ["svc-1"],
      }),
      makeOffer({
        id: "twenty",
        code: "TWENTY",
        discountValue: 20,
        serviceIds: ["svc-1"],
      }),
      makeOffer({
        id: "other",
        code: "OTHER",
        serviceIds: ["svc-2"],
      }),
    ]

    expect(offersForService(offers, "svc-1").map((o) => o.id)).toEqual([
      "ten",
      "twenty",
    ])
    expect(bestOfferForService(offers, "svc-1", 1000)?.id).toBe("twenty")
    expect(bestOfferForService(offers, "svc-2", 1000)?.code).toBe("OTHER")
    expect(bestOfferForService(offers, "svc-9", 1000)).toBeNull()
  })

  it("lists eligible services and counts category offers", () => {
    const services = [
      makeService({ id: "svc-1", name: "Hair Spa", category: "Hair" }),
      makeService({ id: "svc-2", name: "Facial", category: "Skin" }),
      makeService({ id: "svc-3", name: "Keratin", category: "Hair" }),
    ]
    const offer = makeOffer({ serviceIds: ["svc-1", "svc-3"] })

    expect(eligibleServicesForOffer(offer, services).map((s) => s.id)).toEqual([
      "svc-1",
      "svc-3",
    ])
    expect(countOffersForServices([offer], services.filter((s) => s.category === "Hair"))).toBe(
      1,
    )
    expect(countOffersForServices([offer], services.filter((s) => s.category === "Skin"))).toBe(
      0,
    )
  })

  it("rejects discount when cart has no eligible services", () => {
    const offer = makeOffer({ serviceIds: ["svc-1"] })
    const result = applyOfferDiscount(offer, {
      services: [
        makeService({ id: "svc-1", price: 1000 }),
        makeService({ id: "svc-2", price: 800 }),
      ],
      selectedServiceIds: ["svc-2"],
    })

    expect(result).toEqual({ error: "no_eligible_services" })
  })

  it("applies discount when cart includes an eligible service", () => {
    const offer = makeOffer({ serviceIds: ["svc-1"], discountValue: 20 })
    const result = applyOfferDiscount(offer, {
      services: [
        makeService({ id: "svc-1", price: 1000 }),
        makeService({ id: "svc-2", price: 800 }),
      ],
      selectedServiceIds: ["svc-1", "svc-2"],
    })

    expect("error" in result).toBe(false)
    if ("error" in result) return
    expect(result.discountAmount).toBe(200)
    expect(result.subtotal).toBe(1800)
    expect(result.finalTotal).toBe(1600)
  })

  it("picks the strongest bookable salon offer for explore badges", () => {
    const offers = [
      makeOffer({ id: "ten", discountType: "percent", discountValue: 10 }),
      makeOffer({ id: "flat", discountType: "fixed", discountValue: 200 }),
      makeOffer({ id: "twenty", discountType: "percent", discountValue: 20 }),
      makeOffer({
        id: "expired",
        discountType: "percent",
        discountValue: 50,
        endsAt: "2020-01-01T00:00:00.000Z",
      }),
    ]

    expect(pickBestSalonOffer(offers)?.id).toBe("twenty")
    expect(salonOfferBadgeLabel(offers)).toBe("20% OFF")
    expect(
      salonOfferBadgeLabel([
        makeOffer({ id: "cash", discountType: "fixed", discountValue: 200 }),
      ]),
    ).toBe("₹200 OFF")
  })
})
