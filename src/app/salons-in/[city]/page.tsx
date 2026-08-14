import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { Footer } from "@/components/sections/parts/footer"
import { Navbar } from "@/components/layout/navbar"
import { LocalSalonLanding } from "@/components/seo/local-salon-landing"
import { JsonLd } from "@/components/seo/json-ld"
import { getSalons } from "@/lib/salons"
import { buildCityGeoAnswer, buildCityGeoFaqs } from "@/lib/seo/geo-copy"
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildHowToBookJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/seo/json-ld"
import { buildSalonCollectionJsonLd } from "@/lib/seo/salon-json-ld"
import {
  SEO_CITY_LANDINGS,
  buildAreaLandingPath,
  buildCityLandingPath,
  buildCityLandingUrl,
  buildCityPageSeo,
  buildExploreCityHref,
  filterSalonsByCityLanding,
  getAreasForSeoCity,
  resolveSeoCity,
  slugifyLocalLabel,
} from "@/lib/seo/local-landing"
import { SITE_NAME, SITE_URL, buildShareImages } from "@/lib/seo/site-seo"

type PageProps = {
  params: Promise<{ city: string }>
}

export function generateStaticParams() {
  return SEO_CITY_LANDINGS.map((city) => ({ city: city.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = resolveSeoCity(citySlug)
  if (!city) {
    return { robots: { index: false, follow: false } }
  }

  const seo = buildCityPageSeo(city)
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
      images: buildShareImages(),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: buildShareImages().map((image) => image.url),
    },
    robots: { index: true, follow: true },
  }
}

export default async function SalonsInCityPage({ params }: PageProps) {
  const { city: citySlug } = await params
  const city = resolveSeoCity(citySlug)
  if (!city) notFound()

  // Canonicalize aliases like /salons-in/bangalore → /salons-in/bengaluru
  if (citySlug.toLowerCase() !== city.slug) {
    redirect(buildCityLandingPath(city.slug))
  }

  const salons = await getSalons()
  const citySalons = filterSalonsByCityLanding(salons, city)
  const areas = getAreasForSeoCity(salons, city)
  const seo = buildCityPageSeo(city)
  const pageUrl = buildCityLandingUrl(city.slug)
  const faqs = buildCityGeoFaqs(city.displayName)

  return (
    <>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildHowToBookJsonLd(),
          buildSalonCollectionJsonLd({
            name: seo.title,
            description: seo.description,
            pageUrl,
            salons: citySalons,
          }),
          buildFaqJsonLd([...faqs]),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Salon near me", path: "/salons-near-me" },
            { name: city.displayName, path: buildCityLandingPath(city.slug) },
          ]),
        ]}
      />
      <Navbar />
      <main className="page-main">
        <LocalSalonLanding
          eyebrow={`Salons in ${city.displayName}`}
          title={`Book salons in ${city.displayName}`}
          subtitle={`Discover verified salons near you in ${city.displayName}. Compare fixed prices, ratings, and open slots — then book online on Glammzo.`}
          salons={citySalons}
          exploreHref={buildExploreCityHref(city.displayName)}
          exploreLabel={`Explore ${city.displayName} salons`}
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Salon near me", href: "/salons-near-me" },
            { label: city.displayName },
          ]}
          areaLinks={areas.map((area) => ({
            label: `Salons in ${area}`,
            href: buildAreaLandingPath(city.slug, slugifyLocalLabel(area)),
          }))}
          geoAnswer={{
            heading: `Salons near me in ${city.displayName}`,
            answer: buildCityGeoAnswer(city.displayName, citySalons.length),
          }}
          faqs={faqs}
          faqIdPrefix="city-landing-faq"
        />
      </main>
      <Footer />
    </>
  )
}
