import "server-only"

import { cache } from "react"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"
import type {
  CrmMarketplaceProfileRow,
  CrmSalonGalleryImageRow,
  CrmSalonReviewRow,
  CrmSalonRow,
  CrmOfferRow,
  CrmPackageRow,
  CrmServiceRow,
  CrmStaffRow,
} from "@/lib/salons/crm-types"
import { mapCrmSalonToWeb } from "@/lib/salons/map-crm-salon"
import type { Salon } from "@/types/salon"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const SALON_SELECT =
  "id, name, slug, email, phone, address_line1, address_line2, city, state, postal_code, country, timezone, logo_url, list_image_url, cover_image_url, latitude, longitude, settings, is_active, status, listing_status, is_featured, featured_until"

type FetchSalonOptions = {
  allowUnpublished?: boolean
}

async function fetchSalonRowByIdentifier(
  identifier: string,
  options: FetchSalonOptions = {},
): Promise<CrmSalonRow | null> {
  const supabase = createAdminClient()
  let query = supabase
    .from("salons")
    .select(SALON_SELECT)
    .eq("is_active", true)
    .eq("status", "active")
    .is("deleted_at", null)

  if (!options.allowUnpublished) {
    query = query.eq("listing_status", "published")
  }

  if (UUID_RE.test(identifier)) {
    query = query.eq("id", identifier)
  } else {
    query = query.eq("slug", identifier)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error("[salons] Failed to fetch salon:", error.message)
    return null
  }

  return (data as CrmSalonRow | null) ?? null
}

async function fetchPublishedSalonRows(): Promise<CrmSalonRow[]> {
  const supabase = createAdminClient()
  if (process.env.NODE_ENV === "production") {
    const host = (() => {
      try {
        return new URL(process.env.SUPABASE_URL ?? "").host
      } catch {
        return "invalid-SUPABASE_URL"
      }
    })()
    console.info(`[salons] Reading published listings from ${host}`)
  }

  const { data, error } = await supabase
    .from("salons")
    .select(SALON_SELECT)
    .eq("is_active", true)
    .eq("status", "active")
    .eq("listing_status", "published")
    .is("deleted_at", null)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[salons] Failed to fetch CRM salons:", error.message)
    return []
  }

  return (data ?? []) as CrmSalonRow[]
}

const SERVICE_SELECT_WITH_MARKETPLACE =
  "id, salon_id, name, description, image_url, duration_minutes, price, is_active, recommended_for, before_care, after_care, service_categories(name, is_active, sort_order), service_add_ons!service_add_ons_service_id_fkey(add_on_service_id, sort_order)"

const SERVICE_SELECT_WITH_IMAGE =
  "id, salon_id, name, description, image_url, duration_minutes, price, is_active, service_categories(name, is_active, sort_order)"

const SERVICE_SELECT_WITHOUT_IMAGE =
  "id, salon_id, name, description, duration_minutes, price, is_active, service_categories(name, is_active, sort_order)"

function isMissingServiceImageColumn(message: string) {
  return message.toLowerCase().includes("image_url")
}

function isMissingServiceMarketplaceColumns(message: string) {
  const lower = message.toLowerCase()
  return (
    lower.includes("recommended_for") ||
    lower.includes("before_care") ||
    lower.includes("after_care") ||
    lower.includes("service_add_ons")
  )
}

function normalizeServiceRows(rows: unknown[]): CrmServiceRow[] {
  return rows.map((row) => ({
    ...(row as Omit<CrmServiceRow, "image_url">),
    image_url: (row as CrmServiceRow).image_url ?? null,
  }))
}

