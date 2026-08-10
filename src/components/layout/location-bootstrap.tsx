"use client"

import { useEffect, useRef } from "react"

import { bootstrapBrowseLocation } from "@/lib/location-storage"

/**
 * On first paint, ask for geolocation (browser permission dialog) and write the
 * result into header location state. Skips when the user already denied, already
 * has GPS Near me, or manually picked a city.
 */
export function LocationBootstrap() {
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    // Defer one tick so the first paint / hydration settles before the prompt.
    const timer = window.setTimeout(() => {
      void bootstrapBrowseLocation()
    }, 300)

    return () => window.clearTimeout(timer)
  }, [])

  return null
}
