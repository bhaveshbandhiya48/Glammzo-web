import type { Salon } from "@/types/salon"

export function buildSalonJsonLd(salon: Salon, pageUrl: string) {
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": pageUrl,
    name: salon.name,
    description: salon.description || salon.shortDescription || undefined,
    url: pageUrl,
    image: salon.coverImageUrl || salon.imageUrl || undefined,
    telephone: salon.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.address || undefined,
      addressLocality: salon.area || salon.city || undefined,
      addressRegion: salon.city || undefined,
      addressCountry: "IN",
    },
    priceRange: salon.priceFrom > 0 ? `₹${salon.priceFrom}+` : undefined,
  }

  if (salon.rating > 0 && salon.reviews > 0) {
    payload.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: salon.rating.toFixed(1),
      reviewCount: salon.reviews,
      bestRating: "5",
      worstRating: "1",
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
