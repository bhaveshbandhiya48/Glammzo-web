"use client"

import { useMemo } from "react"

import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { applySalonDistances } from "@/lib/explore-distance"
import { DEFAULT_CITY_NAME } from "@/lib/location"
import { isSalonInCity } from "@/lib/salons/city-filter"
import type { Salon } from "@/types/salon"

type ExploreAvailabilityNoticeProps = {
  salons: Salon[]
  browseCity?: string
  cityFallback?: boolean
}

export function ExploreAvailabilityNotice({
  salons,
  browseCity,
  cityFallback = false,
}: ExploreAvailabilityNoticeProps) {
  const origin = useExploreDistanceOrigin({})
  const cityLabel = browseCity?.trim() || DEFAULT_CITY_NAME

  const notice = useMemo(() => {
    if (salons.length === 0) {
      return null
    }

    if (cityFallback) {
      return `No salons in ${cityLabel} yet — showing live partners from other cities.`
    }

    if (!origin.isDefaultCity) {
      return null
    }

    const withDistance = applySalonDistances(salons, origin)
    const distances = withDistance
      .map((salon) => salon.distanceKm)
      .filter((distance) => distance > 0)

    if (distances.length === 0) {
      return null
    }

    const hasLocalPartner = salons.some((salon) => isSalonInCity(salon, cityLabel))
    if (hasLocalPartner) {
      return null
    }

    const nearestKm = Math.min(...distances)
    if (nearestKm <= 25) {
      return null
    }

    return `No salons in ${cityLabel} yet, showing available partners with distances from ${cityLabel}.`
  }, [cityFallback, cityLabel, origin, salons])

  if (!notice) {
    return null
  }

  return (
    <p className="mt-4 rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm text-foreground/65">
      {notice}
    </p>
  )
}
