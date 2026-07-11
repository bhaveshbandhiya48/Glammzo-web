import "server-only"

import { cache } from "react"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"
import type { CrmSalonReviewRow, CrmSalonRow, CrmServiceRow, CrmStaffRow } from "@/lib/salons/crm-types"
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

const SERVICE_SELECT_WITH_IMAGE =
  "id, salon_id, name, description, image_url, duration_minutes, price, is_active, service_categories(name)"

const SERVICE_SELECT_WITHOUT_IMAGE =
  "id, salon_id, name, description, duration_minutes, price, is_active, service_categories(name)"

function isMissingServiceImageColumn(message: string) {
  return message.toLowerCase().includes("image_url")
}

async function fetchServicesForSalons(salonIds: string[]): Promise<CrmServiceRow[]> {
  if (salonIds.length === 0) return []

  const supabase = createAdminClient()
  let { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT_WITH_IMAGE)
    .in("salon_id", salonIds)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })

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

  return (data ?? []).map((row) => ({
    ...(row as Omit<CrmServiceRow, "image_url">),
    image_url: (row as CrmServiceRow).image_url ?? null,
  }))
}

async function fetchStaffForSalons(salonIds: string[]): Promise<CrmStaffRow[]> {
  if (salonIds.length === 0) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("staff")
    .select(
      "id, salon_id, full_name, designation, avatar_url, specialties, is_active, is_bookable, staff_roles(name)"
    )
    .in("salon_id", salonIds)
    .eq("is_active", true)
    .eq("is_bookable", true)
    .is("deleted_at", null)

  if (error) {
    console.error("[salons] Failed to fetch CRM staff:", error.message)
    return []
  }

  return (data ?? []) as unknown as CrmStaffRow[]
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

async function mapSalonRow(row: CrmSalonRow): Promise<Salon> {
  const [services, staff, reviews] = await Promise.all([
    fetchServicesForSalons([row.id]),
    fetchStaffForSalons([row.id]),
    fetchReviewsForSalons([row.id]),
  ])

  return mapCrmSalonToWeb(row, services, staff, reviews)
}

export const fetchCrmSalons = cache(async (): Promise<Salon[]> => {
  if (!isSupabaseConfigured()) return []

  try {
    const salonRows = await fetchPublishedSalonRows()
    if (salonRows.length === 0) return []

    const salonIds = salonRows.map((s) => s.id)
    const [serviceRows, staffRows, reviewRows] = await Promise.all([
      fetchServicesForSalons(salonIds),
      fetchStaffForSalons(salonIds),
      fetchReviewsForSalons(salonIds),
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

    return salonRows.map((row) =>
      mapCrmSalonToWeb(
        row,
        servicesBySalon.get(row.id) ?? [],
        staffBySalon.get(row.id) ?? [],
        reviewsBySalon.get(row.id) ?? []
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
