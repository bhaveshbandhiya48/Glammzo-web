"use client"

import { useMemo } from "react"

import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { applySalonDistances } from "@/lib/explore-distance"
import { DEFAULT_CITY_NAME } from "@/lib/location"
import type { Salon } from "@/types/salon"

type ExploreAvailabilityNoticeProps = {
  salons: Salon[]
}

export function ExploreAvailabilityNotice({ salons }: ExploreAvailabilityNoticeProps) {
  const origin = useExploreDistanceOrigin({})

  const notice = useMemo(() => {
    if (!origin.isDefaultCity || salons.length === 0) {
      return null
    }

    const withDistance = applySalonDistances(salons, origin)
    const distances = withDistance
      .map((salon) => salon.distanceKm)
      .filter((distance) => distance > 0)

    if (distances.length === 0) {
      return null
    }

    const nearestKm = Math.min(...distances)
    if (nearestKm <= 25) {
      return null
    }

    return `No salons in ${DEFAULT_CITY_NAME} yet, showing available partners with distances from ${DEFAULT_CITY_NAME}.`
  }, [origin, salons])

  if (!notice) {
    return null
  }

  return (
    <p className="mt-4 rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm text-foreground/65">
      {notice}
    </p>
  )
}
