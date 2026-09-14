import type { Salon } from "@/types/salon"
import {
  filterSalonsByCity,
  getSalonAreasForCity,
  normalizeCityName,
} from "@/lib/salons/city-filter"
import { SITE_URL } from "@/lib/seo/site-seo"

/** Canonical SEO cities we publish landing pages for (expand later). */
export const SEO_CITY_LANDINGS = [
  {
    slug: "bengaluru",
    displayName: "Bengaluru",
    alternateNames: ["Bangalore"],
  },
] as const

export type SeoCityLanding = (typeof SEO_CITY_LANDINGS)[number]

export function slugifyLocalLabel(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function resolveSeoCity(citySlug: string): SeoCityLanding | null {
  const normalized = normalizeCityName(citySlug.replace(/-/g, " "))
  return (
    SEO_CITY_LANDINGS.find(
      (city) =>
        city.slug === citySlug.toLowerCase() ||
        normalizeCityName(city.displayName) === normalized ||
        city.alternateNames.some((name) => normalizeCityName(name) === normalized),
    ) ?? null
  )
}

export function buildCityLandingPath(citySlug: string): string {
  return `/salons-in/${encodeURIComponent(citySlug)}`
}

export function buildAreaLandingPath(citySlug: string, areaSlug: string): string {
  return `/salons-in/${encodeURIComponent(citySlug)}/${encodeURIComponent(areaSlug)}`
}

export function buildCityLandingUrl(citySlug: string): string {
  return `${SITE_URL}${buildCityLandingPath(citySlug)}`
}

export function buildAreaLandingUrl(citySlug: string, areaSlug: string): string {
  return `${SITE_URL}${buildAreaLandingPath(citySlug, areaSlug)}`
}

export function getAreasForSeoCity(salons: Salon[], city: SeoCityLanding): string[] {
  const fromSalons = getSalonAreasForCity(salons, city.displayName)
  if (fromSalons.length > 0) return fromSalons

  // Fallback neighbourhoods so Bengaluru still has crawlable area URLs at launch.
  if (city.slug === "bengaluru") {
    return [
      "Indiranagar",
      "Koramangala",
      "HSR Layout",
      "Whitefield",
      "Jayanagar",
      "MG Road",
      "Marathahalli",
      "JP Nagar",
      "BTM Layout",
      "Bellandur",
      "Electronic City",
      "Malleshwaram",
      "Hebbal",
    ]
  }

  return []
}

export function resolveAreaLabel(
  salons: Salon[],
  city: SeoCityLanding,
  areaSlug: string,
): string | null {
  const areas = getAreasForSeoCity(salons, city)
  const match = areas.find((area) => slugifyLocalLabel(area) === areaSlug.toLowerCase())
  return match ?? null
}

export function filterSalonsByCityLanding(
  salons: Salon[],
  city: SeoCityLanding,
): Salon[] {
  return filterSalonsByCity(salons, city.displayName)
}

export function filterSalonsByAreaLanding(
  salons: Salon[],
  city: SeoCityLanding,
  areaLabel: string,
): Salon[] {
  const areaKey = areaLabel.trim().toLowerCase()
  return filterSalonsByCityLanding(salons, city).filter(
    (salon) => salon.area?.trim().toLowerCase() === areaKey,
  )
}

export function buildExploreCityHref(cityDisplayName: string): string {
  return `/explore?city=${encodeURIComponent(cityDisplayName)}`
}

export function buildExploreAreaHref(cityDisplayName: string, areaLabel: string): string {
  return `/explore?city=${encodeURIComponent(cityDisplayName)}&area=${encodeURIComponent(areaLabel)}`
}

export function buildCityPageSeo(city: SeoCityLanding) {
  const aliases = city.alternateNames.length > 0 ? ` (${city.alternateNames[0]})` : ""
  const title = `Get ₹999 Off | Salons in ${city.displayName}${aliases}`
  const description = `Get ₹999 off or a free service after every 10 visits. Find and book a salon in ${city.displayName} — hair, spa, nails, and beauty parlours in Indiranagar, Koramangala, HSR, Whitefield, and more.`
  return {
    title,
    description,
    path: buildCityLandingPath(city.slug),
    keywords: [
      `salon in ${city.displayName}`,
      `salons in ${city.displayName}`,
      `best salons in ${city.displayName}`,
      `hair salon in ${city.displayName}`,
      `spa in ${city.displayName}`,
      "salon near me",
      "book salon online",
      "get ₹999 off",
      "every 10th service free",
      ...city.alternateNames.flatMap((name) => [
        `salon in ${name}`,
        `salons in ${name}`,
        `hair salon in ${name}`,
        `spa in ${name}`,
        `best salons in ${name}`,
      ]),
    ],
  }
}

export function buildAreaPageSeo(city: SeoCityLanding, areaLabel: string) {
  const aliases = city.alternateNames.length > 0 ? ` (${city.alternateNames[0]})` : ""
  const title = `Salons in ${areaLabel}, ${city.displayName}${aliases} | Book Near You`
  const description = `Book a salon in ${areaLabel}, ${city.displayName}. Compare verified hair, beauty, spa, and nail partners near ${areaLabel}, see fixed prices, and confirm your appointment online on Glammzo.`
  const areaSlug = slugifyLocalLabel(areaLabel)
  return {
    title,
    description,
    path: buildAreaLandingPath(city.slug, areaSlug),
    areaSlug,
    keywords: [
      `salon in ${areaLabel}`,
      `salon near ${areaLabel}`,
      `salons in ${areaLabel} ${city.displayName}`,
      `hair salon in ${areaLabel}`,
      `spa in ${areaLabel}`,
      `best salon in ${areaLabel} bangalore`,
      "salon near me",
      "book salon online",
    ],
  }
}
