"use client"

import { useEffect, useRef } from "react"

import { readStoredLocation, resolveInitialLocation } from "@/lib/location-storage"

/** Prompts for geolocation on first visit; no UI — browser handles the permission dialog. */
export function LocationBootstrap() {
  const started = useRef(false)

  useEffect(() => {
    if (started.current || readStoredLocation()) return
    started.current = true
    void resolveInitialLocation()
  }, [])

  return null
}
