/** Shared SEO constants for Glammzo marketplace pages. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://glammzo.com"

export const SITE_NAME = "Glammzo"

/** App Router OG route — PNG suitable for WhatsApp / iMessage / social previews. */
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image"

export const DEFAULT_OG_IMAGE = {
  url: DEFAULT_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: "Glammzo — find a salon near you and book online",
} as const

/** Prefer a remote salon photo when sharing a listing; otherwise the brand OG card. */
export function buildShareImages(imageUrl?: string | null, alt?: string) {
  const trimmed = imageUrl?.trim()
  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return [
      {
        url: trimmed,
        alt: alt?.trim() || SITE_NAME,
      },
    ]
  }
  return [DEFAULT_OG_IMAGE]
}

/** Primary local-intent keywords we target on public pages. */
export const LOCAL_SALON_KEYWORDS = [
  "salon near me",
  "salon nearby me",
  "salons near me",
  "book salon online",
  "hair salon near me",
  "beauty salon near me",
  "spa near me",
  "salon booking",
  "salon in Bengaluru",
  "salon in Bangalore",
] as const

export const SEO_HOME = {
  title: "Salon Near Me · Book Salons Online | Glammzo",
  description:
    "Find a salon near me and book online in minutes. Compare fixed prices, ratings, and open slots for hair, spa, nails, and beauty salons nearby — starting in Bengaluru.",
  keywords: [...LOCAL_SALON_KEYWORDS],
} as const

export const SEO_EXPLORE = {
  title: "Explore Salons Near Me · Book Online",
  description:
    "Explore salons near you on Glammzo. Filter by service, price, and rating, then book a nearby salon with clear pricing and instant confirmation.",
} as const

export const SEO_SALONS_NEAR_ME = {
  title: "Salon Near Me · Find & Book Nearby Salons Online",
  description:
    "Looking for a salon near me? Discover verified nearby salons on Glammzo, compare services and fixed prices, and book your appointment online in under two minutes.",
  path: "/salons-near-me",
} as const

export const SEO_SERVICES = {
  title: "Browse by Business Type · Salon, Spa, Barber & More",
  description:
    "Find salons, spas, barber shops, nail studios, and more near you. Compare ratings and fixed prices, then book on Glammzo.",
} as const

export const SEO_ORGANIZATION = {
  name: SITE_NAME,
  legalName: "Fixxzo Technologies Private Limited",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/glamzzo-icon.svg`,
  email: "hello@glammzo.com",
  sameAs: [
    "https://instagram.com/glammzo",
    "https://facebook.com/glammzo",
    "https://x.com/glammzo",
  ],
  areaServed: "Bengaluru, India",
} as const
