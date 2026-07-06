export type SalonService = {
  id: string
  name: string
  durationMin: number
  price: number
  category: string
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
  name: string
  area: string
  imageUrl: string
  rating: number
  reviews: number
  distanceKm: number
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
}
