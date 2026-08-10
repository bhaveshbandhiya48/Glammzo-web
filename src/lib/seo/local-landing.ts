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
  const title = `Salons in ${city.displayName} · Book Near Me Online`
  const description = `Find a salon near me in ${city.displayName}. Compare verified hair, beauty, spa, and nail salons, see fixed prices, and book online on Glammzo.`
  return {
    title,
    description,
    path: buildCityLandingPath(city.slug),
    keywords: [
      `salon in ${city.displayName}`,
      `salons in ${city.displayName}`,
      "salon near me",
      "book salon online",
      ...city.alternateNames.flatMap((name) => [`salon in ${name}`, `salons in ${name}`]),
    ],
  }
}

export function buildAreaPageSeo(city: SeoCityLanding, areaLabel: string) {
  const title = `Salons in ${areaLabel}, ${city.displayName} · Near Me`
  const description = `Looking for a salon near me in ${areaLabel}, ${city.displayName}? Browse verified local salons on Glammzo, compare fixed prices, and book your appointment online.`
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
      "salon near me",
      "book salon online",
    ],
  }
}
