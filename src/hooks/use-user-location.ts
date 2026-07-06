"use client"

import { useCallback, useEffect, useState } from "react"

import {
  LOCATION_UPDATED_EVENT,
  readStoredLocation,
  type ParsedStoredLocation,
} from "@/lib/location-storage"
import { formatStoredLocationLabel } from "@/lib/location"

export function useUserLocation() {
  const [data, setData] = useState<ParsedStoredLocation | null>(null)

  const refresh = useCallback(() => {
    setData(readStoredLocation())
  }, [])

  useEffect(() => {
    refresh()
    const onUpdate = () => refresh()
    window.addEventListener(LOCATION_UPDATED_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [refresh])

  const stored = data?.stored
  const location = data?.location
  const label = location ? formatStoredLocationLabel(location, stored) : null
  const coords =
    stored?.nearMe &&
    typeof stored.latitude === "number" &&
    typeof stored.longitude === "number"
      ? { latitude: stored.latitude, longitude: stored.longitude }
      : null

  return {
    location,
    stored,
    label,
    coords,
    nearMe: Boolean(coords),
    resolvedArea: stored?.resolvedArea,
    refresh,
  }
}
