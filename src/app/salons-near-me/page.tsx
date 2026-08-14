import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, MapPinIcon } from "lucide-react"

import { Footer } from "@/components/sections/parts/footer"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { FaqAccordion } from "@/components/faq/faq-accordion"
import { GeoAnswerBlock } from "@/components/seo/geo-answer-block"
import { JsonLd } from "@/components/seo/json-ld"
import { Button } from "@/components/ui/button"
import { getBrowseCityFromCookies } from "@/lib/categories/browse-city"
import { DEFAULT_CITY_NAME } from "@/lib/location"
import { getSalons } from "@/lib/salons"
import { getSalonAreasForCity } from "@/lib/salons/city-filter"
import {
  GEO_GLAMMZO_DEFINITION,
  GEO_NEAR_ME_ANSWER,
} from "@/lib/seo/geo-copy"
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildHowToBookJsonLd,
  buildOrganizationJsonLd,
  buildSalonBookingServiceJsonLd,
  SALON_NEAR_ME_FAQS,
} from "@/lib/seo/json-ld"
import {
  SEO_CITY_LANDINGS,
  buildAreaLandingPath,
  buildCityLandingPath,
  slugifyLocalLabel,
} from "@/lib/seo/local-landing"
import { SEO_SALONS_NEAR_ME, SITE_URL, buildShareImages } from "@/lib/seo/site-seo"
import { LAUNCH_PROMO_CODE, LAUNCH_CASHBACK_RUPEES } from "@/lib/marketing/launch-promo"
import { formatInr } from "@/lib/salons/catalog-utils"

export const metadata: Metadata = {
  title: {
    absolute: `${SEO_SALONS_NEAR_ME.title} | Glammzo`,
  },
  description: SEO_SALONS_NEAR_ME.description,
  keywords: [
    "salon near me",
    "salon nearby me",
    "salons near me",
    "hair salon near me",
    "beauty salon near me",
    "book salon online",
  ],
  alternates: {
    canonical: `${SITE_URL}${SEO_SALONS_NEAR_ME.path}`,
  },
  openGraph: {
    title: SEO_SALONS_NEAR_ME.title,
    description: SEO_SALONS_NEAR_ME.description,
    url: `${SITE_URL}${SEO_SALONS_NEAR_ME.path}`,
    type: "website",
    locale: "en_IN",
    images: buildShareImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_SALONS_NEAR_ME.title,
    description: SEO_SALONS_NEAR_ME.description,
    images: buildShareImages().map((image) => image.url),
  },
  robots: { index: true, follow: true },
}

export const dynamic = "force-dynamic"

const BENGALURU_FALLBACK_AREAS = [
  "Indiranagar",
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Jayanagar",
  "MG Road",
]

function buildSteps(city: string) {
  return [
    {
      title: "Share your location or city",
      body: `Use Near me or pick ${city} to see salons available around you.`,
    },
    {
      title: "Compare nearby salons",
      body: "Check services, fixed prices, ratings, and open hours before you decide.",
    },
    {
      title: "Book in minutes",
      body: "Choose a slot, book online, and unlock ₹200 wallet cashback after your first completed visit.",
    },
  ]
}

export default async function SalonsNearMePage() {
  const reward = formatInr(LAUNCH_CASHBACK_RUPEES)
  const browseCity = (await getBrowseCityFromCookies())?.trim() || DEFAULT_CITY_NAME
  const salons = await getSalons()
  const cityAreas = getSalonAreasForCity(salons, browseCity)
  const isDefaultCity =
    browseCity.toLowerCase() === DEFAULT_CITY_NAME.toLowerCase() ||
    browseCity.toLowerCase() === "bangalore"

  const areas =
    cityAreas.length > 0
      ? cityAreas.slice(0, 9)
      : isDefaultCity
        ? BENGALURU_FALLBACK_AREAS
        : []

  const steps = buildSteps(browseCity)
  const exploreCityHref = `/explore?city=${encodeURIComponent(browseCity)}`

  return (
    <>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildSalonBookingServiceJsonLd(),
          buildHowToBookJsonLd(),
          buildFaqJsonLd([...SALON_NEAR_ME_FAQS]),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Salon near me", path: "/salons-near-me" },
          ]),
        ]}
      />
      <Navbar />
      <main className="page-main">
        <section className="section-y">
          <Container className="max-w-3xl">
            <PageHeader
              eyebrow="Local discovery"
              title="Salon near me — book nearby salons online"
              subtitle="Find a salon nearby, compare fixed prices, and reserve your appointment without phone calls. Glammzo helps you discover verified partners around you."
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-7">
                <Link href="/explore?near=1">
                  Find salons near me
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-7">
                <Link href={buildCityLandingPath(SEO_CITY_LANDINGS[0].slug)}>
                  Salons in {SEO_CITY_LANDINGS[0].displayName}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-7">
                <Link href="/services">Browse services</Link>
              </Button>
            </div>

            <p className="mt-5 text-sm text-foreground/60">
              Launch offer: book your first service and get {reward} cashback with code{" "}
              <span className="font-semibold text-foreground">{LAUNCH_PROMO_CODE}</span> after your
              first completed visit.
            </p>
          </Container>
        </section>

        <GeoAnswerBlock
          heading="What is Glammzo for salon near me searches?"
          answer={`${GEO_GLAMMZO_DEFINITION} ${GEO_NEAR_ME_ANSWER}`}
        />

        <section id="how-to-book" className="section-y section-y-separated">
          <Container className="max-w-4xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              How to find a salon nearby me
            </h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 font-heading text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">{step.body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="section-y">
          <Container className="max-w-4xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Salons near you in {browseCity}
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/65">
              {areas.length > 0
                ? `Search for a hair salon, beauty salon, spa, or nail studio near you across popular ${browseCity} neighbourhoods.`
                : `Browse salons available in ${browseCity}. More neighbourhoods appear as partners publish nearby.`}
            </p>
            {areas.length > 0 ? (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((area) => {
                  const citySlug =
                    isDefaultCity
                      ? SEO_CITY_LANDINGS[0].slug
                      : slugifyLocalLabel(browseCity)
                  const areaHref = isDefaultCity
                    ? buildAreaLandingPath(citySlug, slugifyLocalLabel(area))
                    : `/explore?area=${encodeURIComponent(area)}&city=${encodeURIComponent(browseCity)}`

                  return (
                    <li key={area}>
                      <Link
                        href={areaHref}
                        className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
                      >
                        <MapPinIcon className="size-4 text-primary" aria-hidden />
                        Salon near {area}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="mt-8">
                <Button asChild size="lg" className="px-7">
                  <Link href={exploreCityHref}>
                    Explore salons in {browseCity}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </div>
            )}
          </Container>
        </section>

        <section className="section-y section-y-separated">
          <Container className="max-w-3xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Salon near me — FAQs
            </h2>
            <FaqAccordion
              className="mt-8"
              idPrefix="salon-near-me-faq"
              items={SALON_NEAR_ME_FAQS}
            />

            <Button asChild size="lg" className="mt-10 px-7">
              <Link href={exploreCityHref}>
                Explore salons near me
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
