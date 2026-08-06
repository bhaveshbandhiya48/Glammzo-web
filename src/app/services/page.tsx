import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { media } from "@/data/media"
import { siteCopy } from "@/data/site-copy"
import { getBrowseCityFromCookies } from "@/lib/categories/browse-city"
import { getBrowseBusinessTypes } from "@/lib/categories/default-service-categories"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { ServiceCategoryGridCard } from "@/components/services/service-category-grid-card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/sections/parts/footer"
import { SEO_SERVICES, SITE_URL } from "@/lib/seo/site-seo"

const { categories: categoriesCopy } = siteCopy

const BOOKING_HIGHLIGHTS = [
  "Upfront prices before you book",
  "Real ratings from recent visits",
  "Confirm your slot in minutes",
] as const

export const metadata: Metadata = {
  title: SEO_SERVICES.title,
  description: SEO_SERVICES.description,
  keywords: [
    "salon near me",
    "spa near me",
    "barber shop near me",
    "nail salon near me",
    "beauty parlour near me",
  ],
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
}

export default async function ServicesPage() {
  const city = await getBrowseCityFromCookies()
  const businessTypes = await getBrowseBusinessTypes(city)

  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base" className="!border-b-0">
          <PageHeader
            eyebrow={categoriesCopy.eyebrow}
            title={categoriesCopy.title}
            subtitle={categoriesCopy.subtitle}
            className="mb-8 sm:mb-10"
          />
          {businessTypes.length > 0 ? (
            <ul
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              aria-label="Business types"
            >
              {businessTypes.map((category, index) => (
                <li key={category.id} className="min-h-0">
                  <ServiceCategoryGridCard
                    category={category}
                    city={city}
                    priority={index < 3}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-3xl border border-border/70 bg-card px-6 py-12 text-center">
              <p className="font-heading text-lg font-semibold">Browse salons nearby</p>
              <p className="mt-2 text-sm text-foreground/60">
                {city
                  ? `No published business types in ${city} yet. Switch location or explore salons to compare what’s available nearby.`
                  : "Business types will appear here as partners publish. In the meantime, explore salons to compare and book."}
              </p>
              <Button asChild className="mt-6">
                <Link href="/explore">
                  Explore salons
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          )}
        </PageSection>

        <PageSection tone="featured" separated className="!border-t-0">
          <div className="overflow-hidden rounded-[1.5rem] bg-foreground text-background shadow-[0_28px_70px_-32px_rgba(0,0,0,0.45)] ring-1 ring-black/10">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-full">
                <Image
                  src={media.sections.exploreComingSoon}
                  alt="Professional salon ready for booking"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/15 lg:to-black/50" />
              </div>

              <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
                  Ready to book?
                </p>
                <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  Find the right place for your visit
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                  Compare ratings, prices, and availability, then confirm your appointment without
                  phone calls.
                </p>

                <ul className="mt-6 space-y-2.5">
                  {BOOKING_HIGHLIGHTS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm font-medium text-white/85"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-3" strokeWidth={2.5} aria-hidden />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    asChild
                    size="lg"
                    className="px-8 shadow-lg shadow-primary/30 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <Link href="/explore">
                      Explore salons
                      <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover/button:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="border border-white/25 bg-white/5 px-8 text-white hover:bg-white/12 hover:text-white"
                  >
                    <Link href="/#how">How it works</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
