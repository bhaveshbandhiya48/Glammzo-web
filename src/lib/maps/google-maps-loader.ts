"use client"

import { importLibrary, setOptions } from "@googlemaps/js-api-loader"

import { getGoogleMapsApiKey } from "@/lib/maps/config"

let configured = false
let mapsPromise: Promise<GoogleMapsRuntime> | null = null

export type GoogleMapsRuntime = {
  Map: typeof google.maps.Map
  Marker: typeof google.maps.Marker
  LatLngBounds: typeof google.maps.LatLngBounds
  SymbolPath: typeof google.maps.SymbolPath
  Size: typeof google.maps.Size
  Point: typeof google.maps.Point
}

async function createGoogleMapsRuntime(): Promise<GoogleMapsRuntime> {
  const [{ Map }, , { Size, Point }] = await Promise.all([
    importLibrary("maps"),
    importLibrary("marker"),
    importLibrary("core"),
  ])

  const { Marker, LatLngBounds, SymbolPath } = google.maps

  if (typeof Map !== "function") {
    throw new Error("Google Maps Map library failed to load.")
  }

  if (typeof Marker !== "function") {
    throw new Error("Google Maps Marker library failed to load.")
  }

  if (typeof Size !== "function" || typeof Point !== "function") {
    throw new Error("Google Maps core library failed to load.")
  }

  return { Map, Marker, LatLngBounds, SymbolPath, Size, Point }
}

export function loadGoogleMaps() {
  const apiKey = getGoogleMapsApiKey()

  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."))
  }

  if (!mapsPromise) {
    if (!configured) {
      setOptions({
        key: apiKey,
        v: "weekly",
      })
      configured = true
    }

    mapsPromise = createGoogleMapsRuntime().catch((error) => {
      mapsPromise = null
      throw error
    })
  }

  return mapsPromise
}