async function fetchServicesForSalons(salonIds: string[]): Promise<CrmServiceRow[]> {
  if (salonIds.length === 0) return []

  const supabase = createAdminClient()
  let select = SERVICE_SELECT_WITH_MARKETPLACE
  let { data, error } = await supabase
    .from("services")
    .select(select)
    .in("salon_id", salonIds)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })

  if (error && isMissingServiceMarketplaceColumns(error.message)) {
    select = SERVICE_SELECT_WITH_IMAGE
    ;({ data, error } = await supabase
      .from("services")
      .select(select)
      .in("salon_id", salonIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }))
  }

  if (error && isMissingServiceImageColumn(error.message)) {
    const fallback = await supabase
      .from("services")
      .select(SERVICE_SELECT_WITHOUT_IMAGE)
      .in("salon_id", salonIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })

    if (fallback.error) {
      console.error("[salons] Failed to fetch CRM services:", fallback.error.message)
      return []
    }

    return (fallback.data ?? []).map((row) => ({
      ...(row as Omit<CrmServiceRow, "image_url">),
      image_url: null,
    }))
  }

  if (error) {
    console.error("[salons] Failed to fetch CRM services:", error.message)
    return []
  }

  return normalizeServiceRows(data ?? [])
}

async function fetchStaffForSalons(salonIds: string[]): Promise<CrmStaffRow[]> {
  if (salonIds.length === 0) return []

  const supabase = createAdminClient()
  const [staffResult, categoryResult] = await Promise.all([
    supabase
      .from("staff")
      .select(
        "id, salon_id, full_name, designation, avatar_url, specialties, is_active, is_bookable, staff_roles(name)"
      )
      .in("salon_id", salonIds)
      .eq("is_active", true)
      .eq("is_bookable", true)
      .is("deleted_at", null),
    supabase
      .from("staff_service_categories")
      .select("staff_id, category_id")
      .in("salon_id", salonIds),
  ])

  if (staffResult.error) {
    console.error("[salons] Failed to fetch CRM staff:", staffResult.error.message)
    return []
  }

  if (categoryResult.error) {
    console.error(
      "[salons] Failed to fetch staff categories:",
      categoryResult.error.message,
    )
  }

  const categoriesByStaff = new Map<string, string[]>()
  for (const row of categoryResult.data ?? []) {
    const assignment = row as { staff_id: string; category_id: string }
    categoriesByStaff.set(assignment.staff_id, [
      ...(categoriesByStaff.get(assignment.staff_id) ?? []),
      assignment.category_id,
    ])
  }

  return (staffResult.data ?? []).map((row) => ({
    ...(row as unknown as Omit<CrmStaffRow, "category_ids">),
    category_ids: categoriesByStaff.get((row as { id: string }).id) ?? [],
  }))
}

async function fetchMarketplaceProfilesForSalons(
  salonIds: string[],
): Promise<CrmMarketplaceProfileRow[]> {
  if (salonIds.length === 0) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("salon_marketplace_profiles")
    .select(
      "salon_id, short_description, long_description, languages, amenities, policies, metadata",
    )
    .in("salon_id", salonIds)

  if (error) {
    console.error("[salons] Failed to fetch Marketplace profiles:", error.message)
    return []
  }

  return (data ?? []) as CrmMarketplaceProfileRow[]
}

async function fetchGalleryForSalons(
  salonIds: string[],
): Promise<CrmSalonGalleryImageRow[]> {
  if (salonIds.length === 0) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("salon_gallery_images")
    .select("id, salon_id, url, sort_order, alt")
    .in("salon_id", salonIds)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[salons] Failed to fetch canonical gallery:", error.message)
    return []
  }

  return (data ?? []) as CrmSalonGalleryImageRow[]
}

const REVIEW_SELECT =
  "id, salon_id, customer_id, appointment_id, staff_id, service_id, rating, review_type, comment, verified, created_at, customer:customers(full_name, first_name, last_name), staff:staff(full_name, designation, staff_roles(name)), service:services(name)"

async function fetchReviewsForSalons(salonIds: string[]): Promise<CrmSalonReviewRow[]> {
  if (salonIds.length === 0) return []

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("salon_reviews")
      .select(REVIEW_SELECT)
      .in("salon_id", salonIds)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[salons] Failed to fetch CRM reviews:", error.message)
      return []
    }

    return (data ?? []) as CrmSalonReviewRow[]
  } catch (err) {
    // Until the CRM migration is deployed, the table may not exist yet.
    console.error("[salons] CRM reviews fetch error:", err)
    return []
  }
}

