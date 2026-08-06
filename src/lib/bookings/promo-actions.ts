"use server"

import { getSession } from "@/lib/auth/session"
import { getSalonById } from "@/lib/salons"
import { fetchSalonOfferByCode } from "@/lib/bookings/crm/validate-salon-offer"
import {
  isLaunchPromoCode,
  LAUNCH_CASHBACK_MIN_RUPEES,
  LAUNCH_CASHBACK_RUPEES,
  LAUNCH_PROMO_ACTIVE,
  LAUNCH_PROMO_CODE,
} from "@/lib/marketing/launch-promo"
import { getLaunchPromoEligibility } from "@/lib/marketing/launch-promo-eligibility"
import {
  applyOfferDiscount,
  computeBookingSubtotal,
  normalizePromoCode,
  offerNotCoveredMessage,
  offerValidationMessage,
} from "@/lib/salons/offer-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"

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

export async function validatePromoCodeAction(input: {
  salonId: string
  code: string
  serviceIds: string[]
  packageId?: string | null
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

    const session = await getSession()
    const eligibility = await getLaunchPromoEligibility(session?.phone)
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

  const offer = await fetchSalonOfferByCode(salon.crmSalonId, normalizedCode)
  if (!offer) {
    return { success: false, error: offerValidationMessage("not_found") }
  }

  const result = applyOfferDiscount(offer, pricingInput)

  if ("error" in result) {
    return {
      success: false,
      error:
        result.error === "no_eligible_services"
          ? offerNotCoveredMessage(offer)
          : offerValidationMessage(result.error),
    }
  }

  const session = await getSession()
  const { getSalonOfferEligibility } = await import("@/lib/bookings/salon-offer-eligibility")
  const eligibility = await getSalonOfferEligibility({
    phone: session?.phone,
    offerId: offer.id,
    code: offer.code,
  })
  if (!eligibility.ok) {
    return { success: false, error: eligibility.message }
  }

  return { success: true, kind: "discount", discount: result }
}
