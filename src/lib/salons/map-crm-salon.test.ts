import { describe, expect, it } from "vitest"

import type {
  CrmMarketplaceProfileRow,
  CrmSalonRow,
  CrmServiceRow,
  CrmStaffRow,
} from "./crm-types"
import { mapCrmSalonToWeb } from "./map-crm-salon"

const salon: CrmSalonRow = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Canonical Salon",
  slug: "canonical-salon",
  email: "hello@example.com",
  phone: "+919999999999",
  address_line1: "1 Main Street",
  address_line2: "Central",
  city: "Bengaluru",
  state: "Karnataka",
  postal_code: "560001",
  country: "IN",
  timezone: "Asia/Kolkata",
  logo_url: "https://example.com/logo.jpg",
  list_image_url: "https://example.com/list.jpg",
  cover_image_url: "https://example.com/cover.jpg",
  latitude: 12.9,
  longitude: 77.6,
  settings: {
    amenities: {
      enabled: true,
      categories: [
        { icon: "Coffee", name: "Legacy amenity", visible: true },
      ],
    },
    policies: {
      cancellation: { active: true, freeCancelHours: 2 },
    },
    gallery: ["https://example.com/legacy-gallery.jpg"],
  },
  is_active: true,
  status: "active",
  listing_status: "published",
}

const service: CrmServiceRow = {
  id: "00000000-0000-4000-8000-000000000002",
  salon_id: salon.id,
  name: "Haircut",
  description: "A complete haircut service",
  image_url: "https://example.com/service.jpg",
  duration_minutes: 45,
  price: "500",
  is_active: true,
  service_categories: { name: "Hair", is_active: true, sort_order: 1 },
}

const profile: CrmMarketplaceProfileRow = {
  salon_id: salon.id,
  short_description: "Canonical short description",
  long_description:
    "Canonical detailed description saved by Marketplace Studio.",
  languages: ["English", "Hindi"],
  amenities: {
    enabled: true,
    categories: [{ icon: "Wifi", name: "WiFi", visible: true }],
  },
  policies: {
    cancellation: {
      active: true,
      freeCancelHours: 24,
      cancellationFeePercent: 20,
      depositRequired: true,
      depositPercent: 10,
    },
  },
  metadata: {
    socialLinks: {
      instagram: "https://instagram.com/canonical",
      website: "javascript:alert(1)",
    },
  },
}

describe("mapCrmSalonToWeb", () => {
  it("prefers canonical Marketplace profile and gallery data", () => {
    const mapped = mapCrmSalonToWeb(
      salon,
      [service],
      [],
      [],
      [],
      [],
      profile,
      [
        {
          id: "gallery-1",
          salon_id: salon.id,
          url: "https://example.com/canonical-gallery.jpg",
          sort_order: 0,
          alt: null,
        },
      ],
    )

    expect(mapped.description).toBe(profile.long_description)
    expect(mapped.languages).toEqual(["English", "Hindi"])
    expect(mapped.amenities?.categories.map((item) => item.name)).toEqual([
      "WiFi",
    ])
    expect(mapped.cancellationPolicy).toMatchObject({
      freeCancelHours: 24,
      cancellationFeePercent: 20,
      depositRequired: true,
      depositPercent: 10,
    })
    expect(mapped.gallery).toContain(
      "https://example.com/canonical-gallery.jpg",
    )
    expect(mapped.gallery).not.toContain(
      "https://example.com/legacy-gallery.jpg",
    )
    expect(mapped.gallery).not.toContain("https://example.com/service.jpg")
    expect(mapped.socialLinks).toEqual({
      instagram: "https://instagram.com/canonical",
      facebook: undefined,
      website: undefined,
    })
  })

  it("retains legacy settings fallbacks when canonical rows are absent", () => {
    const mapped = mapCrmSalonToWeb(salon, [service], [])

    expect(mapped.amenities?.categories[0]?.name).toBe("Legacy amenity")
    expect(mapped.cancellationPolicy?.freeCancelHours).toBe(2)
    expect(mapped.gallery).toContain(
      "https://example.com/legacy-gallery.jpg",
    )
  })

  it("does not revive legacy content when a canonical profile exists", () => {
    const mapped = mapCrmSalonToWeb(
      salon,
      [service],
      [],
      [],
      [],
      [],
      { ...profile, amenities: null, policies: null },
    )

    expect(mapped.amenities).toBeUndefined()
    expect(mapped.cancellationPolicy).toBeUndefined()
    expect(mapped.gallery).not.toContain(
      "https://example.com/legacy-gallery.jpg",
    )
  })

  it("excludes services and staff that no longer satisfy Marketplace readiness", () => {
    const incompleteService = {
      ...service,
      description: "Too short",
      image_url: null,
    }
    const incompleteStaff: CrmStaffRow = {
      id: "staff-1",
      salon_id: salon.id,
      full_name: "A Stylist",
      designation: "Stylist",
      avatar_url: "https://example.com/staff.jpg",
      specialties: [],
      is_active: true,
      is_bookable: true,
      category_ids: [],
      staff_roles: null,
    }

    const mapped = mapCrmSalonToWeb(
      salon,
      [incompleteService],
      [incompleteStaff],
      [],
      [],
      [],
      profile,
    )

    expect(mapped.services).toEqual([])
    expect(mapped.team).toEqual([])
  })
})
