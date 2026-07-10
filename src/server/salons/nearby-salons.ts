import "server-only"

import { cache } from "react"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"
import { buildFullAddress } from "@/lib/maps/build-full-address"
import {
  DEFAULT_NEARBY_RADIUS_KM,
  MAX_NEARBY_RADIUS_KM,
  NEARBY_SALON_LIMIT,
} from "@/lib/maps/config"
import { boundingBoxDeltas, haversineKm } from "@/lib/maps/haversine"
import type { NearbySalonRecord, NearbySalonsRequest, NearbySalonsResponse } from "@/lib/maps/nearby-salon.types"
import { isSalonOpenNow } from "@/lib/salons/business-hours"
import type { CrmSalonRow, CrmServiceRow } from "@/lib/salons/crm-types"

const SALON_SELECT =
  "id, name, slug, phone, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, list_image_url, cover_image_url, logo_url, settings, timezone, listing_status"

const SERVICE_SELECT =
  "id, salon_id, name, duration_minutes, price, is_active, service_categories(name)"

function clampRadius(radiusKm?: number) {
  const value = radiusKm ?? DEFAULT_NEARBY_RADIUS_KM
  return Math.min(MAX_NEARBY_RADIUS_KM, Math.max(1, value))
}

function readAreaFromSettings(settings: unknown) {
  if (!settings || typeof settings !== "object") {
    return ""
  }

  const record = settings as Record<string, unknown>
  const onboarding = record.onboarding

  if (onboarding && typeof onboarding === "object") {
    const area = (onboarding as Record<string, unknown>).area
    if (typeof area === "string") {
      return area.trim()
    }
  }

  return ""
}

