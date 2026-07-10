export type SalonService = {
  id: string
  name: string
  durationMin: number
  price: number
  category: string
  imageUrl: string
  /** Short list of what the guest receives — shown in service picker */
  includes: string[]
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
  /** CRM salons UUID — used for Supabase writes. */
  crmSalonId?: string
  name: string
  area: string
  /** Square-friendly thumbnail for explore and salon list cards. */
  imageUrl: string
  /** Wide hero image on the salon profile page (16:9). */
  coverImageUrl: string
  rating: number
  reviews: number
  distanceKm: number
  /** WGS84 coordinates from CRM map pin — used for accurate distance. */
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
  gallery: string[]
  customerReviews: SalonReview[]
  team: SalonTeamMember[]
  amenities?: SalonAmenities
  cancellationPolicy?: SalonCancellationPolicy
}
