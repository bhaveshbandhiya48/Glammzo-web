import type { Metadata } from "next"

import { Footer } from "@/components/sections/parts/footer"
import { Navbar } from "@/components/layout/navbar"
import { LocalSalonLanding } from "@/components/seo/local-salon-landing"
import { JsonLd } from "@/components/seo/json-ld"
import { getPublicSalons } from "@/lib/salons"
import { filterSalonsByCity } from "@/lib/salons/city-filter"
import {
  BENGALURU_SEO_CITY,
  BENGALURU_SEO_INTENTS,
  buildBengaluruIntentPath,
} from "@/lib/seo/bengaluru-intents"
import {
  LOYALTY_OFFER_FAQS,
  SEO_LOYALTY_OFFER,
  buildLoyaltyOfferJsonLd,
} from "@/lib/seo/loyalty-offer-seo"
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
import { SITE_NAME, SITE_URL, buildShareImages } from "@/lib/seo/site-seo"

const canonical = `${SITE_URL}${SEO_LOYALTY_OFFER.path}`

export const metadata: Metadata = {
  title: { absolute: `${SEO_LOYALTY_OFFER.title} | ${SITE_NAME}` },
  description: SEO_LOYALTY_OFFER.description,
  keywords: [...SEO_LOYALTY_OFFER.keywords],
  alternates: { canonical },
  openGraph: {
    title: SEO_LOYALTY_OFFER.title,
    description: SEO_LOYALTY_OFFER.description,
    url: canonical,
    type: "website",
    locale: "en_IN",
    images: buildShareImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_LOYALTY_OFFER.title,
    description: SEO_LOYALTY_OFFER.description,
    images: buildShareImages().map((image) => image.url),
  },
  robots: { index: true, follow: true },
}

export default async function Get999OffPage() {
  const salons = await getPublicSalons()
  const citySalons = filterSalonsByCity(salons, BENGALURU_SEO_CITY)
  const city = resolveSeoCity("bengaluru")
  const areas = city ? getAreasForSeoCity(salons, city) : []

  return (
    <>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildLoyaltyOfferJsonLd(),
          buildSalonCollectionJsonLd({
            name: SEO_LOYALTY_OFFER.title,
            description: SEO_LOYALTY_OFFER.description,
            pageUrl: canonical,
            salons: citySalons,
          }),
          buildFaqJsonLd([...LOYALTY_OFFER_FAQS]),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Salons in Bengaluru", path: buildCityLandingPath("bengaluru") },
            { name: "Get ₹999 off", path: SEO_LOYALTY_OFFER.path },
          ]),
        ]}
      />
      <Navbar />
      <main className="page-main">
        <LocalSalonLanding
          eyebrow="Glammzo loyalty · Bengaluru"
          title={SEO_LOYALTY_OFFER.h1}
          subtitle={SEO_LOYALTY_OFFER.subhead}
          salons={citySalons}
          exploreHref="/explore?city=Bengaluru"
          exploreLabel="Book a salon in Bengaluru"
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Bengaluru", href: buildCityLandingPath("bengaluru") },
            { label: "Get ₹999 off" },
          ]}
          serviceLinks={BENGALURU_SEO_INTENTS.map((intent) => ({
            label: intent.h1,
            href: buildBengaluruIntentPath(intent.slug),
          }))}
          areaLinks={areas.map((area) => ({
            label: `Salons in ${area}`,
            href: buildAreaLandingPath("bengaluru", slugifyLocalLabel(area)),
          }))}
          geoAnswer={{
            heading: "Get ₹999 off on salon bookings",
            answer: `${SEO_LOYALTY_OFFER.description} ${SEO_LOYALTY_OFFER.subhead}`,
          }}
          faqs={LOYALTY_OFFER_FAQS}
          faqIdPrefix="loyalty-offer-faq"
        />
      </main>
      <Footer />
    </>
  )
}
