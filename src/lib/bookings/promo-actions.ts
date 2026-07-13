"use server"

import { getSalonById } from "@/lib/salons"
import { fetchSalonOfferByCode } from "@/lib/bookings/crm/validate-salon-offer"
import {
  applyOfferDiscount,
  normalizePromoCode,
  offerValidationMessage,
} from "@/lib/salons/offer-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"

export type ValidatePromoCodeResult =
  | { success: true; discount: AppliedOfferDiscount }
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

  const offer = await fetchSalonOfferByCode(salon.crmSalonId, normalizedCode)
  if (!offer) {
    return { success: false, error: offerValidationMessage("not_found") }
  }

  const selectedPackage = input.packageId
    ? salon.packages.find((pkg) => pkg.id === input.packageId) ?? null
    : null

  const result = applyOfferDiscount(offer, {
    services: salon.services,
    selectedServiceIds: input.serviceIds,
    selectedPackage,
  })

  if ("error" in result) {
    return { success: false, error: offerValidationMessage(result.error) }
  }

  return { success: true, discount: result }
}
