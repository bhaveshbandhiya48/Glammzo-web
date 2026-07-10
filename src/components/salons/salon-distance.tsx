"use client"

import { useEffect, useState } from "react"
import { MapPinIcon } from "lucide-react"

import { distanceToSalonKm } from "@/lib/geo"
import {
  LOCATION_UPDATED_EVENT,
  hasActiveNearMe,
  readStoredLocation,
} from "@/lib/location-storage"
import type { Salon } from "@/types/salon"

export function SalonDistance({
  salon,
  className,
}: {
  salon: Pick<Salon, "id" | "area" | "latitude" | "longitude" | "distanceKm">
  className?: string
}) {
  const [distanceKm, setDistanceKm] = useState<number | null>(
    salon.distanceKm > 0 ? salon.distanceKm : null,
  )

  useEffect(() => {
    const sync = () => {
      const stored = readStoredLocation()?.stored
      if (hasActiveNearMe(stored) && stored?.latitude != null && stored?.longitude != null) {
        setDistanceKm(distanceToSalonKm(salon, stored.latitude, stored.longitude))
        return
      }

      setDistanceKm(salon.distanceKm > 0 ? salon.distanceKm : null)
    }

    sync()
    window.addEventListener(LOCATION_UPDATED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [salon])

  return (
    <p className={className}>
      <MapPinIcon className="size-4 shrink-0 text-primary" />
      {salon.area}
      {distanceKm != null ? ` · ${distanceKm.toFixed(1)} km away` : null}
    </p>
  )
}