function averageRating(reviews: Array<{ rating: number }>) {
  if (reviews.length === 0) {
    return { rating: 0, count: 0 }
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return { rating: Math.round((total / reviews.length) * 10) / 10, count: reviews.length }
}

function matchesSearch(
  salon: CrmSalonRow,
  area: string,
  serviceNames: string[],
  query: string,
) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  const haystack = [
    salon.name,
    salon.city,
    salon.state,
    salon.address_line1,
    salon.address_line2,
    area,
    ...serviceNames,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(normalized)
}

async function fetchReviewStats(salonIds: string[]) {
  if (salonIds.length === 0) {
    return new Map<string, { rating: number; count: number }>()
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("salon_reviews")
    .select("salon_id, rating")
    .in("salon_id", salonIds)

  if (error) {
    console.error("[nearby-salons] review stats failed:", error.message)
    return new Map<string, { rating: number; count: number }>()
  }

  const grouped = new Map<string, Array<{ rating: number }>>()

  for (const row of data ?? []) {
    const salonId = (row as { salon_id: string }).salon_id
    const rating = Number((row as { rating: number }).rating)
    const list = grouped.get(salonId) ?? []
    list.push({ rating })
    grouped.set(salonId, list)
  }

  return new Map(
    Array.from(grouped.entries()).map(([salonId, reviews]) => [salonId, averageRating(reviews)]),
  )
}

async function fetchActiveServices(salonIds: string[]) {
  if (salonIds.length === 0) {
    return new Map<string, CrmServiceRow[]>()
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .in("salon_id", salonIds)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[nearby-salons] services fetch failed:", error.message)
    return new Map<string, CrmServiceRow[]>()
  }

  const bySalon = new Map<string, CrmServiceRow[]>()

  for (const row of (data ?? []) as CrmServiceRow[]) {
    const list = bySalon.get(row.salon_id) ?? []
    list.push(row)
    bySalon.set(row.salon_id, list)
  }

  return bySalon
}

function mapNearbySalon(
  row: CrmSalonRow,
  distanceKm: number,
  reviewStats: { rating: number; count: number },
  services: CrmServiceRow[],
): NearbySalonRecord {
  const area = readAreaFromSettings(row.settings)
  const timezone = row.timezone || "Asia/Kolkata"
  const openNow = isSalonOpenNow(row.settings, timezone)
  const topServices = services.slice(0, 4).map((service) => ({
    id: service.id,
    name: service.name,
    price: Number.parseFloat(service.price) || 0,
    durationMin: service.duration_minutes,
    category: Array.isArray(service.service_categories)
      ? service.service_categories[0]?.name ?? "General"
      : service.service_categories?.name ?? "General",
  }))
  const priceFrom = topServices.length
    ? Math.min(...topServices.map((service) => service.price))
    : 0

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    area: area || row.city || "",
    city: row.city ?? "",
    state: row.state ?? "",
    country: row.country ?? "IN",
    fullAddress: buildFullAddress({
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
    }),
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    imageUrl: row.list_image_url || row.logo_url || "",
    coverImageUrl: row.cover_image_url || row.list_image_url || "",
    rating: reviewStats.rating,
    reviewCount: reviewStats.count,
    priceFrom,
    isOpenNow: openNow,
    distanceKm,
    services: topServices,
  }
}

export const fetchNearbySalons = cache(async (
  input: NearbySalonsRequest,
): Promise<NearbySalonsResponse> => {
  const latitude = Number(input.latitude)
  const longitude = Number(input.longitude)
  const radiusKm = clampRadius(input.radiusKm)
  const limit = Math.min(input.limit ?? NEARBY_SALON_LIMIT, NEARBY_SALON_LIMIT)
  const query = input.query?.trim() ?? ""

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      salons: [],
      center: { latitude: 0, longitude: 0 },
      radiusKm,
      total: 0,
    }
  }

  if (!isSupabaseConfigured()) {
    return {
      salons: [],
      center: { latitude, longitude },
      radiusKm,
      total: 0,
    }
  }

  const { latDelta, lngDelta } = boundingBoxDeltas(latitude, radiusKm)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("salons")
    .select(SALON_SELECT)
    .eq("is_active", true)
    .eq("status", "active")
    .eq("listing_status", "published")
    .is("deleted_at", null)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .gte("latitude", latitude - latDelta)
    .lte("latitude", latitude + latDelta)
    .gte("longitude", longitude - lngDelta)
    .lte("longitude", longitude + lngDelta)

  if (error) {
    console.error("[nearby-salons] salon query failed:", error.message)
    return {
      salons: [],
      center: { latitude, longitude },
      radiusKm,
      total: 0,
    }
  }

  const rows = (data ?? []) as CrmSalonRow[]
  const withinRadius = rows
    .map((row) => {
      const salonLat = Number(row.latitude)
      const salonLng = Number(row.longitude)

      if (!Number.isFinite(salonLat) || !Number.isFinite(salonLng)) {
        return null
      }

      const distanceKm = haversineKm(latitude, longitude, salonLat, salonLng)
      if (distanceKm > radiusKm) {
        return null
      }

      return { row, distanceKm }
    })
    .filter((item): item is { row: CrmSalonRow; distanceKm: number } => item !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  const salonIds = withinRadius.map((item) => item.row.id)
  const [reviewStats, servicesBySalon] = await Promise.all([
    fetchReviewStats(salonIds),
    fetchActiveServices(salonIds),
  ])

  const salons = withinRadius
    .map(({ row, distanceKm }) => {
      const services = servicesBySalon.get(row.id) ?? []
      const area = readAreaFromSettings(row.settings)
      const serviceNames = services.map((service) => service.name)

      if (!matchesSearch(row, area, serviceNames, query)) {
        return null
      }

      return mapNearbySalon(
        row,
        distanceKm,
        reviewStats.get(row.id) ?? { rating: 0, count: 0 },
        services,
      )
    })
    .filter((salon): salon is NearbySalonRecord => salon !== null)
    .slice(0, limit)

  return {
    salons,
    center: { latitude, longitude },
    radiusKm,
    total: salons.length,
  }
})
