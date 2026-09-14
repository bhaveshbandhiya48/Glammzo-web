import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Footer } from "@/components/sections/parts/footer"
import { Navbar } from "@/components/layout/navbar"
import { LocalSalonLanding } from "@/components/seo/local-salon-landing"
import { JsonLd } from "@/components/seo/json-ld"
import { getPublicSalons } from "@/lib/salons"
import {
  BENGALURU_SEO_INTENTS,
  buildBengaluruIntentExploreHref,
  buildBengaluruIntentPath,
  buildBengaluruIntentUrl,
  filterSalonsByBengaluruIntent,
  resolveBengaluruSeoIntent,
} from "@/lib/seo/bengaluru-intents"
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/seo/json-ld"
import { buildSalonCollectionJsonLd } from "@/lib/seo/salon-json-ld"
import {
  buildAreaLandingPath,
  buildCityLandingPath,
  getAreasForSeoCity,
  resolveSeoCity,
  slugifyLocalLabel,
} from "@/lib/seo/local-landing"
import { SITE_NAME, buildShareImages } from "@/lib/seo/site-seo"

type PageProps = {
  params: Promise<{ landingSlug: string }>
}

export function generateStaticParams() {
  return BENGALURU_SEO_INTENTS.map((intent) => ({ landingSlug: intent.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { landingSlug } = await params
  const intent = resolveBengaluruSeoIntent(landingSlug)
  if (!intent) {
    return { robots: { index: false, follow: false } }
  }

  const salons = await getPublicSalons()
  const matched = filterSalonsByBengaluruIntent(salons, intent)
  const canonical = buildBengaluruIntentUrl(intent.slug)

  return {
    title: { absolute: `${intent.title} | ${SITE_NAME}` },
    description: intent.description,
    keywords: [...intent.keywords],
    alternates: { canonical },
    openGraph: {
      title: intent.title,
      description: intent.description,
      url: canonical,
      type: "website",
      locale: "en_IN",
      images: buildShareImages(),
    },
    twitter: {
      card: "summary_large_image",
      title: intent.title,
      description: intent.description,
      images: buildShareImages().map((image) => image.url),
    },
    robots: matched.length > 0
      ? { index: true, follow: true }
      : { index: false, follow: true },
  }
}

export default async function BengaluruIntentLandingPage({ params }: PageProps) {
  const { landingSlug } = await params
  const intent = resolveBengaluruSeoIntent(landingSlug)
  if (!intent) notFound()

  const salons = await getPublicSalons()
  const matched = filterSalonsByBengaluruIntent(salons, intent)
  const city = resolveSeoCity("bengaluru")
  const areas = city ? getAreasForSeoCity(salons, city) : []
  const pageUrl = buildBengaluruIntentUrl(intent.slug)

  return (
    <>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildSalonCollectionJsonLd({
            name: intent.title,
            description: intent.description,
            pageUrl,
            salons: matched,
          }),
          buildFaqJsonLd([...intent.faqs]),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Salons in Bengaluru", path: buildCityLandingPath("bengaluru") },
            { name: intent.h1, path: buildBengaluruIntentPath(intent.slug) },
          ]),
        ]}
      />
      <Navbar />
      <main className="page-main">
        <LocalSalonLanding
          eyebrow="Bengaluru · Bangalore"
          title={intent.h1}
          subtitle={intent.description}
          salons={matched}
          exploreHref={buildBengaluruIntentExploreHref(intent)}
          exploreLabel={`Explore ${intent.h1.toLowerCase()}`}
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Bengaluru", href: buildCityLandingPath("bengaluru") },
            { label: intent.h1 },
          ]}
          areaLinks={areas.map((area) => ({
            label: `Salons in ${area}`,
            href: buildAreaLandingPath("bengaluru", slugifyLocalLabel(area)),
          }))}
          geoAnswer={{
            heading: intent.h1,
            answer: intent.answer,
          }}
          faqs={intent.faqs}
          faqIdPrefix={`${intent.slug}-faq`}
        />
      </main>
      <Footer />
    </>
  )
}
