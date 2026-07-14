export type SalonService = {
  id: string
  name: string
  durationMin: number
  price: number
  category: string
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
  appliesTo: "all_services" | "selected_services"
  serviceIds: string[]
  startsAt: string | null
  endsAt: string | null
  maxRedemptions: number | null
  redemptionCount: number
  isActive: boolean
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
  specialties: string[]
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
  isOpenNow: boolean
  priceFrom: number
  description: string
  address: string
  phone: string
  hours: string
  services: SalonService[]
  packages: SalonPackage[]
  offers: SalonOffer[]
  gallery: string[]
  customerReviews: SalonReview[]
  team: SalonTeamMember[]
  amenities?: SalonAmenities
  cancellationPolicy?: SalonCancellationPolicy
}
