"use client"

import { useMemo } from "react"

import { SalonCard } from "@/components/salons/salon-card"
import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { applySalonDistances } from "@/lib/explore-distance"
import type { Salon } from "@/types/salon"

type ExploreFeaturedGridProps = {
  salons: Salon[]
  favoriteSalonIds?: string[]
  authenticated?: boolean
}

export function ExploreFeaturedGrid({
  salons,
  favoriteSalonIds = [],
  authenticated = false,
}: ExploreFeaturedGridProps) {
  const favoriteSet = useMemo(() => new Set(favoriteSalonIds), [favoriteSalonIds])
  const origin = useExploreDistanceOrigin({})
  const displaySalons = useMemo(
    () => applySalonDistances(salons, origin),
    [salons, origin],
  )

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {displaySalons.map((salon) => (
        <li key={`featured-${salon.id}`}>
          <SalonCard
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
        </li>
      ))}
    </ul>
  )
}
