"use client"

import { useMemo } from "react"

import { useExploreDistanceOriginContext } from "@/providers/explore-distance-origin-provider"
import type { DistanceOrigin } from "@/lib/explore-distance"

type UseExploreDistanceOriginOptions = {
  nearFromUrl?: boolean
  urlLatitude?: number
  urlLongitude?: number
}

function resolveOriginFromOptions(
  storedOrigin: DistanceOrigin,
  options: UseExploreDistanceOriginOptions,
): DistanceOrigin {
  const { nearFromUrl, urlLatitude, urlLongitude } = options

  if (
    nearFromUrl &&
    urlLatitude != null &&
    urlLongitude != null &&
    Number.isFinite(urlLatitude) &&
    Number.isFinite(urlLongitude)
  ) {
    return {
      latitude: urlLatitude,
      longitude: urlLongitude,
      isDefaultCity: false,
    }
  }

  return storedOrigin
}

export function useExploreDistanceOrigin(options: UseExploreDistanceOriginOptions = {}) {
  const storedOrigin = useExploreDistanceOriginContext()

  return useMemo(
    () => resolveOriginFromOptions(storedOrigin, options),
    [storedOrigin, options.nearFromUrl, options.urlLatitude, options.urlLongitude],
  )
}
