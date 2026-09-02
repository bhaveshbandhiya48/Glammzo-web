import {
  applyOfferDiscount,
  estimateOfferDiscountAmount,
  formatOfferDiscountLabel,
  formatOfferExpiry,
  isOfferBookableNow,
} from "@/lib/salons/offer-utils"
import type { GlammzoOffer } from "@/lib/marketing/glammzo-offers"
import { resolveServiceOptionPrice } from "@/lib/salons/catalog-utils"
import {
  formatPricingUnitQuantityCaption,
  parsePricingUnit,
  quantityForService,
} from "@/lib/salons/pricing-unit"
import type { SalonOffer, SalonPackage, SalonService } from "@/types/salon"

export type BookingLineItem = {
  id: string
  name: string
  durationMin: number
  price: number
  kind: "service" | "package"
  quantity?: number
  quantityCaption?: string | null
}

export type SpotlightOffer = {
  offer: SalonOffer
  discountLabel: string
  expiryLabel: string | null
  daysLeft: number | null
  minSpend: number | null
  potentialSavings: number
  currentSavings: number
  amountToUnlock: number
  unlockProgress: number
  isFullyUnlocked: boolean
  /** Highest real savings for the current cart. */
  isBestForCart?: boolean
  /** Platform cashback offer (wallet after visit), not checkout discount. */
  isGlammzo?: boolean
}

export const GLAMMZO_OFFER_ID_PREFIX = "glammzo:"

export function isGlammzoSpotlightOfferId(id: string) {
  return id.startsWith(GLAMMZO_OFFER_ID_PREFIX)
}

export function glammzoOfferIdFromSpotlightId(id: string) {
  return id.startsWith(GLAMMZO_OFFER_ID_PREFIX)
    ? id.slice(GLAMMZO_OFFER_ID_PREFIX.length)
    : id
}

export function parseOfferMinSpend(offer: SalonOffer): number | null {
  const text = `${offer.title} ${offer.description ?? ""}`
  const match = text.match(
    /min(?:imum)?\s*(?:spend|order|booking|cart)?\s*(?:of|:)?\s*₹?\s*([\d,]+)/i,
  )
  if (!match?.[1]) return null
  const value = Number(match[1].replace(/,/g, ""))
  return Number.isFinite(value) && value > 0 ? value : null
}

