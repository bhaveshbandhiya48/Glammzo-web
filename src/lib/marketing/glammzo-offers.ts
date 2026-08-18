import "server-only"

import {
  evaluatePromoReservations,
  type PromoReservationResult,
} from "@/lib/bookings/promo-reservation"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { normalizePromoCode } from "@/lib/salons/offer-utils"
import {
  createAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/admin"

export type GlammzoOfferGeoScope = "nation" | "cities" | "areas"

export type GlammzoOffer = {
  id: string
  title: string
  subtitle: string
  description: string
  eyebrow: string
  webStripText: string
  mobileBannerUrl: string | null
  ctaLabel: string | null
  ctaHref: string | null
  promoCode: string | null
  cashbackRupees: number
  minOrderRupees: number
  maxClaims: number | null
  claimsCount: number
  geoScope: GlammzoOfferGeoScope
  targetCities: string[]
  targetAreas: string[]
  showOnWebStrip: boolean
  showOnMobileBanner: boolean
  showOnSalonDetail: boolean
  priority: number
  endsAt: string | null
}

/** Marker written to appointment.internal_notes when CMS cashback is claimed. */
export const GLAMMZO_OFFER_CASHBACK_NOTE_MARKER = "glammzo_offer_cashback:"

export function buildGlammzoOfferCashbackNoteMarker(
  offerId: string,
  code: string,
) {
  return `${GLAMMZO_OFFER_CASHBACK_NOTE_MARKER}${offerId}:${normalizePromoCode(code)}`
}

type GlammzoOfferRow = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  eyebrow: string | null
  web_strip_text: string | null
  mobile_banner_url: string | null
  cta_label: string | null
  cta_href: string | null
  promo_code: string | null
  cashback_paise: number | null
  min_order_paise: number | null
  max_claims?: number | null
  claims_count?: number | null
  geo_scope: GlammzoOfferGeoScope
  target_cities: string[] | null
  target_areas: string[] | null
  show_on_web_strip: boolean
  show_on_mobile_banner: boolean
  show_on_salon_detail: boolean
  priority: number
  starts_at?: string | null
  ends_at?: string | null
}

function normalizePlace(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function mapRow(row: GlammzoOfferRow): GlammzoOffer {
  const cashbackPaise = row.cashback_paise ?? 0
  const minOrderPaise = row.min_order_paise ?? 69900
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    eyebrow: row.eyebrow ?? "",
    webStripText: row.web_strip_text ?? "",
    mobileBannerUrl: row.mobile_banner_url,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    promoCode: row.promo_code,
    cashbackRupees: cashbackPaise > 0 ? Math.round(cashbackPaise / 100) : 0,
    minOrderRupees: Math.round(minOrderPaise / 100),
    maxClaims: row.max_claims ?? null,
    claimsCount: row.claims_count ?? 0,
    geoScope: row.geo_scope,
    targetCities: row.target_cities ?? [],
    targetAreas: row.target_areas ?? [],
    showOnWebStrip: row.show_on_web_strip,
    showOnMobileBanner: row.show_on_mobile_banner,
    showOnSalonDetail: row.show_on_salon_detail,
    priority: row.priority,
    endsAt: row.ends_at ?? null,
  }
}

export function offerMatchesLocation(
  offer: Pick<GlammzoOffer, "geoScope" | "targetCities" | "targetAreas">,
  location: { city?: string | null; area?: string | null },
) {
  if (offer.geoScope === "nation") return true

  const city = normalizePlace(location.city)
  if (!city) return false

  const cities = offer.targetCities.map(normalizePlace).filter(Boolean)
  if (!cities.includes(city)) return false

  if (offer.geoScope === "cities") return true

  const area = normalizePlace(location.area)
  if (!area) return false
  const areas = offer.targetAreas.map(normalizePlace).filter(Boolean)
  return areas.includes(area)
}

function isOfferCurrentlyActive(row: GlammzoOfferRow, now = Date.now()) {
  if (row.starts_at) {
    const t = new Date(row.starts_at).getTime()
    if (!Number.isNaN(t) && t > now) return false
  }
  if (row.ends_at) {
    const t = new Date(row.ends_at).getTime()
    if (!Number.isNaN(t) && t < now) return false
  }
  if (
    row.max_claims != null &&
    Number(row.claims_count ?? 0) >= Number(row.max_claims)
  ) {
    return false
  }
  return true
}

const GLAMMZO_OFFER_SELECT_FULL =
  "id, title, subtitle, description, eyebrow, web_strip_text, mobile_banner_url, cta_label, cta_href, promo_code, cashback_paise, min_order_paise, max_claims, claims_count, geo_scope, target_cities, target_areas, show_on_web_strip, show_on_mobile_banner, show_on_salon_detail, priority, is_active, starts_at, ends_at"

/** Pre-migration schema (before max_claims / claims_count). */
const GLAMMZO_OFFER_SELECT_LEGACY =
  "id, title, subtitle, description, eyebrow, web_strip_text, mobile_banner_url, cta_label, cta_href, promo_code, cashback_paise, min_order_paise, geo_scope, target_cities, target_areas, show_on_web_strip, show_on_mobile_banner, show_on_salon_detail, priority, is_active, starts_at, ends_at"

