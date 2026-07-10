import type { Metadata } from "next"
import Link from "next/link"

import { siteCopy } from "@/data/site-copy"
import { getSalonsByCategory } from "@/lib/salons"
import { getConsumerFavoriteSalonIds } from "@/lib/favorites/server"
import { getSession } from "@/lib/auth/session"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { SectionHeader } from "@/components/shared/section-header"
import { ExploreFilters } from "@/components/explore/explore-filters"
import { ExploreResultsSection } from "@/components/explore/explore-results-section"
import { SalonCard } from "@/components/salons/salon-card"
import {
  ExploreEmptyCityMessage,
  ExplorePageTitle,
  ExplorePartnerSubtitle,
  ExploreResultsSubtitle,
} from "@/components/explore/explore-location-copy"
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

export const metadata: Metadata = {
  title: "Explore salons",
  description: siteCopy.brand.description,
}

type ExploreSearchParams = {
  category?: string | string[]
  q?: string | string[]
  area?: string | string[]
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
  const searchState = parseExploreSearchParams(params)
  const {
    category: active,
    query,
    area,
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

  const byCategory = await getSalonsByCategory(active)
  const filtered = filterExploreSalons(byCategory, searchState)
  const list = sortExploreSalons(filtered, sort)
  const crmConnected = isSupabaseConfigured()
  const awaitingPublish =
    crmConnected && list.length === 0 && !hasAnyExploreFilters(searchState)
  const activeFilterLabel = getExploreCategoryLabel(active)
  const activeSortLabel = EXPLORE_SORT_FILTERS.find((f) => f.id === sort)?.label
  const activePriceLabel = EXPLORE_PRICE_FILTERS.find((f) => f.id === price)?.label
  const activeRatingLabel = EXPLORE_RATING_FILTERS.find((f) => f.id === rating)?.label

  const session = await getSession()
  const favoriteSalonIds = session?.phone
    ? Array.from(await getConsumerFavoriteSalonIds(session.phone))
    : []

  const featuredSalons = getFeaturedSalons(list)
  const showFeatured = !hasAnyExploreFilters(searchState) && featuredSalons.length > 0

  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base" className="!py-6 sm:!py-8">
          <PageHeader
            eyebrow="Explore"
            title={<ExplorePageTitle />}
            subtitle="Filter by service, compare ratings and prices, and book when you're ready, with no calls required."
            className="[&_h1]:mt-2 [&_p]:mt-2"
          />
          {(query || area || nearMode || sort !== "recommended" || price !== "any" || rating !== "any" || openOnly) && (
            <p className="mt-3 text-sm text-foreground/55">
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
        </PageSection>

        <PageSection tone="statement" separated className="!py-8 sm:!py-10">
          {list.length === 0 ? (
            <>
              <SectionHeader
                eyebrow="Results"
                title="No matches right now"
                subtitle={
                  <ExploreResultsSubtitle
                    activeFilterLabel={activeFilterLabel}
                    area={area}
                    nearMode={nearMode}
                  />
                }
                className="mb-5 sm:mb-6"
              />

              <ExploreFilters state={searchState} />

              <div className="mx-auto mt-6 max-w-md rounded-3xl border border-border/80 bg-card px-8 py-12 text-center shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03]">
                <p className="font-heading text-lg font-semibold">No salons match yet</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  {awaitingPublish ? (
                    <>
                      Glammzo is connected to your CRM, but no salon is{" "}
                      <span className="font-medium text-foreground">published</span> yet. In the CRM,
                      open <span className="font-medium text-foreground">Settings → Public listing</span>,
                      complete the checklist, then click Publish.
                    </>
                  ) : (
                    <ExploreEmptyCityMessage />
                  )}
                </p>
                <Button asChild className="mt-6 rounded-full">
                  <Link href="/explore">View all salons</Link>
                </Button>
              </div>
            </>
          ) : (
            <ExploreResultsSection
              title={`${list.length} salon${list.length === 1 ? "" : "s"} available`}
              subtitle={
                <ExploreResultsSubtitle
                  activeFilterLabel={activeFilterLabel}
                  area={area}
                  nearMode={nearMode}
                />
              }
              searchState={searchState}
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
                  <>
                    <SectionHeader
                      eyebrow="Featured"
                      title="Featured partners"
                      subtitle="Salons highlighted on Glammzo this week."
                      className="mb-4"
                    />
                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {featuredSalons.map((salon) => (
                        <li key={`featured-${salon.id}`}>
                          <SalonCard
                            salon={salon}
                            favorite={
                              salon.crmSalonId
                                ? {
                                    authenticated: Boolean(session),
                                    initialFavorited: favoriteSalonIds.includes(salon.crmSalonId),
                                  }
                                : undefined
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null
              }
            />
          )}
        </PageSection>

        <PageSection tone="featured" separated>
          <SectionHeader
            eyebrow="Own a salon?"
            title="Get discovered on Glammzo"
            subtitle={<ExplorePartnerSubtitle />}
            align="center"
            className="mb-8"
          />
          <div className="flex justify-center">
            <Button asChild size="lg" className="h-12 rounded-full px-8">
              <Link href="/partner">Partner with us</Link>
            </Button>
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
