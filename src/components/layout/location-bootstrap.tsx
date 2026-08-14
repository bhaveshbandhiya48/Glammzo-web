"use client"

import { useEffect, useRef } from "react"

import { bootstrapBrowseLocation } from "@/lib/location-storage"

/**
 * On first paint, ask for geolocation via the browser's native permission
 * prompt and store live Near me coordinates. Skips when the user already
 * denied permission, or manually picked a city (unless permission is already granted).
 */
export function LocationBootstrap() {
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    // Slight delay so hydration settles; still early enough to show the browser prompt.
    const timer = window.setTimeout(() => {
      void bootstrapBrowseLocation()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [])

  return null
}
