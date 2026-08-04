"use client"

import { useMemo, useState, type ReactNode } from "react"

import { ExploreCityComingSoon } from "@/components/explore/explore-city-coming-soon"
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
  const locationLabel = searchState.city || browseCity

  const listSalons = useMemo(
    () => (locationLabel ? filterSalonsByCity(salons, locationLabel) : salons),
    [locationLabel, salons],
  )

  const visibleTitle =
    listSalons.length === 0
      ? locationLabel
        ? `Salons in ${locationLabel}`
        : title
      : locationLabel
        ? `${listSalons.length} salon${listSalons.length === 1 ? "" : "s"} in ${locationLabel}`
        : `${listSalons.length} salon${listSalons.length === 1 ? "" : "s"} available`

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

      {featured ? <div className="mb-8 mt-6">{featured}</div> : null}

      <div className={featured ? undefined : "mt-6"}>
        {listSalons.length === 0 ? (
          <ExploreCityComingSoon city={locationLabel || "your city"} />
        ) : view === "map" ? (
          <ExploreGoogleMap
            salons={salons}
            locationCity={locationLabel}
            nearFromUrl={nearFromUrl}
            urlLatitude={urlLatitude}
            urlLongitude={urlLongitude}
            favoriteSalonIds={favoriteSalonIds}
            authenticated={authenticated}
          />
        ) : (
          <ExploreSalonGrid
            salons={listSalons}
            sort={sort}
            nearFromUrl={nearFromUrl}
            urlLatitude={urlLatitude}
            urlLongitude={urlLongitude}
            radiusKm={radiusKm}
            favoriteSalonIds={favoriteSalonIds}
            authenticated={authenticated}
            preferNearest
          />
        )}
      </div>
    </>
  )
}
