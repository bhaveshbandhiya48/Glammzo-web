import { media } from "@/data/media"
import { formatSalonHours, isSalonOpenNow } from "@/lib/salons/business-hours"
import type {
  CrmSalonReviewRow,
  CrmSalonRow,
  CrmServiceRow,
  CrmStaffRow,
} from "@/lib/salons/crm-types"
import type {
  Salon,
  SalonAmenities,
  SalonCancellationPolicy,
  SalonReview,
  SalonReviewType,
  SalonService,
  SalonAmenityCategory,
  SalonTeamMember,
} from "@/types/salon"

const LUCIDE_AMENITY_ICON_IDS = new Set([
  "Wifi",
  "ParkingCircle",
  "Coffee",
  "CreditCard",
  "Armchair",
  "Accessibility",
  "Baby",
  "Sparkles",
])

const FALLBACK_IMAGES = Object.values(media.salons)

function resolveJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null
  }

  return Array.isArray(value) ? (value[0] ?? null) : value
}

function resolveCustomerReviewName(
  customer:
    | {
        full_name?: string | null
        first_name?: string | null
        last_name?: string | null
      }
    | null
    | undefined,
) {
  if (!customer) {
    return "Customer"
  }

  if (customer.full_name?.trim()) {
    return customer.full_name.trim()
  }

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim()
  return name || "Customer"
}

