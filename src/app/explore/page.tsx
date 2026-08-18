import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"

import { getSalons, getSalonsByCategory } from "@/lib/salons"
import { getBrowseDefaultCategories } from "@/lib/categories/default-service-categories"
import { getConsumerFavoriteSalonIds } from "@/lib/favorites/server"
import { getSession } from "@/lib/auth/session"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { ExploreFeaturedGrid } from "@/components/explore/explore-featured-grid"
import { ExploreFilters } from "@/components/explore/explore-filters"
import { ExploreResultsSection } from "@/components/explore/explore-results-section"
import { ExploreCityComingSoon } from "@/components/explore/explore-city-coming-soon"
import { MarketingOfferStrip } from "@/components/marketing/marketing-offer-strip"
import {
  ExplorePageTitle,
  ExplorePartnerSubtitle,
} from "@/components/explore/explore-location-copy"
import { ExploreLocalDirectory } from "@/components/explore/explore-local-directory"
import { PartnerDiscoverCta } from "@/components/sections/parts/partner-discover-cta"
import { Footer } from "@/components/sections/parts/footer"
import { Button } from "@/components/ui/button"
import {
  EXPLORE_PRICE_FILTERS,
  EXPLORE_RATING_FILTERS,
  EXPLORE_SORT_FILTERS,
  filterExploreSalons,
  getFeaturedSalons,
  getExploreCategoryLabel,
  hasAnyExploreFilters,
  parseExploreSearchParams,
  resolveExploreRadiusKm,
  sortExploreSalons,
} from "@/lib/explore-filters"
import {
  buildExploreAreaDirectory,
  resolveExploreDirectoryCity,
} from "@/lib/explore/local-directory"
import { DEFAULT_CITY_NAME } from "@/lib/location"
import { GLAMZZO_CITY_COOKIE } from "@/lib/location-city-cookie"
import { SEO_EXPLORE, SITE_URL, buildShareImages } from "@/lib/seo/site-seo"

export const metadata: Metadata = {
  title: SEO_EXPLORE.title,
  description: SEO_EXPLORE.description,
  keywords: [
    "salon near me",
    "salons near me",
    "explore salons",
    "book salon online",
    "salon Bengaluru",
  ],
  alternates: {
    canonical: `${SITE_URL}/explore`,
  },
  openGraph: {
    title: SEO_EXPLORE.title,
    description: SEO_EXPLORE.description,
    url: `${SITE_URL}/explore`,
    images: buildShareImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_EXPLORE.title,
    description: SEO_EXPLORE.description,
    images: buildShareImages().map((image) => image.url),
  },
}

export const dynamic = "force-dynamic"

