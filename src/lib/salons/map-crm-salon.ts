import { media } from "@/data/media"
import { parseSalonCoordinate } from "@/lib/salon-coordinates"
import { formatSalonHours, isSalonOpenNow } from "@/lib/salons/business-hours"
import { buildSalonGalleryImages } from "@/lib/salons/salon-card-images"
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
import { filterBookableOffers } from "@/lib/salons/offer-utils"
import { resolveSalonArea } from "@/lib/salons/resolve-salon-area"
import type {
  Salon,
  SalonAmenities,
  SalonCancellationPolicy,
  SalonOffer,
  SalonPackage,
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

function safeExternalUrl(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
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

function relationCategory(
  relation:
    | { name: string; is_active?: boolean; sort_order?: number }
    | { name: string; is_active?: boolean; sort_order?: number }[]
    | null
    | undefined,
) {
  const row = resolveJoin(relation)
  if (!row?.name?.trim()) {
    return null
  }

  if (row.is_active === false) {
    return null
  }

  return {
    name: row.name.trim(),
    sortOrder: row.sort_order ?? 0,
  }
}

function mapService(row: CrmServiceRow): SalonService | null {
  const category = relationCategory(row.service_categories)
  if (!category) {
    return null
  }
  const imageUrl = row.image_url?.trim() || fallbackServiceImage(row.id)
  const addOnIds = [...(row.service_add_ons ?? [])]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((entry) => entry.add_on_service_id)

  return {
    id: row.id,
    name: row.name,
    durationMin: row.duration_minutes,
    price: Number.parseFloat(row.price) || 0,
    category: category.name,
    categorySortOrder: category.sortOrder,
    imageUrl,
    description: row.description?.trim() || undefined,
    includes: parseServiceIncludes(row.description),
    recommendedFor: row.recommended_for?.length ? row.recommended_for : undefined,
    beforeCare: row.before_care?.trim() || undefined,
    afterCare: row.after_care?.trim() || undefined,
    addOnIds: addOnIds.length > 0 ? addOnIds : undefined,
  }
}

function isMarketplaceReadyService(row: CrmServiceRow) {
  return (
    row.is_active &&
    Number(row.price) > 0 &&
    Number(row.duration_minutes) > 0 &&
    (row.description?.trim().length ?? 0) >= 20 &&
    Boolean(row.image_url?.trim()) &&
    Boolean(relationCategory(row.service_categories))
  )
}

function isMarketplaceReadyStaff(row: CrmStaffRow) {
  return (
    row.is_active &&
    row.is_bookable &&
    Boolean(row.designation?.trim()) &&
    Boolean(row.avatar_url?.trim()) &&
    row.category_ids.length > 0
  )
}

function mapStaff(row: CrmStaffRow): SalonTeamMember {
  return {
    id: row.id,
    name: row.full_name,
    role: row.designation?.trim() || relationName(row.staff_roles) || "Specialist",
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

function mapPackage(row: CrmPackageRow, fallbackImage: string): SalonPackage {
  const items = [...(row.salon_package_items ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item) => {
      const service = resolveJoin(item.services)

      return {
        serviceId: item.service_id,
        serviceName: service?.name ?? "Service",
        quantity: item.quantity,
      }
    })

  const individualTotal = (row.salon_package_items ?? []).reduce((sum, item) => {
    const service = resolveJoin(item.services)
    const price = Number(service?.price ?? 0)
    return sum + price * item.quantity
  }, 0)

  const packagePrice = Number(row.package_price)
  const comparePrice =
    row.original_price != null && row.original_price !== ""
      ? Number(row.original_price)
      : individualTotal
  const amountSaved =
    row.amount_saved != null && row.amount_saved !== ""
      ? Number(row.amount_saved)
      : Math.max(0, comparePrice - packagePrice)
  const discountPercent =
    row.discount_percentage != null && row.discount_percentage !== ""
      ? Number(row.discount_percentage)
      : comparePrice > 0 && packagePrice < comparePrice
        ? Math.round(((comparePrice - packagePrice) / comparePrice) * 100)
        : 0

  const shortDescription = row.short_description?.trim() || row.description?.trim() || ""

  return {
    id: row.id,
    name: row.name,
    description: shortDescription,
    shortDescription,
    detailedDescription: row.detailed_description?.trim() || row.description?.trim() || "",
    imageUrl: row.image_url?.trim() || fallbackImage,
    packagePrice,
    comparePrice,
    amountSaved,
    discountPercent,
    totalDurationMin: row.total_duration ?? 0,
    showComparePrice: row.show_compare_price !== false,
    showSavings: row.show_savings !== false,
    allowOnlineBooking: row.allow_online_booking !== false,
    servicePreviewCount: row.service_preview_count ?? 3,
    badge: row.badge ?? null,
    isFeatured: row.is_featured === true,
    sortOrder: row.sort_order ?? 0,
    items,
  }
}

function mapOffer(row: CrmOfferRow): SalonOffer {
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

export function mapCrmSalonToWeb(
  row: CrmSalonRow,
  services: CrmServiceRow[],
  staff: CrmStaffRow[],
  reviews: CrmSalonReviewRow[] = [],
  packages: CrmPackageRow[] = [],
  offers: CrmOfferRow[] = [],
  marketplaceProfile: CrmMarketplaceProfileRow | null = null,
  canonicalGallery: CrmSalonGalleryImageRow[] = [],
): Salon {
  const activeServices = services
    .filter(isMarketplaceReadyService)
    .map(mapService)
    .filter((service): service is SalonService => service !== null)
    .sort((a, b) => a.price - b.price)

  const activeStaff = staff
    .filter(isMarketplaceReadyStaff)
    .map(mapStaff)

  const area = resolveSalonArea(row)
  const city = row.city?.trim() || ""
  const priceFrom =
    activeServices.length > 0
      ? Math.min(...activeServices.map((s) => s.price))
      : 0

  const listUrl = row.list_image_url?.trim() || null
  const coverUrl = row.cover_image_url?.trim() || null
  const fallback = fallbackImageForSalon(row.id)
  const imageUrl = listUrl || coverUrl || fallback
  const coverImageUrl = coverUrl || listUrl || fallback

  const activePackages = packages
    .filter((pkg) => pkg.is_active && (pkg.status == null || pkg.status === "active"))
    .filter((pkg) => pkg.marketplace_visible !== false)
    .sort((a, b) => {
      const featuredDiff = Number(b.is_featured) - Number(a.is_featured)
      if (featuredDiff !== 0) return featuredDiff
      return a.sort_order - b.sort_order || a.name.localeCompare(b.name)
    })
    .map((pkg) => mapPackage(pkg, imageUrl))

  const activeOffers = filterBookableOffers(
    offers.filter((offer) => offer.is_active).map(mapOffer),
  ).sort((a, b) => a.title.localeCompare(b.title))

  const description =
    marketplaceProfile?.long_description?.trim() ||
    marketplaceProfile?.short_description?.trim() ||
    activeServices[0]?.includes[0] ||
    `Book trusted services at ${row.name} in ${area}. Transparent pricing and easy online booking.`

  const latitude = parseSalonCoordinate(row.latitude)
  const longitude = parseSalonCoordinate(row.longitude)

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

    const staffRole = staff?.designation?.trim() || null

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

  const amenities = marketplaceProfile
    ? parseAmenities({ amenities: marketplaceProfile.amenities })
    : parseAmenities(row.settings)
  const cancellationPolicy = marketplaceProfile
    ? parseCancellationPolicy({ policies: marketplaceProfile.policies })
    : parseCancellationPolicy(row.settings)
  const metadata =
    marketplaceProfile?.metadata &&
    typeof marketplaceProfile.metadata === "object"
      ? (marketplaceProfile.metadata as {
          socialLinks?: {
            instagram?: string
            facebook?: string
            website?: string
          }
        })
      : null
  const socialLinks = metadata?.socialLinks
    ? {
        instagram: safeExternalUrl(metadata.socialLinks.instagram),
        facebook: safeExternalUrl(metadata.socialLinks.facebook),
        website: safeExternalUrl(metadata.socialLinks.website),
      }
    : undefined
  const featuredUntil = row.featured_until ? new Date(row.featured_until).getTime() : null
  const isFeatured =
    row.is_featured === true && (featuredUntil == null || featuredUntil > Date.now())

  const salonId = row.slug || row.id

  return {
    id: salonId,
    crmSalonId: row.id,
    name: row.name,
    area,
    city,
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
    packages: activePackages,
    offers: activeOffers,
    gallery: buildSalonGalleryImages({
      imageUrl,
      coverImageUrl: coverUrl,
      listImageUrl: listUrl,
      settings: marketplaceProfile ? null : row.settings,
      gallery: canonicalGallery
        .slice()
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((image) => image.url),
      serviceImageUrls:
        marketplaceProfile
          ? []
          : activeServices.map((service) => service.imageUrl),
    }),
    customerReviews,
    team: activeStaff,
    amenities,
    cancellationPolicy,
    languages:
      marketplaceProfile?.languages?.filter((language) => language.trim()) ??
      undefined,
    socialLinks:
      socialLinks &&
      (socialLinks.instagram || socialLinks.facebook || socialLinks.website)
        ? socialLinks
        : undefined,
  }
}
