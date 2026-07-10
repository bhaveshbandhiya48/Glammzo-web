import type { Salon } from "@/types/salon"

export function buildSalonJsonLd(salon: Salon, pageUrl: string) {
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: salon.name,
    description: salon.description,
    url: pageUrl,
    image: salon.coverImageUrl || salon.imageUrl,
    telephone: salon.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.address,
      addressLocality: salon.area,
      addressCountry: "IN",
    },
    priceRange: salon.priceFrom > 0 ? `₹${salon.priceFrom}+` : undefined,
  }

  if (salon.rating > 0 && salon.reviews > 0) {
    payload.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: salon.rating.toFixed(1),
      reviewCount: salon.reviews,
    }
  }

  if (salon.latitude != null && salon.longitude != null) {
    payload.geo = {
      "@type": "GeoCoordinates",
      latitude: salon.latitude,
      longitude: salon.longitude,
    }
  }

  return payload
}
