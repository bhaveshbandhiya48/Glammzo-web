"use client"

import { useMemo, useState, type ReactNode } from "react"

import { ExploreAvailabilityNotice } from "@/components/explore/explore-availability-notice"
import { ExploreFilters } from "@/components/explore/explore-filters"
import { ExploreGoogleMap } from "@/components/explore/explore-google-map"
import { ExploreSalonGrid } from "@/components/explore/explore-salon-grid"
import { ExploreViewToggle, type ExploreViewMode } from "@/components/explore/explore-view-toggle"
import { SectionHeader } from "@/components/shared/section-header"
import { useUserLocation } from "@/hooks/use-user-location"
import type { ExploreSearchState, ExploreSortId } from "@/lib/explore-filters"
import { filterSalonsByCity } from "@/lib/salons/city-filter"
import type { Salon } from "@/types/salon"

type ExploreResultsSectionProps = {
  title: string
  subtitle: ReactNode
  searchState: ExploreSearchState
  categoryFilters: Array<{ id: string; label: string }>
  salons: Salon[]
  sort: ExploreSortId
  nearFromUrl: boolean
  urlLatitude?: number
  urlLongitude?: number
  radiusKm: number | null
  favoriteSalonIds: string[]
  authenticated: boolean
  featured?: ReactNode
}

export function ExploreResultsSection({
  title,
  subtitle,
  searchState,
  categoryFilters,
  salons,
  sort,
  nearFromUrl,
  urlLatitude,
  urlLongitude,
  radiusKm,
  favoriteSalonIds,
  authenticated,
  featured,
}: ExploreResultsSectionProps) {
  const [view, setView] = useState<ExploreViewMode>("list")
  const { browseCity } = useUserLocation()
  const useStoredCity = !searchState.area && !searchState.city
  const visibleSalons = useMemo(
    () => (useStoredCity ? filterSalonsByCity(salons, browseCity) : salons),
    [browseCity, salons, useStoredCity],
  )
  const visibleTitle = useStoredCity
    ? `${visibleSalons.length} salon${visibleSalons.length === 1 ? "" : "s"} in ${browseCity}`
    : title

  return (
    <>
      <SectionHeader
        eyebrow="Results"
        title={visibleTitle}
        subtitle={subtitle}
        action={
          <div className="sm:mt-8">
            <ExploreViewToggle value={view} onChange={setView} />
          </div>
        }
        className="mb-5 sm:mb-6 sm:items-start"
      />

      <ExploreFilters state={searchState} categoryFilters={categoryFilters} />

      <ExploreAvailabilityNotice salons={visibleSalons} />

      {!useStoredCity && featured ? <div className="mb-8 mt-6">{featured}</div> : null}

      <div className={!useStoredCity && featured ? undefined : "mt-6"}>
        {visibleSalons.length === 0 ? (
          <div className="rounded-3xl border border-border/80 bg-card px-6 py-12 text-center">
            <p className="font-heading text-lg font-semibold">
              No salons available in {browseCity} yet
            </p>
            <p className="mt-2 text-sm text-foreground/60">
              Change your location from the header to browse another city.
            </p>
          </div>
        ) : view === "map" ? (
          <ExploreGoogleMap
            salons={visibleSalons}
            nearFromUrl={nearFromUrl}
            urlLatitude={urlLatitude}
            urlLongitude={urlLongitude}
            favoriteSalonIds={favoriteSalonIds}
            authenticated={authenticated}
          />
        ) : (
          <ExploreSalonGrid
            salons={visibleSalons}
            sort={sort}
            nearFromUrl={nearFromUrl}
            urlLatitude={urlLatitude}
            urlLongitude={urlLongitude}
            radiusKm={radiusKm}
            favoriteSalonIds={favoriteSalonIds}
            authenticated={authenticated}
          />
        )}
      </div>
    </>
  )
}
