import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { CrmOfferRow } from "@/lib/salons/crm-types"
import {
  applyOfferDiscount,
  normalizePromoCode,
  offerValidationMessage,
} from "@/lib/salons/offer-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"
import type { SalonOffer, SalonPackage, SalonService } from "@/types/salon"

export async function fetchSalonOfferByCode(
  salonId: string,
  code: string,
): Promise<SalonOffer | null> {
  const normalizedCode = normalizePromoCode(code)
  if (!normalizedCode) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("salon_offers")
    .select(
      "id, salon_id, code, title, description, discount_type, discount_value, applies_to, starts_at, ends_at, max_redemptions, redemption_count, is_active, salon_offer_services(service_id)",
    )
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .ilike("code", normalizedCode)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const row = data as CrmOfferRow

  return {
    id: row.id,
    code: row.code.trim().toUpperCase(),
    title: row.title,
    description: row.description?.trim() || null,
    discountType: row.discount_type,
    discountValue: Number.parseFloat(String(row.discount_value)) || 0,
    appliesTo: row.applies_to,
    serviceIds: (row.salon_offer_services ?? []).map((link) => link.service_id),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    maxRedemptions: row.max_redemptions,
    redemptionCount: row.redemption_count ?? 0,
    isActive: row.is_active,
  }
}

export async function resolveBookingOfferDiscount(input: {
  salonId: string
  promoCode?: string
  services: SalonService[]
  selectedServiceIds: string[]
  selectedPackage?: SalonPackage | null
}): Promise<
  | { ok: true; discount: AppliedOfferDiscount }
  | { ok: false; error: string }
  | { ok: true; discount: null }
> {
  const promoCode = input.promoCode?.trim()
  if (!promoCode) {
    return { ok: true, discount: null }
  }

  const offer = await fetchSalonOfferByCode(input.salonId, promoCode)
  if (!offer) {
    return { ok: false, error: offerValidationMessage("not_found") }
  }

  const result = applyOfferDiscount(offer, {
    services: input.services,
    selectedServiceIds: input.selectedServiceIds,
    selectedPackage: input.selectedPackage ?? null,
  })

  if ("error" in result) {
    return { ok: false, error: offerValidationMessage(result.error) }
  }

  return { ok: true, discount: result }
}

export async function incrementSalonOfferRedemption(offerId: string) {
  const supabase = createAdminClient()

  const { data: offer, error: fetchError } = await supabase
    .from("salon_offers")
    .select("id, redemption_count, max_redemptions")
    .eq("id", offerId)
    .is("deleted_at", null)
    .maybeSingle()

  if (fetchError || !offer) {
    console.error("[bookings] Failed to load offer for redemption:", fetchError?.message)
    return false
  }

  const row = offer as {
    id: string
    redemption_count: number
    max_redemptions: number | null
  }

  if (row.max_redemptions != null && row.redemption_count >= row.max_redemptions) {
    return false
  }

  const { error: updateError } = await supabase
    .from("salon_offers")
    .update({ redemption_count: row.redemption_count + 1 })
    .eq("id", offerId)
    .eq("redemption_count", row.redemption_count)

  if (updateError) {
    console.error("[bookings] Failed to increment offer redemption:", updateError.message)
    return false
  }

  return true
}
