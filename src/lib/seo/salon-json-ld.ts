import type { Salon } from "@/types/salon"
import { SITE_NAME, SITE_URL } from "@/lib/seo/site-seo"

export function buildSalonJsonLd(salon: Salon, pageUrl: string) {
  const locality = salon.area?.trim() || salon.city?.trim() || undefined
  const region = salon.city?.trim() || undefined
  const hours = salon.hours?.trim() || undefined

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
      addressLocality: locality,
      addressRegion: region,
      addressCountry: "IN",
    },
    priceRange: salon.priceFrom > 0 ? `₹${salon.priceFrom}+` : undefined,
  }

  if (hours) {
    payload.openingHours = hours
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
    payload.hasMap = `https://www.google.com/maps/search/?api=1&query=${salon.latitude},${salon.longitude}`
  }

  return payload
}

/** CollectionPage + ItemList for city/area salon landing pages. */
export function buildSalonCollectionJsonLd(input: {
  name: string
  description: string
  pageUrl: string
  salons: Salon[]
}) {
  const itemListElement = input.salons.slice(0, 30).map((salon, index) => {
    const salonUrl = `${SITE_URL}/salons/${encodeURIComponent(salon.id)}`
    return {
      "@type": "ListItem",
      position: index + 1,
      url: salonUrl,
      name: salon.name,
      item: {
        "@type": "BeautySalon",
        "@id": salonUrl,
        name: salon.name,
        url: salonUrl,
        image: salon.imageUrl || salon.coverImageUrl || undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: salon.area || salon.city || undefined,
          addressRegion: salon.city || undefined,
          addressCountry: "IN",
        },
      },
    }
  })

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": input.pageUrl,
    name: input.name,
    description: input.description,
    url: input.pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.salons.length,
      itemListElement,
    },
  }
}