const PACKAGE_SELECT_EXTENDED =
  "id, salon_id, name, description, short_description, detailed_description, image_url, package_price, original_price, amount_saved, discount_percentage, total_duration, badge, is_featured, marketplace_visible, show_compare_price, show_savings, allow_online_booking, service_preview_count, is_active, status, sort_order, salon_package_items(id, service_id, quantity, sort_order, services(name, price, duration_minutes))"

const PACKAGE_SELECT_WITH_COMPARE =
  "id, salon_id, name, description, image_url, package_price, original_price, show_compare_price, is_active, sort_order, salon_package_items(id, service_id, quantity, services(name, price))"

const PACKAGE_SELECT_BASE =
  "id, salon_id, name, description, package_price, is_active, sort_order, salon_package_items(id, service_id, quantity, services(name, price))"

function isMissingPackageExtendedColumns(message: string) {
  const lower = message.toLowerCase()
  return (
    lower.includes("short_description") ||
    lower.includes("detailed_description") ||
    lower.includes("badge") ||
    lower.includes("marketplace_visible") ||
    lower.includes("show_savings") ||
    lower.includes("allow_online_booking") ||
    lower.includes("service_preview_count") ||
    lower.includes("total_duration") ||
    lower.includes("amount_saved") ||
    lower.includes("discount_percentage") ||
    lower.includes("status") ||
    lower.includes("is_featured")
  )
}

function isMissingPackageCompareColumns(message: string) {
  const lower = message.toLowerCase()
  return (
    lower.includes("image_url") ||
    lower.includes("original_price") ||
    lower.includes("show_compare_price")
  )
}

async function fetchPackagesForSalons(salonIds: string[]): Promise<CrmPackageRow[]> {
  if (salonIds.length === 0) return []

  try {
    const supabase = createAdminClient()
    let { data, error } = await supabase
      .from("salon_packages")
      .select(PACKAGE_SELECT_EXTENDED)
      .in("salon_id", salonIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })

    if (error && isMissingPackageExtendedColumns(error.message)) {
      const compareFallback = await supabase
        .from("salon_packages")
        .select(PACKAGE_SELECT_WITH_COMPARE)
        .in("salon_id", salonIds)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })

      data = compareFallback.data as typeof data
      error = compareFallback.error
    }

    if (error && isMissingPackageCompareColumns(error.message)) {
      const fallback = await supabase
        .from("salon_packages")
        .select(PACKAGE_SELECT_BASE)
        .in("salon_id", salonIds)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })

      if (fallback.error) {
        console.error("[salons] Failed to fetch CRM packages:", fallback.error.message)
        return []
      }

      return ((fallback.data ?? []) as Omit<CrmPackageRow, "image_url" | "original_price" | "show_compare_price">[]).map(
        (row) => ({
          ...row,
          image_url: null,
          original_price: null,
          show_compare_price: true,
        }),
      )
    }

    if (error) {
      console.error("[salons] Failed to fetch CRM packages:", error.message)
      return []
    }

    return (data ?? []) as CrmPackageRow[]
  } catch (err) {
    console.error("[salons] CRM packages fetch error:", err)
    return []
  }
}

async function fetchOffersForSalons(salonIds: string[]): Promise<CrmOfferRow[]> {
  if (salonIds.length === 0) return []

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("salon_offers")
      .select(
        "id, salon_id, code, title, description, discount_type, discount_value, applies_to, starts_at, ends_at, max_redemptions, redemption_count, is_active, salon_offer_services(service_id)",
      )
      .in("salon_id", salonIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[salons] Failed to fetch CRM offers:", error.message)
      return []
    }

    return (data ?? []) as CrmOfferRow[]
  } catch (err) {
    console.error("[salons] CRM offers fetch error:", err)
    return []
  }
}