function isMissingClaimsColumnError(message: string) {
  return /max_claims|claims_count/i.test(message) && /does not exist/i.test(message)
}

async function fetchActiveGlammzoOfferRows(): Promise<GlammzoOfferRow[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const admin = createAdminClient()
    const query = (columns: string) =>
      admin
        .from("glammzo_offers")
        .select(columns)
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50)

    let { data, error } = await query(GLAMMZO_OFFER_SELECT_FULL)

    if (error && isMissingClaimsColumnError(error.message)) {
      // CRM migration 131 (max_claims) not applied yet — still load offers.
      ;({ data, error } = await query(GLAMMZO_OFFER_SELECT_LEGACY))
    }

    if (error) {
      console.error("[glammzo-offers] fetch failed:", error.message)
      return []
    }

    return ((data ?? []) as unknown as GlammzoOfferRow[]).filter((row) =>
      isOfferCurrentlyActive({
        ...row,
        max_claims: row.max_claims ?? null,
        claims_count: row.claims_count ?? 0,
      }),
    )
  } catch (error) {
    console.error("[glammzo-offers] unexpected:", error)
    return []
  }
}

async function fetchActiveGlammzoOffers(): Promise<GlammzoOffer[]> {
  return (await fetchActiveGlammzoOfferRows()).map(mapRow)
}

export async function getGlammzoOffersForSalonDetail(location: {
  city?: string | null
  area?: string | null
}): Promise<GlammzoOffer[]> {
  const offers = await fetchActiveGlammzoOffers()
  return offers.filter(
    (offer) =>
      offer.showOnSalonDetail && offerMatchesLocation(offer, location),
  )
}

/** Explore / home mobile banner offers (image preferred). */
export async function getGlammzoOffersForMobileBanner(location: {
  city?: string | null
  area?: string | null
}): Promise<GlammzoOffer[]> {
  const offers = await fetchActiveGlammzoOffers()
  return offers.filter(
    (offer) =>
      offer.showOnMobileBanner &&
      Boolean(offer.mobileBannerUrl?.trim()) &&
      offerMatchesLocation(offer, location),
  )
}

/** Highest-priority web-strip offer for the visitor's browse city (or nationwide). */
export async function getGlammzoOfferForWebStrip(city?: string | null) {
  const offers = await fetchActiveGlammzoOffers()
  const matched = offers.filter(
    (offer) =>
      offer.showOnWebStrip &&
      offer.webStripText.trim().length > 0 &&
      offerMatchesLocation(offer, { city, area: null }),
  )
  return matched[0] ?? null
}

/** Active CMS offer with checkout cashback for this promo code. */
export async function getGlammzoCashbackOfferByCode(
  code: string,
): Promise<GlammzoOffer | null> {
  const normalized = normalizePromoCode(code)
  if (!normalized) return null

  const rows = await fetchActiveGlammzoOfferRows()
  const row = rows.find(
    (item) =>
      item.promo_code?.trim().toUpperCase() === normalized &&
      (item.cashback_paise ?? 0) > 0,
  )
  return row ? mapRow(row) : null
}

export async function getGlammzoOfferCashbackEligibility(input: {
  phone: string | null | undefined
  offerId: string
  code: string
}): Promise<PromoReservationResult | { ok: true } | {
  ok: false
  reason: "sign_in_required" | "already_used" | "reserved"
  message: string
}> {
  const phoneDigits = input.phone
    ? normalizeCustomerPhoneDigits(input.phone)
    : ""
  const code = normalizePromoCode(input.code)

  if (!phoneDigits) {
    return {
      ok: false,
      reason: "sign_in_required",
      message: `Sign in to apply ${code || "this offer"}.`,
    }
  }

  if (!isSupabaseConfigured()) {
    return { ok: true }
  }

  const supabase = createAdminClient()
  const marker = buildGlammzoOfferCashbackNoteMarker(input.offerId, code)

  const { data: cashbackRow } = await supabase
    .from("wallet_ledger")
    .select("id")
    .eq("phone_normalized", phoneDigits)
    .eq("reason", "cashback_glammzo_offer")
    .filter("meta->>offer_id", "eq", input.offerId)
    .limit(1)
    .maybeSingle()

  const { data: appointmentRows, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, status, customers!inner(phone_normalized)")
    .eq("customers.phone_normalized", phoneDigits)
    .is("deleted_at", null)
    .ilike("internal_notes", `%${marker}%`)

  if (appointmentError) {
    console.error(
      "[glammzo-offer-cashback] reservation lookup failed:",
      appointmentError.message,
    )
    if (cashbackRow) {
      return {
        ok: false,
        reason: "already_used",
        message: `You've already used ${code}. This Glammzo offer is one-time only.`,
      }
    }
    return { ok: true }
  }

  return evaluatePromoReservations(
    (appointmentRows ?? []).map((row) => ({
      status: String((row as { status: string }).status ?? ""),
    })),
    {
      alreadyUsed: `You've already used ${code}. This Glammzo offer is one-time only.`,
      reserved: `You've already applied ${code} on another booking. Complete or cancel that booking before using it again.`,
    },
    { permanentlyConsumed: Boolean(cashbackRow) },
  )
}
