"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

import { GeolocationRequestError, requestUserLocation } from "@/lib/geo"
import {
  buildExploreNearMeHref,
  buildStoredFromNearMe,
  writeStoredLocation,
  type ParsedStoredLocation,
} from "@/lib/location-storage"
import { getLocationById } from "@/lib/location"
import { resolveLocationFromGps } from "@/lib/reverse-geocode"

export type NearMeState = {
  busy: boolean
  error: string | null
}

export function useNearMe() {
  const router = useRouter()
  const [state, setState] = useState<NearMeState>({ busy: false, error: null })

  const applyNearMe = useCallback(
    async (options?: { navigateToExplore?: boolean; category?: string; q?: string }) => {
      setState({ busy: true, error: null })
      try {
        const position = await requestUserLocation()
        const resolved = await resolveLocationFromGps(
          position.latitude,
          position.longitude
        )

        const stored = buildStoredFromNearMe(resolved)
        writeStoredLocation(stored)

        const result: ParsedStoredLocation = {
          location: getLocationById(resolved.locationId),
          stored,
        }

        if (options?.navigateToExplore) {
          router.push(
            buildExploreNearMeHref(position.latitude, position.longitude, {
              q: options?.q,
              category: options?.category,
            })
          )
        }

        setState({ busy: false, error: null })
        return { ...result, position, resolved }
      } catch (err) {
        const message =
          err instanceof GeolocationRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not detect your location."
        setState({ busy: false, error: message })
        return null
      }
    },
    [router]
  )

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return { ...state, applyNearMe, clearError }
}
