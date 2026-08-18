import { media } from "@/data/media"
import { resolveStaffImageUrl } from "@/lib/salons/staff-avatar"
import { parseSalonCoordinate } from "@/lib/salon-coordinates"
import { resolveAmenityIconId } from "@/lib/salons/amenity-catalog"
import { formatSalonHours, isSalonOpenNow } from "@/lib/salons/business-hours"
import { resolveServicePayablePrice, resolveCategoryStockImage } from "@/lib/salons/catalog-utils"
import { sanitizeSalonImageUrl } from "@/lib/salons/image-url"
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
import { buildStaffReviewCounts } from "@/lib/salons/staff-review-counts"
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

function normalizeWhatsIncluded(items: string[] | null | undefined): string[] {
  return (items ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function relationName(
  relation: { name: string } | { name: string }[] | null | undefined
): string | undefined {
  if (!relation) return undefined
  if (Array.isArray(relation)) return relation[0]?.name
  return relation.name
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

function mapService(
  row: CrmServiceRow,
  completedBookingCount = 0,
): SalonService | null {
  const category = relationCategory(row.service_categories)
  if (!category) {
    return null
  }
  // Never reuse salon list/cover/gallery photos for services — those belong to
  // the venue. Missing service photos use category stock art only.
  const imageUrl =
    sanitizeSalonImageUrl(row.image_url) ||
    resolveCategoryStockImage(row.name, category.name)
  const addOnIds = [...(row.service_add_ons ?? [])]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((entry) => entry.add_on_service_id)
  const { price, compareAtPrice } = resolveServicePayablePrice(
    row.price,
    row.offer_price,
  )

  return {
    id: row.id,
    name: row.name,
    durationMin: row.duration_minutes,
    price,
    compareAtPrice,
    category: category.name,
    categorySortOrder: category.sortOrder,
    imageUrl,
    description: row.description?.trim() || undefined,
    includes: (() => {
      const fromColumn = normalizeWhatsIncluded(row.whats_included)
      if (fromColumn.length > 0) return fromColumn
      return parseServiceIncludes(row.description)
    })(),
    recommendedFor: row.recommended_for?.length ? row.recommended_for : undefined,
    beforeCare: row.before_care?.trim() || undefined,
    afterCare: row.after_care?.trim() || undefined,
    addOnIds: addOnIds.length > 0 ? addOnIds : undefined,
    completedBookingCount:
      completedBookingCount > 0 ? completedBookingCount : undefined,
  }
}

function isMarketplaceReadyService(row: CrmServiceRow) {
  return (
    row.is_active &&
    Number(row.price) > 0 &&
    Number(row.duration_minutes) > 0 &&
    Boolean(relationCategory(row.service_categories))
  )
}

function isMarketplaceReadyStaff(row: CrmStaffRow) {
  return (
    row.is_active &&
    row.is_bookable &&
    Boolean(row.designation?.trim()) &&
    (row.gender === "male" || row.gender === "female") &&
    row.category_ids.length > 0
  )
}

function mapStaff(row: CrmStaffRow, reviewCount: number): SalonTeamMember {
  const bio = row.bio?.trim() || undefined
  const specialties = (row.specialties ?? []).map((item) => item.trim()).filter(Boolean)

  return {
    id: row.id,
    name: row.full_name,
    role: row.designation?.trim() || relationName(row.staff_roles) || "Specialist",
    imageUrl: resolveStaffImageUrl(row.avatar_url, row.gender),
    bio,
    specialties,
    reviewCount,
  }
}

/** Business type chosen at CRM signup (`settings.businessType`). */
export function parseBusinessTypeFromSettings(settings: unknown): string | null {
  if (!settings || typeof settings !== "object") return null
  const value = (settings as { businessType?: unknown }).businessType
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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
      // Older data may carry emoji or retired ids; fall back to the amenity label.
      const normalizedIcon = resolveAmenityIconId(icon, name)
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
  const freeCancelHoursParsed =
    typeof freeCancelHoursRaw === "number"
      ? freeCancelHoursRaw
      : typeof freeCancelHoursRaw === "string" && freeCancelHoursRaw.trim()
        ? Number(freeCancelHoursRaw)
        : Number.NaN
  if (!Number.isFinite(freeCancelHoursParsed)) return undefined

  const freeCancelHours = Math.max(0, Math.min(Math.round(freeCancelHoursParsed), 168))

  return {
    active: true,
    freeCancelHours,
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
    imageUrl: sanitizeSalonImageUrl(row.image_url) || fallbackImage,
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
  const minPaise = row.min_order_paise
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
    minOrderRupees:
      minPaise != null && Number.isFinite(minPaise) && minPaise > 0
        ? Math.round(minPaise / 100)
        : null,
    customerEligibility:
      row.customer_eligibility === "new_customers_only"
        ? "new_customers_only"
        : "all_customers",
    terms: row.terms?.trim() || null,
    ctaLabel: row.cta_label?.trim() || "Book now",
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
  serviceBookingCounts: Map<string, number> = new Map(),
  salonBookingCount = 0,
): Salon {
  const listUrl = sanitizeSalonImageUrl(row.list_image_url)
  const coverUrl = sanitizeSalonImageUrl(row.cover_image_url)

  const activeServices = services
    .filter(isMarketplaceReadyService)
    .map((serviceRow) =>
      mapService(serviceRow, serviceBookingCounts.get(serviceRow.id) ?? 0),
    )
    .filter((service): service is SalonService => service !== null)
    .sort((a, b) => a.price - b.price)

  const staffReviewCounts = buildStaffReviewCounts(reviews)

  const activeStaff = staff
    .filter(isMarketplaceReadyStaff)
    .map((staffRow) => mapStaff(staffRow, staffReviewCounts.get(staffRow.id) ?? 0))

  const area = resolveSalonArea(row)
  const city = row.city?.trim() || ""
  const priceFrom =
    activeServices.length > 0
      ? Math.min(...activeServices.map((s) => s.price))
      : 0

  const fallback = fallbackImageForSalon(row.id)
  // Explore/list thumbnail stays separate from the cover hero image.
  const imageUrl = listUrl || fallback
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

  const shortDescription = marketplaceProfile?.short_description?.trim() || ""
  const longDescription = marketplaceProfile?.long_description?.trim() || ""

  const description =
    longDescription ||
    shortDescription ||
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

    const ownerReply = r.owner_reply?.trim() || null

    return {
      id: r.id,
      staffId: r.staff_id?.trim() || null,
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
      ownerReply,
      ownerReplyDate:
        ownerReply && r.owner_reply_at
          ? new Date(r.owner_reply_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : null,
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

  const rawResponseScore = row.marketplace_response_score
  const marketplaceResponseScore =
    rawResponseScore == null || Number.isNaN(Number(rawResponseScore))
      ? null
      : Math.min(100, Math.max(0, Number(rawResponseScore)))

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
    marketplaceResponseScore,
    businessType: parseBusinessTypeFromSettings(row.settings),
    establishedYear:
      typeof row.established_year === "number" &&
      Number.isFinite(row.established_year)
        ? row.established_year
        : null,
    completedBookingCount: salonBookingCount > 0 ? salonBookingCount : undefined,
    isOpenNow: isSalonOpenNow(row.settings, row.timezone || "Asia/Kolkata"),
    priceFrom,
    shortDescription: shortDescription || undefined,
    longDescription: longDescription || undefined,
    description,
    address: formatAddress(row) || area,
    phone: row.phone?.trim() || "Contact salon for details",
    hours: formatSalonHours(row.settings),
    services: activeServices,
    packages: activePackages,
    offers: activeOffers,
    gallery: buildSalonGalleryImages({
      settings: marketplaceProfile ? null : row.settings,
      gallery: canonicalGallery
        .slice()
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((image) => image.url),
      excludeUrls: [listUrl, coverUrl, imageUrl, coverImageUrl],
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