async function mapSalonRow(row: CrmSalonRow): Promise<Salon> {
  const [services, staff, reviews, packages, offers, profiles, gallery] =
    await Promise.all([
    fetchServicesForSalons([row.id]),
    fetchStaffForSalons([row.id]),
    fetchReviewsForSalons([row.id]),
    fetchPackagesForSalons([row.id]),
    fetchOffersForSalons([row.id]),
    fetchMarketplaceProfilesForSalons([row.id]),
    fetchGalleryForSalons([row.id]),
  ])

  return mapCrmSalonToWeb(
    row,
    services,
    staff,
    reviews,
    packages,
    offers,
    profiles[0] ?? null,
    gallery,
  )
}

export const fetchCrmSalons = cache(async (): Promise<Salon[]> => {
  if (!isSupabaseConfigured()) return []

  try {
    const salonRows = await fetchPublishedSalonRows()
    if (salonRows.length === 0) return []

    const salonIds = salonRows.map((s) => s.id)
    const [
      serviceRows,
      staffRows,
      reviewRows,
      packageRows,
      offerRows,
      profileRows,
      galleryRows,
    ] = await Promise.all([
      fetchServicesForSalons(salonIds),
      fetchStaffForSalons(salonIds),
      fetchReviewsForSalons(salonIds),
      fetchPackagesForSalons(salonIds),
      fetchOffersForSalons(salonIds),
      fetchMarketplaceProfilesForSalons(salonIds),
      fetchGalleryForSalons(salonIds),
    ])

    const servicesBySalon = new Map<string, CrmServiceRow[]>()
    for (const service of serviceRows) {
      const list = servicesBySalon.get(service.salon_id) ?? []
      list.push(service)
      servicesBySalon.set(service.salon_id, list)
    }

    const staffBySalon = new Map<string, CrmStaffRow[]>()
    for (const member of staffRows) {
      const list = staffBySalon.get(member.salon_id) ?? []
      list.push(member)
      staffBySalon.set(member.salon_id, list)
    }

    const reviewsBySalon = new Map<string, CrmSalonReviewRow[]>()
    for (const review of reviewRows) {
      const list = reviewsBySalon.get(review.salon_id) ?? []
      list.push(review)
      reviewsBySalon.set(review.salon_id, list)
    }

    const packagesBySalon = new Map<string, CrmPackageRow[]>()
    for (const pkg of packageRows) {
      const list = packagesBySalon.get(pkg.salon_id) ?? []
      list.push(pkg)
      packagesBySalon.set(pkg.salon_id, list)
    }

    const offersBySalon = new Map<string, CrmOfferRow[]>()
    for (const offer of offerRows) {
      const list = offersBySalon.get(offer.salon_id) ?? []
      list.push(offer)
      offersBySalon.set(offer.salon_id, list)
    }

    const profilesBySalon = new Map(
      profileRows.map((profile) => [profile.salon_id, profile]),
    )
    const galleryBySalon = new Map<string, CrmSalonGalleryImageRow[]>()
    for (const image of galleryRows) {
      const list = galleryBySalon.get(image.salon_id) ?? []
      list.push(image)
      galleryBySalon.set(image.salon_id, list)
    }

    return salonRows.map((row) =>
      mapCrmSalonToWeb(
        row,
        servicesBySalon.get(row.id) ?? [],
        staffBySalon.get(row.id) ?? [],
        reviewsBySalon.get(row.id) ?? [],
        packagesBySalon.get(row.id) ?? [],
        offersBySalon.get(row.id) ?? [],
        profilesBySalon.get(row.id) ?? null,
        galleryBySalon.get(row.id) ?? [],
      )
    )
  } catch (err) {
    console.error("[salons] CRM fetch error:", err)
    return []
  }
})

export const fetchCrmSalonById = cache(
  async (id: string, options: FetchSalonOptions = {}): Promise<Salon | null> => {
    if (!options.allowUnpublished) {
      const salons = await fetchCrmSalons()
      const match = salons.find((s) => s.id === id)

      if (match) {
        return match
      }
    }

    if (!isSupabaseConfigured()) {
      return null
    }

    try {
      const row = await fetchSalonRowByIdentifier(id, options)

      if (!row) {
        return null
      }

      return mapSalonRow(row)
    } catch {
      return null
    }
  },
)
