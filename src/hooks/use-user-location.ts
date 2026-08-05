"use client"

import { useCallback, useEffect, useState } from "react"

import {
  hasActiveNearMe,
  LOCATION_UPDATED_EVENT,
  readStoredLocation,
  type ParsedStoredLocation,
} from "@/lib/location-storage"
import {
  DEFAULT_CITY_NAME,
  formatBrowseSalonsCityLabel,
  formatStoredLocationLabel,
} from "@/lib/location"
import { syncBrowseCityCookie } from "@/lib/location-city-cookie"

export function useUserLocation() {
  const [data, setData] = useState<ParsedStoredLocation | null>(null)

  const refresh = useCallback(() => {
    const next = readStoredLocation()
    setData(next)
    if (next?.stored) {
      syncBrowseCityCookie(formatBrowseSalonsCityLabel(next.location, next.stored))
    }
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
    typeof stored?.latitude === "number" && typeof stored?.longitude === "number"
      ? { latitude: stored.latitude, longitude: stored.longitude }
      : null

  const browseCity = location
    ? formatBrowseSalonsCityLabel(location, stored)
    : DEFAULT_CITY_NAME

  return {
    location,
    stored,
    label,
    browseCity,
    coords,
    /** True only when GPS “Near me” is active — not when city/area centroids were stored. */
    nearMe: hasActiveNearMe(stored),
    resolvedArea: stored?.resolvedArea,
    refresh,
  }
}
