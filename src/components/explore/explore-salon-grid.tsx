"use client"

import { useMemo } from "react"

import { SalonCard } from "@/components/salons/salon-card"
import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { applySalonDistances } from "@/lib/explore-distance"
import type { ExploreSortId } from "@/lib/explore-filters"
import type { Salon } from "@/types/salon"

type ExploreSalonGridProps = {
  salons: Salon[]
  sort?: ExploreSortId
  /** From URL ?near=1, prefer sorting by user coordinates */
  nearFromUrl?: boolean
  urlLatitude?: number
  urlLongitude?: number
  radiusKm?: number | null
  favoriteSalonIds?: string[]
  authenticated?: boolean
}

export function ExploreSalonGrid({
  salons,
  sort = "recommended",
  nearFromUrl,
  urlLatitude,
  urlLongitude,
  radiusKm,
  favoriteSalonIds = [],
  authenticated = false,
}: ExploreSalonGridProps) {
  const favoriteSet = useMemo(() => new Set(favoriteSalonIds), [favoriteSalonIds])
  const origin = useExploreDistanceOrigin({ nearFromUrl, urlLatitude, urlLongitude })

  const displaySalons = useMemo(() => {
    const withDistance = applySalonDistances(salons, origin)
    const shouldSortByDistance = sort === "nearest" || Boolean(nearFromUrl)
    const radius = radiusKm ?? null

    const filtered =
      radius != null
        ? withDistance.filter((salon) => {
            // Keep salons without a known distance (no coords / no user origin).
            // Radius only hides salons that are known to be farther away.
            if (!(salon.distanceKm > 0)) return true
            return salon.distanceKm <= radius
          })
        : withDistance

    if (shouldSortByDistance) {
      return [...filtered].sort((a, b) => {
        const aDistance = a.distanceKm > 0 ? a.distanceKm : Number.POSITIVE_INFINITY
        const bDistance = b.distanceKm > 0 ? b.distanceKm : Number.POSITIVE_INFINITY
        return aDistance - bDistance
      })
    }

    return filtered
  }, [salons, origin, sort, nearFromUrl, radiusKm])

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {displaySalons.map((salon) => (
        <SalonCard
          key={salon.id}
          salon={salon}
          favorite={
            salon.crmSalonId
              ? {
                  authenticated,
                  initialFavorited: favoriteSet.has(salon.crmSalonId),
                }
              : undefined
          }
        />
      ))}
    </div>
  )
}
