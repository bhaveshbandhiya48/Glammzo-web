/** Shared SEO constants for Glammzo marketplace pages. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://glammzo.com"

export const SITE_NAME = "Glammzo"

/** Static brand OG asset in `public/og.png` (1200×630). */
export const DEFAULT_OG_IMAGE_PATH = "/og.png"

export const DEFAULT_OG_IMAGE = {
  url: DEFAULT_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: "Glammzo — book salons in Bengaluru online",
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
  "hair salon in Bengaluru",
  "hair salon in Bangalore",
  "spa in Bengaluru",
  "spa in Bangalore",
  "nail salon in Bengaluru",
  "best salons in Bengaluru",
  "best salons in Bangalore",
  "beauty parlour in Bengaluru",
  "unisex salon in Bangalore",
  "get ₹999 off salon",
  "every 10th service free",
  "salon offer bangalore",
  "₹999 off salon bengaluru",
] as const

export const SEO_HOME = {
  title: "Get ₹999 Off | Salon in Bengaluru (Bangalore) | Glammzo",
  description:
    "Get ₹999 off or a free service after every 10 completed visits. Book hair, spa, nail, and beauty salons in Bengaluru with fixed prices and live slots on Glammzo.",
  keywords: [...LOCAL_SALON_KEYWORDS],
} as const

export const SEO_EXPLORE = {
  title: "Get ₹999 Off | Explore Salons in Bengaluru · Book Online",
  description:
    "Explore salons in Bengaluru and get ₹999 off after every 10 completed visits. Filter by neighbourhood, service, price, and rating, then book with clear pricing.",
} as const

export const SEO_SALONS_NEAR_ME = {
  title: "Get ₹999 Off | Salon Near Me in Bengaluru · Book Nearby",
  description:
    "Find a salon near me in Bengaluru and get ₹999 off or a free service every 10th visit. Compare verified nearby salons, fixed prices, and book online on Glammzo.",
  path: "/salons-near-me",
} as const

export const SEO_SERVICES = {
  title: "Get ₹999 Off | Hair, Spa, Nails & Beauty in Bengaluru",
  description:
    "Browse salons, spas, beauty parlours, and nail studios in Bengaluru. Every 10th completed visit unlocks ₹999 off or a free service. Compare prices and book on Glammzo.",
} as const

export const SEO_ORGANIZATION = {
  name: SITE_NAME,
  legalName: "Fixxzo Technologies Private Limited",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/glamzzo-icon.svg`,
  email: "support@glammzo.com",
  sameAs: [
    "https://instagram.com/glammzo",
    "https://facebook.com/glammzo",
    "https://x.com/glammzo",
  ],
  areaServed: "Bengaluru, India",
} as const
