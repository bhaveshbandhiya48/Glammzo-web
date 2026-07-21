import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getSalonById, getSalons } from "@/lib/salons"
import { getSession } from "@/lib/auth/session"
import { isSalonFavorited } from "@/lib/favorites/server"
import { trackListingView } from "@/lib/listing/track-listing-view"
import { buildSalonJsonLd } from "@/lib/seo/salon-json-ld"
import { primarySalonCategory } from "@/lib/salons/salon-detail-utils"
import { Navbar } from "@/components/layout/navbar"
import { SalonDetailView } from "@/components/salons/salon-detail/salon-detail-view"
import { SalonListingPreviewBanner } from "@/components/salons/salon-listing-preview-banner"
import { Footer } from "@/components/sections/parts/footer"
import type { Salon } from "@/types/salon"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ preview?: string }>
}

function isPreviewMode(value: string | undefined) {
  return value === "1" || value === "true"
}

function pickSimilarSalons(salon: Salon, all: Salon[]) {
  const category = primarySalonCategory(salon)
  const sameCity = all.filter(
    (item) => item.id !== salon.id && salon.city && item.city === salon.city,
  )
  const sameCategory = sameCity.filter((item) =>
    item.services.some((service) => service.category === category),
  )
  const pool = sameCategory.length >= 2 ? sameCategory : sameCity
  const fallback = all.filter((item) => item.id !== salon.id)
  const merged = [...pool, ...fallback.filter((item) => !pool.includes(item))]
  const seen = new Set<string>()
  const result: Salon[] = []
  for (const item of merged) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
    if (result.length >= 4) break
  }
  return result
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { preview } = await searchParams
  const salon = await getSalonById(id, { preview: isPreviewMode(preview) })
  if (!salon) return { title: "Salon not found" }
  return {
    title: salon.name,
    description: salon.shortDescription ?? salon.description,
    robots: isPreviewMode(preview) ? { index: false, follow: false } : undefined,
  }
}

export default async function SalonDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { preview } = await searchParams
  const isPreview = isPreviewMode(preview)
  const salon = await getSalonById(id, { preview: isPreview })
  if (!salon) notFound()

  if (!isPreview && salon.crmSalonId) {
    void trackListingView(salon.crmSalonId)
  }

  const session = await getSession()
  const initialFavorited =
    session?.phone && salon.crmSalonId
      ? await isSalonFavorited(session.phone, salon.crmSalonId)
      : false

  const allSalons = await getSalons()
  const similarSalons = pickSimilarSalons(salon, allSalons)

  const pageUrl = `https://glammzo.com/salons/${encodeURIComponent(salon.id)}`
  const jsonLd = buildSalonJsonLd(salon, pageUrl)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      {isPreview ? <SalonListingPreviewBanner /> : null}
      <main className="page-main bg-background">
        <SalonDetailView
          salon={salon}
          similarSalons={similarSalons}
          initialFavorited={initialFavorited}
          authenticated={Boolean(session)}
        />
      </main>
      <Footer />
    </>
  )
}
