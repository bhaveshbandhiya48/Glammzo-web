import type { MetadataRoute } from "next"

import { getSalons } from "@/lib/salons"
import {
  SEO_CITY_LANDINGS,
  buildAreaLandingPath,
  buildCityLandingPath,
  filterSalonsByAreaLanding,
  filterSalonsByCityLanding,
  getAreasForSeoCity,
  slugifyLocalLabel,
} from "@/lib/seo/local-landing"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://glammzo.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const salons = await getSalons()

  const salonEntries: MetadataRoute.Sitemap = salons.map((salon) => ({
    url: `${BASE_URL}/salons/${encodeURIComponent(salon.id)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // Only list city/area landing pages that have real, bookable salon inventory —
  // matches the noindex guard in the corresponding generateMetadata so the
  // sitemap never advertises doorway pages to crawlers.
  const localLandingEntries: MetadataRoute.Sitemap = []
  for (const city of SEO_CITY_LANDINGS) {
    if (filterSalonsByCityLanding(salons, city).length > 0) {
      localLandingEntries.push({
        url: `${BASE_URL}${buildCityLandingPath(city.slug)}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.92,
      })
    }

    for (const area of getAreasForSeoCity(salons, city)) {
      if (filterSalonsByAreaLanding(salons, city, area).length === 0) continue
      localLandingEntries.push({
        url: `${BASE_URL}${buildAreaLandingPath(city.slug, slugifyLocalLabel(area))}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.88,
      })
    }
  }

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/salons-near-me`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    ...localLandingEntries,
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/customer/map`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/for-salons`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/book-demo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cancellation-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/delete-account`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/why-glammzo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...salonEntries,
  ]
}
