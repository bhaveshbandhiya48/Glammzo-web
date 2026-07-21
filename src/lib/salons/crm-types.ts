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

export type CrmMarketplaceProfileRow = {
  salon_id: string
  short_description: string | null
  long_description: string | null
  languages: string[] | null
  amenities: unknown
  policies: unknown
  metadata: unknown
}

export type CrmSalonGalleryImageRow = {
  id: string
  salon_id: string
  url: string
  sort_order: number
  alt: string | null
}

export type CrmServiceAddOnRow = {
  add_on_service_id: string
  sort_order: number
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
  recommended_for?: string[] | null
  before_care?: string | null
  after_care?: string | null
  service_add_ons?: CrmServiceAddOnRow[] | null
  service_categories:
    | { name: string; is_active?: boolean; sort_order?: number }
    | { name: string; is_active?: boolean; sort_order?: number }[]
    | null
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
  category_ids: string[]
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

export type CrmOfferRow = {
  id: string
  salon_id: string
  code: string
  title: string
  description: string | null
  discount_type: "percent" | "fixed"
  discount_value: string | number
  applies_to: "all_services" | "selected_services"
  starts_at: string | null
  ends_at: string | null
  max_redemptions: number | null
  redemption_count: number
  is_active: boolean
  salon_offer_services?: Array<{ service_id: string }> | null
}

export type CrmPackageRow = {
  id: string
  salon_id: string
  name: string
  description: string | null
  short_description?: string | null
  detailed_description?: string | null
  image_url: string | null
  package_price: string | number
  original_price: string | number | null
  amount_saved?: string | number | null
  discount_percentage?: string | number | null
  total_duration?: number | null
  badge?: string | null
  is_featured?: boolean
  marketplace_visible?: boolean
  show_compare_price: boolean
  show_savings?: boolean
  allow_online_booking?: boolean
  service_preview_count?: number
  is_active: boolean
  status?: string
  sort_order: number
  salon_package_items?: Array<{
    id: string
    service_id: string
    quantity: number
    sort_order?: number
    services?: { name: string; price: string | number; duration_minutes?: number } | { name: string; price: string | number; duration_minutes?: number }[] | null
  }> | null
}
