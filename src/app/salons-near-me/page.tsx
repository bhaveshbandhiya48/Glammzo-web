import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, MapPinIcon } from "lucide-react"

import { Footer } from "@/components/sections/parts/footer"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { JsonLd } from "@/components/seo/json-ld"
import { Button } from "@/components/ui/button"
import {
  buildFaqJsonLd,
  buildSalonBookingServiceJsonLd,
  SALON_NEAR_ME_FAQS,
} from "@/lib/seo/json-ld"
import { SEO_SALONS_NEAR_ME, SITE_URL } from "@/lib/seo/site-seo"
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
    "book salon online Bengaluru",
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
  },
  robots: { index: true, follow: true },
}

const AREAS = [
  "Indiranagar",
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Jayanagar",
  "MG Road",
]

const STEPS = [
  {
    title: "Share your location or city",
    body: "Use Near me or pick Bengaluru to see salons available around you.",
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

export default function SalonsNearMePage() {
  const reward = formatInr(LAUNCH_CASHBACK_RUPEES)

  return (
    <>
      <JsonLd data={[buildSalonBookingServiceJsonLd(), buildFaqJsonLd([...SALON_NEAR_ME_FAQS])]} />
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

        <section className="section-y section-y-separated">
          <Container className="max-w-4xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              How to find a salon nearby me
            </h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
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
              Salons near you in Bengaluru
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/65">
              Search for a hair salon, beauty salon, spa, or nail studio near you across popular
              Bengaluru neighbourhoods. More cities are on the way.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AREAS.map((area) => (
                <li key={area}>
                  <Link
                    href={`/explore?area=${encodeURIComponent(area)}`}
                    className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <MapPinIcon className="size-4 text-primary" aria-hidden />
                    Salon near {area}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="section-y section-y-separated">
          <Container className="max-w-3xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Salon near me — FAQs
            </h2>
            <div className="mt-8 space-y-6">
              {SALON_NEAR_ME_FAQS.map((faq) => (
                <div key={faq.question}>
                  <h3 className="font-heading text-lg font-semibold tracking-tight">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-foreground/65">{faq.answer}</p>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="mt-10 px-7">
              <Link href="/explore">
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
