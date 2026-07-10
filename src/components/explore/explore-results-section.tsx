"use client"

import { useState, type ReactNode } from "react"

import { ExploreFilters } from "@/components/explore/explore-filters"
import { ExploreGoogleMap } from "@/components/explore/explore-google-map"
import { ExploreSalonGrid } from "@/components/explore/explore-salon-grid"
import { ExploreViewToggle, type ExploreViewMode } from "@/components/explore/explore-view-toggle"
import { SectionHeader } from "@/components/shared/section-header"
import type { ExploreSearchState, ExploreSortId } from "@/lib/explore-filters"
import type { Salon } from "@/types/salon"

type ExploreResultsSectionProps = {
  title: string
  subtitle: ReactNode
  searchState: ExploreSearchState
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

  return (
    <>
      <SectionHeader
        eyebrow="Results"
        title={title}
        subtitle={subtitle}
        action={
          <div className="sm:mt-8">
            <ExploreViewToggle value={view} onChange={setView} />
          </div>
        }
        className="mb-5 sm:mb-6 sm:items-start"
      />

      <ExploreFilters state={searchState} />

      {featured ? <div className="mb-8 mt-6">{featured}</div> : null}

      <div className={featured ? undefined : "mt-6"}>
        {view === "map" ? (
          <ExploreGoogleMap
            salons={salons}
            nearFromUrl={nearFromUrl}
            urlLatitude={urlLatitude}
            urlLongitude={urlLongitude}
            favoriteSalonIds={favoriteSalonIds}
            authenticated={authenticated}
          />
        ) : (
          <ExploreSalonGrid
            salons={salons}
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