function guestIdFromCustomerId(customerId: string | null | undefined) {
  if (!customerId) {
    return "guest"
  }

  return `GZ-${customerId.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

function hashString(value: string): number {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    hash = (hash << 5) - hash + code
    hash = hash | 0
  }

  return Math.abs(hash)
}

function fallbackImageForSalon(salonId: string): string {
  return FALLBACK_IMAGES[hashString(salonId) % FALLBACK_IMAGES.length] ?? media.salons.s1
}

function formatAddress(row: CrmSalonRow): string {
  return [
    row.address_line1,
    row.address_line2,
    row.city,
    row.state,
    row.postal_code,
  ]
    .filter(Boolean)
    .join(", ")
}

function parseServiceIncludes(description: string | null): string[] {
  if (!description?.trim()) return []
  const lines = description
    .split(/\n|•|·|;/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length > 1) return lines.slice(0, 6)
  if (lines.length === 1 && lines[0]!.length > 80) {
    return [lines[0]!]
  }
  return lines
}

function relationName(
  relation: { name: string } | { name: string }[] | null | undefined
): string | undefined {
  if (!relation) return undefined
  if (Array.isArray(relation)) return relation[0]?.name
  return relation.name
}

function fallbackServiceImage(serviceId: string): string {
  const pool = Object.values(media.categories)
  return pool[hashString(serviceId) % pool.length] ?? media.categories.spa
}

function mapService(row: CrmServiceRow): SalonService {
  const category = relationName(row.service_categories) ?? "General"
  const imageUrl = row.image_url?.trim() || fallbackServiceImage(row.id)
  return {
    id: row.id,
    name: row.name,
    durationMin: row.duration_minutes,
    price: Number.parseFloat(row.price) || 0,
    category,
    imageUrl,
    includes: parseServiceIncludes(row.description),
  }
}

function mapStaff(row: CrmStaffRow): SalonTeamMember {
  return {
    id: row.id,
    name: row.full_name,
    role: relationName(row.staff_roles) ?? row.designation ?? "Specialist",
    imageUrl: row.avatar_url ?? media.testimonials.t1,
    specialties: row.specialties ?? [],
  }
}

function parseAmenities(settings: unknown): SalonAmenities | undefined {
  if (!settings || typeof settings !== "object") return undefined
  const raw = settings as {
    amenities?: { enabled?: unknown; categories?: unknown[] } | undefined
  }

  if (raw.amenities?.enabled !== true) return undefined

  const rawCategories = raw.amenities?.categories
  if (!Array.isArray(rawCategories)) return undefined

  const categories: SalonAmenityCategory[] = rawCategories
    .map((c) => {
      const icon = String((c as { icon?: unknown }).icon ?? "").trim()
      const name = String((c as { name?: unknown }).name ?? "").trim()
      const visible = (c as { visible?: unknown }).visible === true

      const itemsRaw = (c as { items?: unknown }).items
      const items = Array.isArray(itemsRaw)
        ? itemsRaw.map((it) => String(it ?? "").trim()).filter(Boolean)
        : undefined
      // Backwards compatible: older data may have emoji. Keep it, but prefer known lucide ids.
      const normalizedIcon = LUCIDE_AMENITY_ICON_IDS.has(icon) ? icon : "Sparkles"
      return { icon: normalizedIcon, name, visible, items }
    })
    .filter((c) => c.visible === true)

  if (categories.length === 0) return undefined
  return { categories }
}

function parseCancellationPolicy(settings: unknown): SalonCancellationPolicy | undefined {
  if (!settings || typeof settings !== "object") return undefined
  const raw = settings as {
    policies?: { cancellation?: { freeCancelHours?: unknown } | undefined } | undefined
  }

  const cancellation = raw.policies?.cancellation
  if (!cancellation || typeof cancellation !== "object") return undefined

  const active = (cancellation as { active?: unknown }).active === true
  if (!active) return undefined

  const freeCancelHoursRaw = (cancellation as { freeCancelHours?: unknown }).freeCancelHours
  if (typeof freeCancelHoursRaw !== "number" || !Number.isFinite(freeCancelHoursRaw)) return undefined

  const freeCancelHours = Math.max(0, Math.min(Math.round(freeCancelHoursRaw), 168))

  const cancellationFeePercentRaw = (cancellation as { cancellationFeePercent?: unknown }).cancellationFeePercent
  const cancellationFeePercent =
    typeof cancellationFeePercentRaw === "number" && Number.isFinite(cancellationFeePercentRaw)
      ? Math.max(0, Math.min(Math.round(cancellationFeePercentRaw), 100))
      : undefined

  const depositRequired =
    typeof (cancellation as { depositRequired?: unknown }).depositRequired === "boolean"
      ? (cancellation as { depositRequired?: boolean }).depositRequired
      : undefined

  const depositPercentRaw = (cancellation as { depositPercent?: unknown }).depositPercent
  const depositPercent =
    typeof depositPercentRaw === "number" && Number.isFinite(depositPercentRaw)
      ? Math.max(0, Math.min(Math.round(depositPercentRaw), 100))
      : undefined

  return {
    active: true,
    freeCancelHours,
    ...(cancellationFeePercent !== undefined ? { cancellationFeePercent } : {}),
    ...(depositRequired !== undefined ? { depositRequired } : {}),
    ...(depositPercent !== undefined ? { depositPercent } : {}),
  }
}

export function mapCrmSalonToWeb(
  row: CrmSalonRow,
  services: CrmServiceRow[],
  staff: CrmStaffRow[],
  reviews: CrmSalonReviewRow[] = [],
): Salon {
  const activeServices = services
    .filter((s) => s.is_active)
    .map(mapService)
    .sort((a, b) => a.price - b.price)

  const activeStaff = staff
    .filter((s) => s.is_active && s.is_bookable)
    .map(mapStaff)

  const area = row.city?.trim() || "Bengaluru"
  const priceFrom =
    activeServices.length > 0
      ? Math.min(...activeServices.map((s) => s.price))
      : 0

  const listUrl = row.list_image_url?.trim() || null
  const coverUrl = row.cover_image_url?.trim() || null
  const fallback = fallbackImageForSalon(row.id)
  const imageUrl = listUrl || coverUrl || fallback
  const coverImageUrl = coverUrl || listUrl || fallback
  const description =
    activeServices[0]?.includes[0] ??
    `Book trusted services at ${row.name} in ${area}. Transparent pricing and easy online booking.`

  const latitude =
    typeof row.latitude === "number" && Number.isFinite(row.latitude) ? row.latitude : undefined
  const longitude =
    typeof row.longitude === "number" && Number.isFinite(row.longitude) ? row.longitude : undefined

  const REVIEW_TYPES: SalonReviewType[] = [
    "Skill & technique",
    "Professionalism",
    "Communication",
    "Hospitality",
    "Overall experience",
  ]

  const customerReviews: SalonReview[] = reviews.map((r) => {
    const reviewType = REVIEW_TYPES.includes(r.review_type as SalonReviewType)
      ? (r.review_type as SalonReviewType)
      : "Overall experience"

    const customer = resolveJoin(r.customer)
    const staff = resolveJoin(r.staff)
    const service = resolveJoin(r.service)

    const staffRole =
      (staff?.staff_roles &&
        (Array.isArray(staff.staff_roles)
          ? staff.staff_roles[0]?.name
          : staff.staff_roles.name)) ||
      staff?.designation ||
      null

    return {
      id: r.id,
      userId: guestIdFromCustomerId(r.customer_id),
      authorName: resolveCustomerReviewName(customer),
      reviewType,
      rating: r.rating,
      date: r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" })
        : "",
      serviceName: service?.name ?? "Service",
      staffMember: {
        name: staff?.full_name ?? "Staff",
        role: staffRole ?? "Specialist",
      },
      comment: r.comment,
      verified: r.verified,
    }
  })

  const ratingCount = customerReviews.length
  const ratingAvg =
    ratingCount > 0
      ? customerReviews.reduce((sum, rr) => sum + (rr.rating ?? 0), 0) / ratingCount
      : 0

  const amenities = parseAmenities(row.settings)
  const cancellationPolicy = parseCancellationPolicy(row.settings)
  const featuredUntil = row.featured_until ? new Date(row.featured_until).getTime() : null
  const isFeatured =
    row.is_featured === true && (featuredUntil == null || featuredUntil > Date.now())

  return {
    id: row.slug || row.id,
    crmSalonId: row.id,
    name: row.name,
    area,
    imageUrl,
    coverImageUrl,
    rating: ratingAvg,
    reviews: ratingCount,
    distanceKm: 0,
    latitude,
    longitude,
    isFeatured,
    isOpenNow: isSalonOpenNow(row.settings, row.timezone || "Asia/Kolkata"),
    priceFrom,
    description,
    address: formatAddress(row) || area,
    phone: row.phone?.trim() || "Contact salon for details",
    hours: formatSalonHours(row.settings),
    services: activeServices,
    gallery: (() => {
      const urls = [coverUrl, listUrl].filter((url): url is string => Boolean(url))
      return urls.length > 0 ? urls : imageUrl ? [imageUrl] : []
    })(),
    customerReviews,
    team: activeStaff,
    amenities,
    cancellationPolicy,
  }
}
