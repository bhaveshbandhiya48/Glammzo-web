export type SalonListingStatus = "draft" | "published" | "paused"

export type CrmSalonRow = {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  timezone: string
  logo_url: string | null
  list_image_url: string | null
  cover_image_url: string | null
  latitude: number | null
  longitude: number | null
  settings: unknown
  is_active: boolean
  status: string
  listing_status: SalonListingStatus
  is_featured?: boolean
  featured_until?: string | null
}

export type CrmServiceRow = {
  id: string
  salon_id: string
  name: string
  description: string | null
  image_url: string | null
  duration_minutes: number
  price: string
  is_active: boolean
  service_categories: { name: string } | { name: string }[] | null
}

export type CrmStaffRow = {
  id: string
  salon_id: string
  full_name: string
  designation: string | null
  avatar_url: string | null
  specialties: string[] | null
  is_active: boolean
  is_bookable: boolean
  staff_roles: { name: string } | { name: string }[] | null
}

export type CrmSalonReviewRow = {
  id: string
  salon_id: string
  customer_id: string | null
  appointment_id: string | null
  staff_id: string | null
  service_id: string | null
  rating: number
  review_type: string
  comment: string
  verified: boolean
  created_at: string
  customer?: {
    full_name?: string | null
    first_name?: string | null
    last_name?: string | null
  } | {
    full_name?: string | null
    first_name?: string | null
    last_name?: string | null
  }[] | null
  staff?: {
    full_name?: string | null
    designation?: string | null
    staff_roles?: { name: string } | { name: string }[] | null
  } | null
  service?: { name?: string | null } | null
}
