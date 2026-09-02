export type SalonService = {
  id: string
  name: string
  durationMin: number
  /** Amount the guest pays (offer when set, otherwise original). */
  price: number
  /** Original CRM price when an offer is active (shown struck through). */
  compareAtPrice?: number
  /** Nail Art Studio unit pricing: both hands, per hand, or per finger. */
  pricingUnit?: "both_hands" | "per_hand" | "per_finger"
  category: string
  categorySortOrder?: number
  imageUrl: string
  /** Full service description from CRM, used in detail drawer */
  description?: string
  /** Short list of what the guest receives, shown in service picker */
  includes: string[]
  /** Owner-defined audience tags from CRM. Hidden on Glammzo when not set. */
  recommendedFor?: string[]
  /** Owner-defined prep note from CRM. Hidden on Glammzo when not set. */
  beforeCare?: string
  /** Owner-defined aftercare note from CRM. Hidden on Glammzo when not set. */
  afterCare?: string
  /** Linked add-on service IDs from CRM. Empty = auto-suggested from same category. */
  addOnIds?: string[]
  /** Unisex salon catalogs: men or women. Null/undefined = show in both tabs. */
  genderAudience?: "men" | "women" | null
  /** Named prices (Regular / Rica). Empty/undefined = single flat price. */
  priceOptions?: Array<{
    id: string
    name: string
    price: number
  }>
  /** Completed visits on Glammzo (CRM appointments), used for “Most booked” ranking. */
  completedBookingCount?: number
}

export type SalonPackageItem = {
  serviceId: string
  serviceName: string
  quantity: number
}

export type SalonOffer = {
  id: string
  code: string
  title: string
  description: string | null
  discountType: "percent" | "fixed"
  discountValue: number
  appliesTo: "all_services_and_packages" | "all_services" | "selected_services"
  serviceIds: string[]
  packageIds: string[]
  startsAt: string | null
  endsAt: string | null
  maxRedemptions: number | null
  redemptionCount: number
  isActive: boolean
  /** Minimum booking total in rupees; null = no minimum. */
  minOrderRupees: number | null
  customerEligibility: "all_customers" | "new_customers_only"
  terms: string | null
  ctaLabel: string
}

export type SalonPackage = {
  id: string
  name: string
  /** @deprecated Use shortDescription */
  description: string
  shortDescription: string
  detailedDescription: string
  imageUrl: string
  packagePrice: number
  comparePrice: number
  amountSaved: number
  discountPercent: number
  totalDurationMin: number
  showComparePrice: boolean
  showSavings: boolean
  allowOnlineBooking: boolean
  servicePreviewCount: number
  badge: string | null
  isFeatured: boolean
  sortOrder: number
  items: SalonPackageItem[]
}

export type SalonStaffMember = {
  name: string
  role: string
}

export type SalonTeamMember = {
  id: string
  name: string
  role: string
  imageUrl: string
  /** Customer-facing bio from CRM (Marketplace / staff profile). */
  bio?: string
  specialties: string[]
  /** Verified salon reviews linked to this staff member (`staff_id`). */
  reviewCount: number
}

export type SalonAmenityCategory = {
  icon: string
  name: string
  visible?: boolean
  items?: string[]
}

export type SalonAmenities = {
  categories: SalonAmenityCategory[]
}

export type SalonCancellationPolicy = {
  active?: boolean
  freeCancelHours: number
  cancellationFeePercent?: number
  depositRequired?: boolean
  depositPercent?: number
  summary?: string
}

/** Present only when the salon enabled GST and saved a GSTIN in CRM. */
export type SalonTaxInfo = {
  enabled: boolean
  ratePercent: number
  gstNumber: string
}

export type SalonSocialLinks = {
  instagram?: string
  facebook?: string
  website?: string
}

/** What aspect of the staff member's work the guest is rating */
export type SalonReviewType =
  | "Skill & technique"
  | "Professionalism"
  | "Communication"
  | "Hospitality"
  | "Overall experience"

export type SalonReview = {
  id: string
  /** CRM staff UUID when the guest rated a specific team member. */
  staffId?: string | null
  /** Public guest identifier shown on the card */
  userId: string
  /** Display name kept for accessibility / future account linking */
  authorName: string
  reviewType: SalonReviewType
  rating: number
  date: string
  serviceName: string
  staffMember: SalonStaffMember
  comment: string
  verified?: boolean
  /** Public reply from the salon owner/manager when set in CRM. */
  ownerReply?: string | null
  ownerReplyDate?: string | null
}

export type Salon = {
  id: string
  /** CRM salons UUID, used for Supabase writes. */
  crmSalonId?: string
  name: string
  /** Neighborhood/locality shown on explore cards (e.g. MG Road). */
  area: string
  /** City from CRM profile, used for city-level filters. */
  city?: string
  /** Square-friendly thumbnail for explore and salon list cards. */
  imageUrl: string
  /** Wide hero image on the salon profile page (16:9). */
  coverImageUrl: string
  rating: number
  reviews: number
  distanceKm: number
  /** WGS84 coordinates from CRM map pin, used for accurate distance. */
  latitude?: number
  longitude?: number
  /** Platform-promoted listing (Phase 4). */
  isFeatured?: boolean
  /**
   * Soft ranking from CRM web-booking response rate (0–100).
   * Null = not enough history; treated as neutral (full credit) in recommended sort.
   */
  marketplaceResponseScore?: number | null
  /** Signup business type from CRM settings (Salon, Spa, …). */
  businessType?: string | null
  /** Calendar year the business started (CRM established_year). */
  establishedYear?: number | null
  /**
   * Completed Glammzo-web bookings in the popularity window.
   * Used for local “Most booked” badges (10 km radius).
   */
  completedBookingCount?: number
  isOpenNow: boolean
  priceFrom: number
  /** Concise marketplace copy used on listing cards. */
  shortDescription?: string
  /** Full marketplace copy used on the salon detail page. */
  longDescription?: string
  description: string
  languages?: string[]
  socialLinks?: SalonSocialLinks
  marketplaceMetadata?: Record<string, unknown>
  address: string
  phone: string
  /** Salon WhatsApp from CRM setup; used for guest chat deep links. */
  whatsappPhone?: string | null
  hours: string
  services: SalonService[]
  packages: SalonPackage[]
  offers: SalonOffer[]
  gallery: string[]
  customerReviews: SalonReview[]
  team: SalonTeamMember[]
  amenities?: SalonAmenities
  cancellationPolicy?: SalonCancellationPolicy
  /** GST for pay-at-salon estimates when enabled with GSTIN in CRM. */
  tax?: SalonTaxInfo | null
}
