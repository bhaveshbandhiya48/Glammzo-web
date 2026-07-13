"use client"

import { useEffect, useState } from "react"
import { MapPinIcon } from "lucide-react"

import {
  computeSalonDistanceKm,
  resolveDistanceOriginFromStored,
} from "@/lib/explore-distance"
import { formatDistanceKm } from "@/lib/maps/haversine"
import { LOCATION_UPDATED_EVENT, readStoredLocation } from "@/lib/location-storage"
import type { Salon } from "@/types/salon"

export function SalonDistance({
  salon,
  className,
}: {
  salon: Pick<Salon, "id" | "area" | "address" | "latitude" | "longitude" | "distanceKm">
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
