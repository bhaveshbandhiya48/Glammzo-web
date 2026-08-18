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
  logo_url: "https://images.unsplash.com/logo.jpg",
  list_image_url: "https://images.unsplash.com/list.jpg",
  cover_image_url: "https://images.unsplash.com/cover.jpg",
  latitude: 12.9,
  longitude: 77.6,
  settings: {
    businessType: "Unisex Salon",
    amenities: {
      enabled: true,
      categories: [
        { icon: "Coffee", name: "Legacy amenity", visible: true },
      ],
    },
    policies: {
      cancellation: { active: true, freeCancelHours: 2 },
    },
    gallery: ["https://images.unsplash.com/legacy-gallery.jpg"],
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
  image_url: "https://images.unsplash.com/service.jpg",
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
          url: "https://images.unsplash.com/canonical-gallery.jpg",
          sort_order: 0,
          alt: null,
        },
      ],
    )

    expect(mapped.shortDescription).toBe(profile.short_description)
    expect(mapped.longDescription).toBe(profile.long_description)
    expect(mapped.description).toBe(profile.long_description)
    expect(mapped.languages).toEqual(["English", "Hindi"])
    expect(mapped.amenities?.categories.map((item) => item.name)).toEqual([
      "WiFi",
    ])
    expect(mapped.cancellationPolicy).toMatchObject({
      freeCancelHours: 24,
    })
    expect(mapped.cancellationPolicy).not.toHaveProperty("cancellationFeePercent")
    expect(mapped.cancellationPolicy).not.toHaveProperty("depositRequired")
    expect(mapped.cancellationPolicy).not.toHaveProperty("depositPercent")
    expect(mapped.gallery).toContain(
      "https://images.unsplash.com/canonical-gallery.jpg",
    )
    expect(mapped.gallery).not.toContain(
      "https://images.unsplash.com/legacy-gallery.jpg",
    )
    expect(mapped.gallery).not.toContain("https://images.unsplash.com/service.jpg")
    expect(mapped.gallery).not.toContain("https://images.unsplash.com/list.jpg")
    expect(mapped.gallery).not.toContain("https://images.unsplash.com/cover.jpg")
    expect(mapped.imageUrl).toBe("https://images.unsplash.com/list.jpg")
    expect(mapped.coverImageUrl).toBe("https://images.unsplash.com/cover.jpg")
    expect(mapped.socialLinks).toEqual({
      instagram: "https://instagram.com/canonical",
      facebook: undefined,
      website: undefined,
    })
  })

  it("retains legacy settings fallbacks when canonical rows are absent", () => {
    const mapped = mapCrmSalonToWeb(salon, [service], [])

    expect(mapped.businessType).toBe("Unisex Salon")
    expect(mapped.amenities?.categories[0]?.name).toBe("Legacy amenity")
    expect(mapped.cancellationPolicy?.freeCancelHours).toBe(2)
    expect(mapped.gallery).toContain(
      "https://images.unsplash.com/legacy-gallery.jpg",
    )
  })

  it("maps offer price as payable and original as compare-at", () => {
    const mapped = mapCrmSalonToWeb(
      salon,
      [{ ...service, price: "800", offer_price: "650" }],
      [],
    )

    expect(mapped.services[0]?.price).toBe(650)
    expect(mapped.services[0]?.compareAtPrice).toBe(800)
    expect(mapped.priceFrom).toBe(650)
  })

  it("keeps original price only when offer is missing", () => {
    const mapped = mapCrmSalonToWeb(salon, [service], [])

    expect(mapped.services[0]?.price).toBe(500)
    expect(mapped.services[0]?.compareAtPrice).toBeUndefined()
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
      "https://images.unsplash.com/legacy-gallery.jpg",
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
      bio: null,
      avatar_url: "https://images.unsplash.com/staff.jpg",
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

  it("keeps services without images and uses category stock (not salon list/cover)", () => {
    const mapped = mapCrmSalonToWeb(
      salon,
      [{ ...service, image_url: null }],
      [],
    )

    expect(mapped.services).toHaveLength(1)
    expect(mapped.services[0]?.imageUrl).toBe("/images/categories/hair.png")
  })

  it("does not reuse salon cover for services without photos", () => {
    const mapped = mapCrmSalonToWeb(
      { ...salon, list_image_url: null },
      [{ ...service, image_url: null }],
      [],
    )

    expect(mapped.services[0]?.imageUrl).toBe("/images/categories/hair.png")
    expect(mapped.services[0]?.imageUrl).not.toBe("https://images.unsplash.com/cover.jpg")
  })
})
