"use client"

import { useMemo, useState, type ReactNode } from "react"
import { MapIcon } from "lucide-react"

import { ExploreCityComingSoon } from "@/components/explore/explore-city-coming-soon"
import { ExploreFilters } from "@/components/explore/explore-filters"
import { ExploreGoogleMap } from "@/components/explore/explore-google-map"
import { ExploreMobileMapOverlay } from "@/components/explore/explore-mobile-map-overlay"
import { ExploreSalonGrid } from "@/components/explore/explore-salon-grid"
import { ExploreViewToggle, type ExploreViewMode } from "@/components/explore/explore-view-toggle"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useUserLocation } from "@/hooks/use-user-location"
import type { ExploreSearchState, ExploreSortId } from "@/lib/explore-filters"
import { filterSalonsByCity } from "@/lib/salons/city-filter"
import type { Salon } from "@/types/salon"

type ExploreResultsSectionProps = {
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
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { browseCity } = useUserLocation()
  const locationLabel = searchState.city || browseCity

  const listSalons = useMemo(
    () => (locationLabel ? filterSalonsByCity(salons, locationLabel) : salons),
    [locationLabel, salons],
  )

  return (
    <>
      {isDesktop ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
          <ExploreFilters state={searchState} categoryFilters={categoryFilters} />
          <ExploreViewToggle value={view} onChange={setView} />
        </div>
      ) : null}

      {featured ? <div className="mb-8">{featured}</div> : null}

      <div>
        {listSalons.length === 0 ? (
          <ExploreCityComingSoon city={locationLabel || "your city"} />
        ) : isDesktop && view === "map" ? (
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

      {!isDesktop && listSalons.length > 0 ? (
        <button
          type="button"
          onClick={() => setMobileMapOpen(true)}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 inline-flex h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background shadow-xl shadow-black/25 transition-transform active:scale-[0.98] md:hidden"
        >
          <MapIcon className="size-4" aria-hidden />
          Map
        </button>
      ) : null}

      {mobileMapOpen && !isDesktop ? (
        <ExploreMobileMapOverlay
          salons={salons}
          locationCity={locationLabel}
          nearFromUrl={nearFromUrl}
          urlLatitude={urlLatitude}
          urlLongitude={urlLongitude}
          onClose={() => setMobileMapOpen(false)}
        />
      ) : null}
    </>
  )
}
