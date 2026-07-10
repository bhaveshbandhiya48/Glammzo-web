import type { MetadataRoute } from "next"

import { getSalons } from "@/lib/salons"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://glammzo.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const salons = await getSalons()

  const salonEntries: MetadataRoute.Sitemap = salons.map((salon) => ({
    url: `${BASE_URL}/salons/${encodeURIComponent(salon.id)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

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
      url: `${BASE_URL}/partner`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...salonEntries,
  ]
}
