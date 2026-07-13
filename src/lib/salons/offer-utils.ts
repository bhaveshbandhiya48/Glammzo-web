import type { SalonOffer, SalonPackage, SalonService } from "@/types/salon"

export type OfferValidationError =
  | "not_found"
  | "inactive"
  | "not_started"
  | "expired"
  | "max_redemptions"
  | "no_eligible_services"

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
      return "This promo code does not apply to the services in your cart."
    default:
      return "This promo code cannot be used."
  }
}

type BookingPricingInput = {
  services: SalonService[]
  selectedServiceIds: string[]
  selectedPackage?: SalonPackage | null
}

export function computeBookingSubtotal({
  services,
  selectedServiceIds,
  selectedPackage = null,
}: BookingPricingInput) {
  const serviceById = new Map(services.map((service) => [service.id, service]))

  if (selectedPackage) {
    const packageServiceIds = new Set(
      selectedPackage.items.map((item) => item.serviceId),
    )
    const extrasTotal = selectedServiceIds
      .filter((serviceId) => !packageServiceIds.has(serviceId))
      .reduce((sum, serviceId) => sum + (serviceById.get(serviceId)?.price ?? 0), 0)

    return selectedPackage.packagePrice + extrasTotal
  }

  return selectedServiceIds.reduce(
    (sum, serviceId) => sum + (serviceById.get(serviceId)?.price ?? 0),
    0,
  )
}

function getDiscountableSubtotal(
  offer: SalonOffer,
  input: BookingPricingInput,
) {
  const serviceById = new Map(input.services.map((service) => [service.id, service]))

  if (offer.appliesTo === "all_services") {
    return computeBookingSubtotal(input)
  }

  const eligibleIds = new Set(offer.serviceIds)

  if (input.selectedPackage) {
    const packageServiceIds = input.selectedPackage.items.map((item) => item.serviceId)
    const overlap = packageServiceIds.filter((serviceId) => eligibleIds.has(serviceId))

    if (overlap.length === 0) {
      const extraEligible = input.selectedServiceIds.filter(
        (serviceId) => eligibleIds.has(serviceId),
      )
      return extraEligible.reduce(
        (sum, serviceId) => sum + (serviceById.get(serviceId)?.price ?? 0),
        0,
      )
    }

    const packageEligibleShare =
      (overlap.length / packageServiceIds.length) * input.selectedPackage.packagePrice
    const extraEligible = input.selectedServiceIds
      .filter((serviceId) => eligibleIds.has(serviceId))
      .filter(
        (serviceId) =>
          !input.selectedPackage!.items.some((item) => item.serviceId === serviceId),
      )

    const extrasTotal = extraEligible.reduce(
      (sum, serviceId) => sum + (serviceById.get(serviceId)?.price ?? 0),
      0,
    )

    return Math.round(packageEligibleShare) + extrasTotal
  }

  return input.selectedServiceIds
    .filter((serviceId) => eligibleIds.has(serviceId))
    .reduce((sum, serviceId) => sum + (serviceById.get(serviceId)?.price ?? 0), 0)
}

export function applyOfferDiscount(
  offer: SalonOffer,
  input: BookingPricingInput,
): AppliedOfferDiscount | { error: OfferValidationError } {
  const validationError = getOfferValidationError(offer)
  if (validationError) {
    return { error: validationError }
  }

  const subtotal = computeBookingSubtotal(input)
  const discountableSubtotal = getDiscountableSubtotal(offer, input)

  if (discountableSubtotal <= 0) {
    return { error: "no_eligible_services" }
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
