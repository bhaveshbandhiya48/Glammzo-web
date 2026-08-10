import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { Footer } from "@/components/sections/parts/footer"
import { Navbar } from "@/components/layout/navbar"
import { LocalSalonLanding } from "@/components/seo/local-salon-landing"
import { JsonLd } from "@/components/seo/json-ld"
import { getSalons } from "@/lib/salons"
import { buildAreaGeoAnswer, buildAreaGeoFaqs } from "@/lib/seo/geo-copy"
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/seo/json-ld"
import { buildSalonCollectionJsonLd } from "@/lib/seo/salon-json-ld"
import {
  SEO_CITY_LANDINGS,
  buildAreaLandingPath,
  buildAreaLandingUrl,
  buildAreaPageSeo,
  buildCityLandingPath,
  buildExploreAreaHref,
  filterSalonsByAreaLanding,
  getAreasForSeoCity,
  resolveAreaLabel,
  resolveSeoCity,
  slugifyLocalLabel,
} from "@/lib/seo/local-landing"
import { SITE_NAME, SITE_URL } from "@/lib/seo/site-seo"

type PageProps = {
  params: Promise<{ city: string; area: string }>
}

export async function generateStaticParams() {
  const salons = await getSalons()
  const params: Array<{ city: string; area: string }> = []

  for (const city of SEO_CITY_LANDINGS) {
    for (const area of getAreasForSeoCity(salons, city)) {
      params.push({ city: city.slug, area: slugifyLocalLabel(area) })
    }
  }

  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, area: areaSlug } = await params
  const city = resolveSeoCity(citySlug)
  if (!city) {
    return { robots: { index: false, follow: false } }
  }

  const salons = await getSalons()
  const areaLabel = resolveAreaLabel(salons, city, areaSlug)
  if (!areaLabel) {
    return { robots: { index: false, follow: false } }
  }

  const seo = buildAreaPageSeo(city, areaLabel)
  const canonical = `${SITE_URL}${seo.path}`

  return {
    title: { absolute: `${seo.title} | ${SITE_NAME}` },
    description: seo.description,
    keywords: [...seo.keywords],
    alternates: { canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      type: "website",
      locale: "en_IN",
    },
    robots: { index: true, follow: true },
  }
}

export default async function SalonsInAreaPage({ params }: PageProps) {
  const { city: citySlug, area: areaSlug } = await params
  const city = resolveSeoCity(citySlug)
  if (!city) notFound()

  const salons = await getSalons()
  const areaLabel = resolveAreaLabel(salons, city, areaSlug)
  if (!areaLabel) notFound()

  const canonicalAreaSlug = slugifyLocalLabel(areaLabel)
  if (
    citySlug.toLowerCase() !== city.slug ||
    areaSlug.toLowerCase() !== canonicalAreaSlug
  ) {
    redirect(buildAreaLandingPath(city.slug, canonicalAreaSlug))
  }

  const areaSalons = filterSalonsByAreaLanding(salons, city, areaLabel)
  const seo = buildAreaPageSeo(city, areaLabel)
  const pageUrl = buildAreaLandingUrl(city.slug, seo.areaSlug)
  const faqs = buildAreaGeoFaqs(city.displayName, areaLabel)

  return (
    <>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildSalonCollectionJsonLd({
            name: seo.title,
            description: seo.description,
            pageUrl,
            salons: areaSalons,
          }),
          buildFaqJsonLd([...faqs]),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Salon near me", path: "/salons-near-me" },
            { name: city.displayName, path: buildCityLandingPath(city.slug) },
            {
              name: areaLabel,
              path: buildAreaLandingPath(city.slug, canonicalAreaSlug),
            },
          ]),
        ]}
      />
      <Navbar />
      <main className="page-main">
        <LocalSalonLanding
          eyebrow={`${areaLabel} · ${city.displayName}`}
          title={`Salons near me in ${areaLabel}`}
          subtitle={`Book a salon in ${areaLabel}, ${city.displayName}. Compare verified partners, fixed prices, and available slots on Glammzo.`}
          salons={areaSalons}
          exploreHref={buildExploreAreaHref(city.displayName, areaLabel)}
          exploreLabel={`Explore ${areaLabel}`}
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Salon near me", href: "/salons-near-me" },
            { label: city.displayName, href: buildCityLandingPath(city.slug) },
            { label: areaLabel },
          ]}
          geoAnswer={{
            heading: `Salon near me in ${areaLabel}`,
            answer: buildAreaGeoAnswer(
              city.displayName,
              areaLabel,
              areaSalons.length,
            ),
            showKeyFacts: false,
          }}
          faqs={faqs}
          faqIdPrefix="area-landing-faq"
        />
      </main>
      <Footer />
    </>
  )
}
