import { quantityForService } from "@/lib/salons/pricing-unit"
import { resolveServiceOptionPrice } from "@/lib/salons/catalog-utils"
import type { SalonOffer, SalonPackage, SalonService } from "@/types/salon"

export type OfferValidationError =
  | "not_found"
  | "inactive"
  | "not_started"
  | "expired"
  | "max_redemptions"
  | "no_eligible_services"
  | "below_min_order"

export type AppliedOfferDiscount = {
  offerId: string
  code: string
  title: string
  discountType: SalonOffer["discountType"]
  discountValue: number
  subtotal: number
  discountAmount: number
  finalTotal: number
}

export function normalizePromoCode(value: string) {
  return value.trim().toUpperCase()
}

export function formatOfferDiscountLabel(offer: Pick<SalonOffer, "discountType" | "discountValue">) {
  if (offer.discountType === "percent") {
    return `${offer.discountValue}% off`
  }

  return `₹${offer.discountValue} off`
}

export function formatOfferExpiry(endsAt: string | null) {
  if (!endsAt) return null

  const date = new Date(endsAt)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function isOfferBookableNow(
  offer: Pick<
    SalonOffer,
    "isActive" | "startsAt" | "endsAt" | "maxRedemptions" | "redemptionCount"
  >,
  now = new Date(),
) {
  if (!offer.isActive) return false

  if (offer.startsAt) {
    const startsAt = new Date(offer.startsAt)
    if (!Number.isNaN(startsAt.getTime()) && startsAt > now) {
      return false
    }
  }

  if (offer.endsAt) {
    const endsAt = new Date(offer.endsAt)
    if (!Number.isNaN(endsAt.getTime()) && endsAt < now) {
      return false
    }
  }

  if (
    offer.maxRedemptions != null &&
    offer.redemptionCount >= offer.maxRedemptions
  ) {
    return false
  }

  return true
}

export function filterBookableOffers(offers: SalonOffer[], now = new Date()) {
  return offers.filter((offer) => isOfferBookableNow(offer, now))
}

export function getOfferValidationError(
  offer: SalonOffer | null | undefined,
  now = new Date(),
): OfferValidationError | null {
  if (!offer) return "not_found"
  if (!offer.isActive) return "inactive"

  if (offer.startsAt) {
    const startsAt = new Date(offer.startsAt)
    if (!Number.isNaN(startsAt.getTime()) && startsAt > now) {
      return "not_started"
    }
  }

  if (offer.endsAt) {
    const endsAt = new Date(offer.endsAt)
    if (!Number.isNaN(endsAt.getTime()) && endsAt < now) {
      return "expired"
    }
  }

  if (
    offer.maxRedemptions != null &&
    offer.redemptionCount >= offer.maxRedemptions
  ) {
    return "max_redemptions"
  }

  return null
}

export function offerValidationMessage(error: OfferValidationError) {
  switch (error) {
    case "not_found":
      return "That promo code is not valid for this salon."
    case "inactive":
      return "This promo code is no longer active."
    case "not_started":
      return "This promo code is not active yet."
    case "expired":
      return "This promo code has expired."
    case "max_redemptions":
      return "This promo code has reached its usage limit."
    case "no_eligible_services":
      return "Offer not applied — this service isn't covered."
    case "below_min_order":
      return "This promo needs a higher booking total."
    default:
      return "This promo code cannot be used."
  }
}

/** Short UX copy when a selected-services offer doesn't match the cart. */
export function offerNotCoveredMessage(offer: Pick<SalonOffer, "appliesTo">) {
  if (offer.appliesTo === "selected_services") {
    return "Offer not applied — this service isn't covered."
  }
  return offerValidationMessage("no_eligible_services")
}

export type BookingPricingInput = {
  services: SalonService[]
  selectedServiceIds: string[]
  selectedPackage?: SalonPackage | null
  quantities?: Record<string, number> | null
  priceOptionIds?: Record<string, string> | null
}

function serviceLineAmount(
  service: SalonService | undefined,
  quantities?: Record<string, number> | null,
  optionId?: string | null,
) {
  if (!service) return 0
  return resolveServiceOptionPrice(service, optionId) * quantityForService(service, quantities)
}

export function computeBookingSubtotal({
  services,
  selectedServiceIds,
  selectedPackage = null,
  quantities = null,
  priceOptionIds = null,
}: BookingPricingInput) {
  const serviceById = new Map(services.map((service) => [service.id, service]))
  const lineAmount = (serviceId: string) =>
    serviceLineAmount(serviceById.get(serviceId), quantities, priceOptionIds?.[serviceId])

  if (selectedPackage) {
    const packageServiceIds = new Set(
      selectedPackage.items.map((item) => item.serviceId),
    )
    const extrasTotal = selectedServiceIds
      .filter((serviceId) => !packageServiceIds.has(serviceId))
      .reduce((sum, serviceId) => sum + lineAmount(serviceId), 0)

    return selectedPackage.packagePrice + extrasTotal
  }

  return selectedServiceIds.reduce((sum, serviceId) => sum + lineAmount(serviceId), 0)
}

function extrasSubtotal(
  serviceById: Map<string, SalonService>,
  selectedServiceIds: string[],
  packageServiceIds: Set<string>,
  quantities?: Record<string, number> | null,
  priceOptionIds?: Record<string, string> | null,
) {
  return selectedServiceIds
    .filter((serviceId) => !packageServiceIds.has(serviceId))
    .reduce(
      (sum, serviceId) =>
        sum + serviceLineAmount(serviceById.get(serviceId), quantities, priceOptionIds?.[serviceId]),
      0,
    )
}

function getDiscountableSubtotal(
  offer: SalonOffer,
  input: BookingPricingInput,
) {
  const serviceById = new Map(input.services.map((service) => [service.id, service]))
  const packageIds = offer.packageIds ?? []

  if (offer.appliesTo === "all_services_and_packages") {
    return computeBookingSubtotal(input)
  }

  if (offer.appliesTo === "all_services") {
    if (input.selectedPackage) {
      const packageServiceIds = new Set(
        input.selectedPackage.items.map((item) => item.serviceId),
      )
      return extrasSubtotal(
        serviceById,
        input.selectedServiceIds,
        packageServiceIds,
        input.quantities,
        input.priceOptionIds,
      )
    }
    return computeBookingSubtotal(input)
  }

  const eligibleIds = new Set(offer.serviceIds)
  const eligiblePackageIds = new Set(packageIds)

  if (input.selectedPackage) {
    const packageServiceIds = input.selectedPackage.items.map((item) => item.serviceId)
    const extrasTotal = extrasSubtotal(
      serviceById,
      input.selectedServiceIds.filter((serviceId) => eligibleIds.has(serviceId)),
      new Set(packageServiceIds),
      input.quantities,
      input.priceOptionIds,
    )

    if (eligiblePackageIds.has(input.selectedPackage.id)) {
      return input.selectedPackage.packagePrice + extrasTotal
    }

    const overlap = packageServiceIds.filter((serviceId) => eligibleIds.has(serviceId))
    if (overlap.length === 0) {
      return extrasTotal
    }

    const packageEligibleShare =
      (overlap.length / packageServiceIds.length) * input.selectedPackage.packagePrice
    return Math.round(packageEligibleShare) + extrasTotal
  }

  return input.selectedServiceIds
    .filter((serviceId) => eligibleIds.has(serviceId))
    .reduce(
      (sum, serviceId) =>
        sum + serviceLineAmount(
          serviceById.get(serviceId),
          input.quantities,
          input.priceOptionIds?.[serviceId],
        ),
      0,
    )
}

export function applyOfferDiscount(
  offer: SalonOffer,
  input: BookingPricingInput,
): AppliedOfferDiscount | { error: OfferValidationError; minOrderRupees?: number } {
  const validationError = getOfferValidationError(offer)
  if (validationError) {
    return { error: validationError }
  }

  const subtotal = computeBookingSubtotal(input)
  const discountableSubtotal = getDiscountableSubtotal(offer, input)

  if (discountableSubtotal <= 0) {
    return { error: "no_eligible_services" }
  }

  if (
    offer.minOrderRupees != null &&
    offer.minOrderRupees > 0 &&
    subtotal < offer.minOrderRupees
  ) {
    return { error: "below_min_order", minOrderRupees: offer.minOrderRupees }
  }

  const discountAmount =
    offer.discountType === "percent"
      ? Math.min(
          subtotal,
          Math.round((discountableSubtotal * offer.discountValue) / 100),
        )
      : Math.min(offer.discountValue, subtotal)

  if (discountAmount <= 0) {
    return { error: "no_eligible_services" }
  }

  return {
    offerId: offer.id,
    code: offer.code,
    title: offer.title,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    subtotal,
    discountAmount,
    finalTotal: Math.max(0, subtotal - discountAmount),
  }
}

/** Discount amount for the current cart, ignoring min-order gate (for ranking / previews). */
export function estimateOfferDiscountAmount(
  offer: SalonOffer,
  input: BookingPricingInput,
): number {
  if (getOfferValidationError(offer)) return 0

  const subtotal = computeBookingSubtotal(input)
  const discountableSubtotal = getDiscountableSubtotal(offer, input)
  if (discountableSubtotal <= 0 || subtotal <= 0) return 0

  if (offer.discountType === "percent") {
    return Math.min(
      subtotal,
      Math.round((discountableSubtotal * offer.discountValue) / 100),
    )
  }

  return Math.min(offer.discountValue, subtotal)
}

export function isServiceEligibleForOffer(offer: SalonOffer, serviceId: string) {
  if (
    offer.appliesTo === "all_services" ||
    offer.appliesTo === "all_services_and_packages"
  ) {
    return true
  }
  return offer.serviceIds.includes(serviceId)
}

export function offersForService(offers: SalonOffer[], serviceId: string, now = new Date()) {
  return filterBookableOffers(offers, now).filter((offer) =>
    isServiceEligibleForOffer(offer, serviceId),
  )
}

export function bestOfferForService(
  offers: SalonOffer[],
  serviceId: string,
  servicePrice = 0,
  now = new Date(),
) {
  const eligible = offersForService(offers, serviceId, now)
  if (eligible.length === 0) return null

  return [...eligible].sort((a, b) => {
    const aSave =
      a.discountType === "percent"
        ? (servicePrice * a.discountValue) / 100
        : a.discountValue
    const bSave =
      b.discountType === "percent"
        ? (servicePrice * b.discountValue) / 100
        : b.discountValue
    return bSave - aSave
  })[0] ?? null
}

export function eligibleServicesForOffer(offer: SalonOffer, services: SalonService[]) {
  if (
    offer.appliesTo === "all_services" ||
    offer.appliesTo === "all_services_and_packages"
  ) {
    return services
  }
  const eligibleIds = new Set(offer.serviceIds)
  return services.filter((service) => eligibleIds.has(service.id))
}

export function formatOfferDiscountBadge(
  offer: Pick<SalonOffer, "discountType" | "discountValue">,
) {
  if (offer.discountType === "percent") {
    return `${offer.discountValue}% OFF`
  }
  return `₹${offer.discountValue} OFF`
}

/**
 * Best currently bookable salon offer for explore / profile badges.
 * Prefers larger percent discounts; fixed amounts compare by rupee value.
 */
export function pickBestSalonOffer(
  offers: SalonOffer[] | null | undefined,
  now = new Date(),
): SalonOffer | null {
  const bookable = filterBookableOffers(offers ?? [], now)
  if (bookable.length === 0) return null

  return [...bookable].sort((a, b) => {
    const score = (offer: SalonOffer) =>
      offer.discountType === "percent"
        ? offer.discountValue * 1000
        : offer.discountValue
    return score(b) - score(a) || a.title.localeCompare(b.title)
  })[0] ?? null
}

export function salonOfferBadgeLabel(
  offers: SalonOffer[],
  now = new Date(),
): string | null {
  const best = pickBestSalonOffer(offers, now)
  return best ? formatOfferDiscountBadge(best) : null
}

/** Count distinct bookable offers that touch any service in the list. */
export function countOffersForServices(
  offers: SalonOffer[],
  services: SalonService[],
  now = new Date(),
) {
  const bookable = filterBookableOffers(offers, now)
  if (bookable.length === 0 || services.length === 0) return 0

  const serviceIds = new Set(services.map((service) => service.id))
  return bookable.filter((offer) => {
    if (
      offer.appliesTo === "all_services" ||
      offer.appliesTo === "all_services_and_packages"
    ) {
      return true
    }
    return offer.serviceIds.some((id) => serviceIds.has(id))
  }).length
}
