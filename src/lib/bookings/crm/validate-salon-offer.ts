import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { CRM_SALON_OFFER_SELECT, type CrmOfferRow } from "@/lib/salons/crm-types"
import { isLaunchPromoCode, LAUNCH_PROMO_ACTIVE } from "@/lib/marketing/launch-promo"
import { getGlammzoCashbackOfferByCode } from "@/lib/marketing/glammzo-offers"
import { applyOfferDiscount, normalizePromoCode, offerNotCoveredMessage, offerValidationMessage } from "@/lib/salons/offer-utils"
import { mapCrmOffer } from "@/lib/salons/map-crm-salon"
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
    .select(CRM_SALON_OFFER_SELECT)
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .ilike("code", normalizedCode)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const row = data as CrmOfferRow
  return mapCrmOffer(row)
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

  if (LAUNCH_PROMO_ACTIVE && isLaunchPromoCode(promoCode)) {
    // Launch code claims wallet cashback after visit — not a checkout discount.
    return { ok: true, discount: null }
  }

  const glammzoCashback = await getGlammzoCashbackOfferByCode(promoCode)
  if (glammzoCashback) {
    // CMS Glammzo cashback offer — not an instant salon discount.
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
    if (result.error === "below_min_order") {
      const min = result.minOrderRupees ?? offer.minOrderRupees ?? 0
      return {
        ok: false,
        error: `${offer.code} needs a booking of ₹${min} or more.`,
      }
    }
    return {
      ok: false,
      error:
        result.error === "no_eligible_services"
          ? offerNotCoveredMessage(offer)
          : offerValidationMessage(result.error),
    }
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

  const nextCount = row.redemption_count + 1
  const shouldClose =
    row.max_redemptions != null && nextCount >= row.max_redemptions

  const { error: updateError } = await supabase
    .from("salon_offers")
    .update({
      redemption_count: nextCount,
      ...(shouldClose ? { is_active: false } : {}),
    })
    .eq("id", offerId)
    .eq("redemption_count", row.redemption_count)

  if (updateError) {
    console.error("[bookings] Failed to increment offer redemption:", updateError.message)
    return false
  }

  return true
}

/** Release a global max-use slot when a promo booking is cancelled / expired / declined. */
export async function decrementSalonOfferRedemption(offerId: string) {
  const supabase = createAdminClient()

  const { data: offer, error: fetchError } = await supabase
    .from("salon_offers")
    .select("id, redemption_count")
    .eq("id", offerId)
    .is("deleted_at", null)
    .maybeSingle()

  if (fetchError || !offer) {
    console.error("[bookings] Failed to load offer for release:", fetchError?.message)
    return false
  }

  const row = offer as { id: string; redemption_count: number }
  if (row.redemption_count <= 0) {
    return true
  }

  const { error: updateError } = await supabase
    .from("salon_offers")
    .update({ redemption_count: row.redemption_count - 1 })
    .eq("id", offerId)
    .eq("redemption_count", row.redemption_count)

  if (updateError) {
    console.error("[bookings] Failed to decrement offer redemption:", updateError.message)
    return false
  }

  return true
}

export function parseSalonOfferIdFromInternalNotes(
  internalNotes: string | null | undefined,
): string | null {
  if (!internalNotes) return null
  const match = internalNotes.match(/(?:^|\|)offer_id:([0-9a-f-]{36})/i)
  return match?.[1] ?? null
}
