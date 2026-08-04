import {
  applyOfferDiscount,
  formatOfferDiscountLabel,
  formatOfferExpiry,
  isOfferBookableNow,
} from "@/lib/salons/offer-utils"
import type { SalonOffer, SalonPackage, SalonService } from "@/types/salon"

export type BookingLineItem = {
  id: string
  name: string
  durationMin: number
  price: number
  kind: "service" | "package"
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

export function pickSpotlightOffer(
  offers: SalonOffer[],
  input: {
    services: SalonService[]
    selectedServiceIds: string[]
    selectedPackage?: SalonPackage | null
    subtotal: number
  },
): SpotlightOffer | null {
  const bookable = offers.filter((offer) => isOfferBookableNow(offer))
  if (bookable.length === 0) return null

  const ranked = bookable
    .map((offer) => {
      const applied = applyOfferDiscount(offer, input)
      const currentSavings = "error" in applied ? 0 : applied.discountAmount
      const potentialSavings = estimatePotentialSavings(offer, input.subtotal)
      const minSpend = parseOfferMinSpend(offer)
      const unlockTarget =
        minSpend ??
        (offer.discountType === "fixed" ? Math.max(offer.discountValue, 1) : 0)
      const amountToUnlock =
        unlockTarget > 0 ? Math.max(0, unlockTarget - input.subtotal) : 0
      const unlockProgress =
        unlockTarget > 0
          ? Math.min(1, input.subtotal / unlockTarget)
          : input.subtotal > 0
            ? 1
            : 0

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
        isFullyUnlocked: amountToUnlock === 0 && (input.subtotal > 0 || !unlockTarget),
        score: currentSavings * 10 + potentialSavings,
      }
    })
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]
  if (!best) return null

  return {
    offer: best.offer,
    discountLabel: best.discountLabel,
    expiryLabel: best.expiryLabel,
    daysLeft: best.daysLeft,
    minSpend: best.minSpend,
    potentialSavings: best.potentialSavings,
    currentSavings: best.currentSavings,
    amountToUnlock: best.amountToUnlock,
    unlockProgress: best.unlockProgress,
    isFullyUnlocked: best.isFullyUnlocked,
  }
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

export function buildBookingLineItems(input: {
  selectedPackage: SalonPackage | null
  extraServices: SalonService[]
  selectedServices: SalonService[]
}): BookingLineItem[] {
  const { selectedPackage, extraServices, selectedServices } = input

  if (selectedPackage) {
    return [
      {
        id: `package-${selectedPackage.id}`,
        name: selectedPackage.name,
        durationMin: selectedPackage.totalDurationMin,
        price: selectedPackage.packagePrice,
        kind: "package",
      },
      ...extraServices.map((service) => ({
        id: service.id,
        name: service.name,
        durationMin: service.durationMin,
        price: service.price,
        kind: "service" as const,
      })),
    ]
  }

  return selectedServices.map((service) => ({
    id: service.id,
    name: service.name,
    durationMin: service.durationMin,
    price: service.price,
    kind: "service" as const,
  }))
}
