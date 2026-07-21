"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPinIcon, NavigationIcon } from "lucide-react"

import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import {
  computeSalonDistanceKm,
  resolveDistanceOriginFromStored,
} from "@/lib/explore-distance"
import { formatDistanceKm } from "@/lib/maps/haversine"
import { LOCATION_UPDATED_EVENT, readStoredLocation } from "@/lib/location-storage"
import type { Salon } from "@/types/salon"
import { cn } from "@/lib/utils"

type SalonDistanceFields = Pick<
  Salon,
  "id" | "area" | "address" | "latitude" | "longitude" | "distanceKm"
>

export function useSalonDistanceKm(salon: SalonDistanceFields): number | null {
  const origin = useExploreDistanceOrigin({})

  return useMemo(() => {
    if (salon.distanceKm > 0) {
      return salon.distanceKm
    }
    return computeSalonDistanceKm(salon, origin)
  }, [origin, salon])
}

/** Area label with distance from the user’s saved / detected location (booking summary). */
export function SalonDistance({
  salon,
  className,
}: {
  salon: SalonDistanceFields
  className?: string
}) {
  const [distanceKm, setDistanceKm] = useState<number | null>(null)

  useEffect(() => {
    const sync = () => {
      const stored = readStoredLocation()?.stored
      const origin = resolveDistanceOriginFromStored(stored)
      setDistanceKm(computeSalonDistanceKm(salon, origin))
    }

    sync()
    window.addEventListener(LOCATION_UPDATED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [salon])

  const distanceLabel = distanceKm != null && distanceKm > 0 ? formatDistanceKm(distanceKm) : null

  return (
    <p className={className}>
      <MapPinIcon className="size-4 shrink-0 text-primary" />
      {salon.area}
      {distanceLabel ? ` · ${distanceLabel}` : null}
    </p>
  )
}

/** Compact “2.4 km away” for salon profile hero and rails. */
export function SalonDistanceFromYou({
  salon,
  className,
}: {
  salon: SalonDistanceFields
  className?: string
}) {
  const distanceKm = useSalonDistanceKm(salon)
  const distanceLabel = distanceKm != null && distanceKm > 0 ? formatDistanceKm(distanceKm) : null

  if (!distanceLabel) return null

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[15px] font-medium text-foreground/65",
        className,
      )}
    >
      <NavigationIcon className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
      <span>{distanceLabel}</span>
    </span>
  )
}
