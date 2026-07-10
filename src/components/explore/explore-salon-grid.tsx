"use client"

import { useEffect, useMemo, useState } from "react"

import { SalonCard } from "@/components/salons/salon-card"
import { distanceToSalonKm } from "@/lib/geo"
import type { ExploreSortId } from "@/lib/explore-filters"
import {
  LOCATION_UPDATED_EVENT,
  readStoredLocation,
  hasActiveNearMe,
} from "@/lib/location-storage"
import type { Salon } from "@/types/salon"

type ExploreSalonGridProps = {
  salons: Salon[]
  sort?: ExploreSortId
  /** From URL ?near=1 — prefer sorting by user coordinates */
  nearFromUrl?: boolean
  urlLatitude?: number
  urlLongitude?: number
  radiusKm?: number | null
  favoriteSalonIds?: string[]
  authenticated?: boolean
}

function parseCoord(value: number | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null
  return value
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
    const canComputeDistance = Boolean(coords)
    if (!canComputeDistance) return salons

    const shouldSortByDistance = sort === "nearest" || Boolean(nearFromUrl)
    const radius = radiusKm ?? null

    const withDistance = salons.map((salon) => {
      const distanceKm = distanceToSalonKm(
        salon,
        coords!.latitude,
        coords!.longitude,
      )
      return { ...salon, distanceKm }
    })

    const filtered =
      radius != null ? withDistance.filter((s) => s.distanceKm <= radius) : withDistance

    if (shouldSortByDistance) {
      return filtered.sort((a, b) => a.distanceKm - b.distanceKm)
    }

    return filtered
  }, [salons, coords, sort, nearFromUrl, radiusKm])

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