export function daysUntilOfferEnds(endsAt: string | null, now = new Date()): number | null {
  if (!endsAt) return null
  const end = new Date(endsAt)
  if (Number.isNaN(end.getTime())) return null
  const diffMs = end.getTime() - now.getTime()
  if (diffMs <= 0) return 0
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

function estimatePotentialSavings(offer: SalonOffer, subtotal: number) {
  if (offer.discountType === "percent") {
    const base = subtotal > 0 ? subtotal : 1000
    return Math.round((base * offer.discountValue) / 100)
  }
  return offer.discountValue
}

export function listSpotlightOffers(
  offers: SalonOffer[],
  input: {
    services: SalonService[]
    selectedServiceIds: string[]
    selectedPackage?: SalonPackage | null
    quantities?: Record<string, number> | null
    subtotal: number
  },
): SpotlightOffer[] {
  const bookable = offers.filter((offer) => isOfferBookableNow(offer))
  if (bookable.length === 0) return []

  const hasCart =
    input.selectedServiceIds.length > 0 || Boolean(input.selectedPackage)

  const ranked = bookable
    .map((offer) => {
      const applied = applyOfferDiscount(offer, input)
      const canApplyNow = !("error" in applied)
      const currentSavings = canApplyNow ? applied.discountAmount : 0
      const estimatedSavings = canApplyNow
        ? applied.discountAmount
        : estimateOfferDiscountAmount(offer, input)
      const potentialSavings = estimatePotentialSavings(offer, input.subtotal)
      const minSpend =
        offer.minOrderRupees != null && offer.minOrderRupees > 0
          ? offer.minOrderRupees
          : parseOfferMinSpend(offer)
      const unlockTarget = minSpend ?? 0
      const amountToUnlock =
        unlockTarget > 0 ? Math.max(0, Math.round(unlockTarget - input.subtotal)) : 0
      const unlockProgress =
        unlockTarget > 0 ? Math.min(1, input.subtotal / unlockTarget) : 0

      // Prefer offers that apply now and save the most on this cart.
      const applicabilityTier = canApplyNow
        ? 3
        : "error" in applied &&
            applied.error === "below_min_order" &&
            estimatedSavings > 0
          ? 2
          : estimatedSavings > 0
            ? 1
            : 0

      const score =
        applicabilityTier * 1_000_000 +
        estimatedSavings * 100 -
        amountToUnlock +
        // Empty / ineligible carts: prefer stronger face-value offers.
        (hasCart ? 0 : potentialSavings)

      return {
        offer,
        discountLabel: formatOfferDiscountLabel(offer),
        expiryLabel: formatOfferExpiry(offer.endsAt),
        daysLeft: daysUntilOfferEnds(offer.endsAt),
        minSpend,
        potentialSavings,
        currentSavings,
        amountToUnlock,
        unlockProgress,
        isFullyUnlocked: unlockTarget === 0 || amountToUnlock === 0,
        score,
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.offer.title.localeCompare(b.offer.title)
    })

  return ranked.map(({ score: _score, ...spotlight }, index) => ({
    ...spotlight,
    isBestForCart: hasCart && index === 0 && (spotlight.currentSavings > 0 || spotlight.isFullyUnlocked),
  }))
}

function glammzoOfferAsSalonShape(offer: GlammzoOffer): SalonOffer {
  return {
    id: `${GLAMMZO_OFFER_ID_PREFIX}${offer.id}`,
    code: offer.promoCode?.trim().toUpperCase() ?? "",
    title: offer.title,
    description: offer.description || offer.subtitle || null,
    discountType: "fixed",
    discountValue: offer.cashbackRupees,
    appliesTo: "all_services",
    serviceIds: [],
    packageIds: [],
    startsAt: null,
    endsAt: offer.endsAt,
    maxRedemptions: offer.maxClaims,
    redemptionCount: offer.claimsCount,
    isActive: true,
    minOrderRupees: offer.minOrderRupees > 0 ? offer.minOrderRupees : null,
    customerEligibility: "all_customers",
    terms: null,
    ctaLabel: offer.ctaLabel?.trim() || "Book now",
  }
}

/** Platform cashback offers for Available Savings (promo code required). */
export function listGlammzoSpotlightOffers(
  offers: GlammzoOffer[],
  input: { subtotal: number; hasCart: boolean },
): SpotlightOffer[] {
  const eligible = offers.filter(
    (offer) => Boolean(offer.promoCode?.trim()) && offer.cashbackRupees > 0,
  )
  if (eligible.length === 0) return []

  return eligible.map((offer) => {
    const salonShape = glammzoOfferAsSalonShape(offer)
    const minSpend =
      offer.minOrderRupees > 0 ? offer.minOrderRupees : null
    const unlockTarget = minSpend ?? 0
    const amountToUnlock =
      unlockTarget > 0
        ? Math.max(0, Math.round(unlockTarget - input.subtotal))
        : 0
    const unlockProgress =
      unlockTarget > 0 ? Math.min(1, input.subtotal / unlockTarget) : 0
    const isFullyUnlocked = unlockTarget === 0 || amountToUnlock === 0
    const canApplyNow = input.hasCart && isFullyUnlocked

    return {
      offer: salonShape,
      discountLabel: `₹${offer.cashbackRupees} cashback`,
      expiryLabel: formatOfferExpiry(offer.endsAt),
      daysLeft: daysUntilOfferEnds(offer.endsAt),
      minSpend,
      potentialSavings: offer.cashbackRupees,
      currentSavings: canApplyNow ? offer.cashbackRupees : 0,
      amountToUnlock,
      unlockProgress,
      isFullyUnlocked,
      isGlammzo: true,
      // Don't steal "Best for you" from stronger checkout discounts.
      isBestForCart: false,
    }
  })
}

export function mergeSpotlightOffers(
  salonOffers: SpotlightOffer[],
  glammzoOffers: SpotlightOffer[],
): SpotlightOffer[] {
  // Glammzo first, then ranked salon offers. Best-for-you stays on salon ranking.
  return [...glammzoOffers, ...salonOffers]
}

export function pickSpotlightOffer(
  offers: SalonOffer[],
  input: {
    services: SalonService[]
    selectedServiceIds: string[]
    selectedPackage?: SalonPackage | null
    quantities?: Record<string, number> | null
    subtotal: number
  },
): SpotlightOffer | null {
  return listSpotlightOffers(offers, input)[0] ?? null
}

export function pickRecommendedAddOn(
  services: SalonService[],
  selectedIds: string[],
): SalonService | null {
  if (selectedIds.length === 0) return null

  const selected = new Set(selectedIds)
  const selectedServices = services.filter((service) => selected.has(service.id))
  const categoryHint = selectedServices[0]?.category

  const candidates = services
    .filter((service) => !selected.has(service.id))
    .sort((a, b) => {
      const aScore =
        (a.completedBookingCount ?? 0) * 10 +
        (categoryHint && a.category === categoryHint ? 50 : 0)
      const bScore =
        (b.completedBookingCount ?? 0) * 10 +
        (categoryHint && b.category === categoryHint ? 50 : 0)
      if (bScore !== aScore) return bScore - aScore
      return a.price - b.price
    })

  return candidates[0] ?? null
}

function toServiceLineItem(
  service: SalonService,
  quantities?: Record<string, number> | null,
  optionId?: string | null,
): BookingLineItem {
  const quantity = quantityForService(service, quantities)
  const unit = parsePricingUnit(service.pricingUnit)
  const option = service.priceOptions?.find((entry) => entry.id === optionId)
  return {
    id: service.id,
    name: option ? `${service.name} (${option.name})` : service.name,
    durationMin: service.durationMin * quantity,
    price: resolveServiceOptionPrice(service, optionId) * quantity,
    kind: "service",
    quantity,
    quantityCaption: formatPricingUnitQuantityCaption(unit, quantity),
  }
}

export function buildBookingLineItems(input: {
  selectedPackage: SalonPackage | null
  extraServices: SalonService[]
  selectedServices: SalonService[]
  quantities?: Record<string, number> | null
  priceOptionIds?: Record<string, string> | null
}): BookingLineItem[] {
  const { selectedPackage, extraServices, selectedServices, quantities, priceOptionIds } = input

  if (selectedPackage) {
    return [
      {
        id: `package-${selectedPackage.id}`,
        name: selectedPackage.name,
        durationMin: selectedPackage.totalDurationMin,
        price: selectedPackage.packagePrice,
        kind: "package",
      },
      ...extraServices.map((service) =>
        toServiceLineItem(service, quantities, priceOptionIds?.[service.id]),
      ),
    ]
  }

  return selectedServices.map((service) =>
    toServiceLineItem(service, quantities, priceOptionIds?.[service.id]),
  )
}
