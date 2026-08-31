import "server-only"

import { fetchSalonOfferByCode } from "@/lib/bookings/crm/validate-salon-offer"
import { getSalonOfferEligibility } from "@/lib/bookings/salon-offer-eligibility"
import {
  isLaunchPromoCode,
  LAUNCH_CASHBACK_MIN_RUPEES,
  LAUNCH_CASHBACK_RUPEES,
  LAUNCH_PROMO_ACTIVE,
  LAUNCH_PROMO_CODE,
} from "@/lib/marketing/launch-promo"
import { getLaunchPromoEligibility } from "@/lib/marketing/launch-promo-eligibility"
import {
  getGlammzoCashbackOfferByCode,
  getGlammzoOfferCashbackEligibility,
} from "@/lib/marketing/glammzo-offers"
import { getSalonById } from "@/lib/salons"
import {
  applyOfferDiscount,
  computeBookingSubtotal,
  normalizePromoCode,
  offerNotCoveredMessage,
  offerValidationMessage,
  type AppliedOfferDiscount,
} from "@/lib/salons/offer-utils"

export type ValidatePromoCodeResult =
  | { success: true; kind: "discount"; discount: AppliedOfferDiscount }
  | {
      success: true
      kind: "cashback"
      code: string
      cashbackRupees: number
      message: string
    }
  | { success: false; error: string }

/**
 * Shared promo validation for web actions and mobile API.
 * Instant salon offers → discount. Launch code → wallet cashback (not pay-at-salon).
 */
export async function validatePromoCode(input: {
  salonId: string
  code: string
  serviceIds: string[]
  packageId?: string | null
  phone?: string | null
  serviceQuantities?: Record<string, number>
}): Promise<ValidatePromoCodeResult> {
  const salon = await getSalonById(input.salonId)
  if (!salon?.crmSalonId) {
    return { success: false, error: "Salon not found." }
  }

  const normalizedCode = normalizePromoCode(input.code)
  if (!normalizedCode) {
    return { success: false, error: "Enter a promo code." }
  }

  const selectedPackage = input.packageId
    ? salon.packages.find((pkg) => pkg.id === input.packageId) ?? null
    : null

  const pricingInput = {
    services: salon.services,
    selectedServiceIds: input.serviceIds,
    selectedPackage,
    quantities: input.serviceQuantities,
  }

  if (isLaunchPromoCode(normalizedCode)) {
    if (!LAUNCH_PROMO_ACTIVE) {
      return { success: false, error: "This launch offer is no longer active." }
    }

    if (input.serviceIds.length === 0 && !selectedPackage) {
      return { success: false, error: "Add services to your cart before applying this code." }
    }

    const subtotal = computeBookingSubtotal(pricingInput)
    if (subtotal < LAUNCH_CASHBACK_MIN_RUPEES) {
      return {
        success: false,
        error: `${LAUNCH_PROMO_CODE} needs a booking of ₹${LAUNCH_CASHBACK_MIN_RUPEES} or more. Your cart is ₹${Math.round(subtotal)}.`,
      }
    }

    const eligibility = await getLaunchPromoEligibility(input.phone)
    if (!eligibility.ok) {
      return { success: false, error: eligibility.message }
    }

    return {
      success: true,
      kind: "cashback",
      code: LAUNCH_PROMO_CODE,
      cashbackRupees: LAUNCH_CASHBACK_RUPEES,
      message: `${LAUNCH_PROMO_CODE} claimed. ₹${LAUNCH_CASHBACK_RUPEES} cashback will be added to your wallet after your first completed visit (min ₹${LAUNCH_CASHBACK_MIN_RUPEES}).`,
    }
  }

  const glammzoCashback = await getGlammzoCashbackOfferByCode(normalizedCode)
  if (glammzoCashback) {
    if (input.serviceIds.length === 0 && !selectedPackage) {
      return {
        success: false,
        error: "Add services to your cart before applying this code.",
      }
    }

    if (
      glammzoCashback.maxClaims != null &&
      glammzoCashback.claimsCount >= glammzoCashback.maxClaims
    ) {
      return {
        success: false,
        error: `${glammzoCashback.promoCode ?? normalizedCode} has reached its maximum number of users.`,
      }
    }

    const subtotal = computeBookingSubtotal(pricingInput)
    if (subtotal < glammzoCashback.minOrderRupees) {
      return {
        success: false,
        error: `${glammzoCashback.promoCode} needs a booking of ₹${glammzoCashback.minOrderRupees} or more. Your cart is ₹${Math.round(subtotal)}.`,
      }
    }

    const eligibility = await getGlammzoOfferCashbackEligibility({
      phone: input.phone,
      offerId: glammzoCashback.id,
      code: glammzoCashback.promoCode ?? normalizedCode,
    })
    if (!eligibility.ok) {
      return { success: false, error: eligibility.message }
    }

    const code = glammzoCashback.promoCode ?? normalizedCode
    return {
      success: true,
      kind: "cashback",
      code,
      cashbackRupees: glammzoCashback.cashbackRupees,
      message: `${code} claimed. ₹${glammzoCashback.cashbackRupees} cashback will be added to your wallet after your completed visit (min ₹${glammzoCashback.minOrderRupees}).`,
    }
  }

  const offer = await fetchSalonOfferByCode(salon.crmSalonId, normalizedCode)
  if (!offer) {
    return { success: false, error: offerValidationMessage("not_found") }
  }

  const result = applyOfferDiscount(offer, pricingInput)

  if ("error" in result) {
    if (result.error === "below_min_order") {
      const min = result.minOrderRupees ?? offer.minOrderRupees ?? 0
      return {
        success: false,
        error: `${offer.code} needs a booking of ₹${min} or more. Your cart is ₹${Math.round(computeBookingSubtotal(pricingInput))}.`,
      }
    }
    return {
      success: false,
      error:
        result.error === "no_eligible_services"
          ? offerNotCoveredMessage(offer)
          : offerValidationMessage(result.error),
    }
  }

  const eligibility = await getSalonOfferEligibility({
    phone: input.phone,
    offerId: offer.id,
    code: offer.code,
    salonId: salon.crmSalonId,
    customerEligibility: offer.customerEligibility,
  })
  if (!eligibility.ok) {
    return { success: false, error: eligibility.message }
  }

  return { success: true, kind: "discount", discount: result }
}