type ExploreSearchParams = {
  category?: string | string[]
  q?: string | string[]
  area?: string | string[]
  city?: string | string[]
  near?: string | string[]
  lat?: string | string[]
  lng?: string | string[]
  sort?: string | string[]
  price?: string | string[]
  rating?: string | string[]
  radius?: string | string[]
  open?: string | string[]
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>
}) {
  const params = await searchParams
  const cookieStore = await cookies()
  const cityCookie = cookieStore.get(GLAMZZO_CITY_COOKIE)?.value
  const parsed = parseExploreSearchParams(params)
  const searchState =
    !parsed.city && !parsed.area && cityCookie
      ? {
          ...parsed,
          city: decodeURIComponent(cityCookie),
        }
      : parsed
  const {
    category: active,
    query,
    area,
    city,
    nearMode,
    urlLatitude,
    urlLongitude,
    sort,
    price,
    rating,
    radius,
    openOnly,
  } = searchState

  const radiusKm = resolveExploreRadiusKm(radius)

  const [byCategory, browseCategories, allSalons] = await Promise.all([
    getSalonsByCategory(active),
    getBrowseDefaultCategories(city),
    getSalons(),
  ])
  const categoryFilters = [
    { id: "all", label: "All" },
    ...browseCategories.map((category) => ({
      id: category.id,
      label: category.eyebrow,
    })),
  ]
  const filtered = filterExploreSalons(byCategory, searchState)
  const list = sortExploreSalons(filtered, sort)
  const crmConnected = isSupabaseConfigured()
  const awaitingPublish =
    crmConnected &&
    allSalons.length === 0 &&
    list.length === 0 &&
    !hasAnyExploreFilters(searchState)
  const activeFilterLabel =
    categoryFilters.find((filter) => filter.id === active)?.label ??
    getExploreCategoryLabel(active)
  const activeSortLabel = EXPLORE_SORT_FILTERS.find((f) => f.id === sort)?.label
  const activePriceLabel = EXPLORE_PRICE_FILTERS.find((f) => f.id === price)?.label
  const activeRatingLabel = EXPLORE_RATING_FILTERS.find((f) => f.id === rating)?.label

  const session = await getSession()
  const favoriteSalonIds = session?.phone
    ? Array.from(await getConsumerFavoriteSalonIds(session.phone))
    : []

  const featuredSalons = getFeaturedSalons(list)
  const showFeatured = !hasAnyExploreFilters(searchState) && featuredSalons.length > 0
  const { areasByCity, cityLabels } = buildExploreAreaDirectory(allSalons)
  const directoryCity = resolveExploreDirectoryCity({
    city,
    area,
    fallbackCity: DEFAULT_CITY_NAME,
  })

  return (
    <>
      <Navbar />
      <main className="page-main">
        <MarketingOfferStrip showBookCta={false} />
        <PageSection tone="base" className="!border-b-0 !pt-4 !pb-12 sm:!pt-20 sm:!pb-28">
          <PageHeader
            eyebrow="Explore"
            title={<ExplorePageTitle />}
            subtitle="Filter by business type, compare ratings and prices, and book when you're ready, with no calls required."
            className="mb-4 max-w-none sm:mb-10 [&_h1]:mt-2 [&_p]:mt-2 max-sm:[&>p:last-of-type]:hidden md:[&>p:last-of-type]:truncate md:[&>p:last-of-type]:whitespace-nowrap"
          />
          {(query ||
            area ||
            nearMode ||
            active !== "all" ||
            sort !== "recommended" ||
            price !== "any" ||
            rating !== "any" ||
            openOnly) && (
            <p className="mb-6 text-sm text-foreground/55 sm:mb-8">
              Showing results
              {nearMode ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">near your location</span>
                </>
              ) : null}
              {nearMode && radiusKm != null ? (
                <>
                  {" "}
                  within <span className="font-medium text-foreground">{radiusKm} km</span>
                </>
              ) : null}
              {query ? (
                <>
                  {nearMode ? " · " : " "}
                  for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
                </>
              ) : null}
              {active !== "all" ? (
                <>
                  {" · "}
                  <span className="font-medium text-foreground">{activeFilterLabel}</span>
                </>
              ) : null}
              {!nearMode && area ? (
                <>
                  {" "}
                  in <span className="font-medium text-foreground">{area}</span>
                </>
              ) : null}
              {sort !== "recommended" ? (
                <>
                  {" · "}
                  sorted by <span className="font-medium text-foreground">{activeSortLabel}</span>
                </>
              ) : null}
              {price !== "any" ? (
                <>
                  {" · "}
                  <span className="font-medium text-foreground">{activePriceLabel}</span>
                </>
              ) : null}
              {rating !== "any" ? (
                <>
                  {" · "}
                  <span className="font-medium text-foreground">{activeRatingLabel}</span>
                </>
              ) : null}
              {openOnly ? (
                <>
                  {" · "}
                  <span className="font-medium text-foreground">open now</span>
                </>
              ) : null}
              {" · "}
              <Link href="/explore" className="text-primary underline-offset-2 hover:underline">
                Clear filters
              </Link>
            </p>
          )}

          <div className="sticky top-[calc(4.25rem+env(safe-area-inset-top,0px))] z-40 -mx-4 mb-6 border-y border-border/60 bg-background/95 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 md:hidden">
            <ExploreFilters state={searchState} categoryFilters={categoryFilters} />
          </div>

          {list.length === 0 ? (
            <>
              <div className="mb-4 hidden md:block">
                <ExploreFilters state={searchState} categoryFilters={categoryFilters} />
              </div>
              {awaitingPublish ? (
                <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border/70 bg-card px-8 py-10 text-center shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03]">
                  <p className="font-heading text-lg font-semibold">No salons match yet</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    Glammzo is connected to your CRM, but no salon is{" "}
                    <span className="font-medium text-foreground">published</span> yet. In the CRM,
                    open <span className="font-medium text-foreground">Settings → Public listing</span>,
                    complete the checklist, then click Publish.
                  </p>
                  <Button asChild className="mt-6">
                    <Link href="/explore">View all salons</Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <ExploreCityComingSoon city={city || area || "your city"} />
                </div>
              )}
            </>
          ) : (
            <ExploreResultsSection
              searchState={searchState}
              categoryFilters={categoryFilters}
              salons={list}
              sort={sort}
              nearFromUrl={nearMode}
              urlLatitude={urlLatitude}
              urlLongitude={urlLongitude}
              radiusKm={radiusKm}
              favoriteSalonIds={favoriteSalonIds}
              authenticated={Boolean(session)}
              featured={
                showFeatured ? (
                  <div>
                    <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                      Featured
                    </p>
                    <ExploreFeaturedGrid
                      salons={featuredSalons}
                      favoriteSalonIds={favoriteSalonIds}
                      authenticated={Boolean(session)}
                    />
                  </div>
                ) : null
              }
            />
          )}
        </PageSection>

        <ExploreLocalDirectory
          initialCity={directoryCity}
          areasByCity={areasByCity}
          cityLabels={cityLabels}
        />

        <PageSection
          tone="featured"
          separated
          className="!border-t-0 max-md:!py-6"
        >
          <PartnerDiscoverCta
            subtitle={<ExplorePartnerSubtitle />}
            salonCount={allSalons.length}
          />
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
