"use client"

import { useEffect, useMemo, useState } from "react"

import { SalonCard } from "@/components/salons/salon-card"
import { sortSalonsByDistance } from "@/lib/geo"
import {
  LOCATION_UPDATED_EVENT,
  readStoredLocation,
  hasActiveNearMe,
} from "@/lib/location-storage"
import type { Salon } from "@/types/salon"

type ExploreSalonGridProps = {
  salons: Salon[]
  /** From URL ?near=1 — prefer sorting by user coordinates */
  nearFromUrl?: boolean
  urlLatitude?: number
  urlLongitude?: number
}

function parseCoord(value: number | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null
  return value
}

export function ExploreSalonGrid({
  salons,
  nearFromUrl,
  urlLatitude,
  urlLongitude,
}: ExploreSalonGridProps) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  )

  const syncCoords = () => {
    const urlLat = parseCoord(urlLatitude)
    const urlLng = parseCoord(urlLongitude)
    if (nearFromUrl && urlLat != null && urlLng != null) {
      setCoords({ latitude: urlLat, longitude: urlLng })
      return
    }
    const stored = readStoredLocation()?.stored
    if (hasActiveNearMe(stored) && stored?.latitude != null && stored?.longitude != null) {
      setCoords({ latitude: stored.latitude, longitude: stored.longitude })
      return
    }
    setCoords(null)
  }

  useEffect(() => {
    syncCoords()
    const onUpdate = () => syncCoords()
    window.addEventListener(LOCATION_UPDATED_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [nearFromUrl, urlLatitude, urlLongitude])

  const displaySalons = useMemo(() => {
    if (!coords) return salons
    return sortSalonsByDistance(salons, coords.latitude, coords.longitude)
  }, [salons, coords])

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {displaySalons.map((salon) => (
        <SalonCard key={salon.id} salon={salon} />
      ))}
    </div>
  )
}
