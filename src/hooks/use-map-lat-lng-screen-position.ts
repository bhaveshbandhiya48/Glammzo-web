"use client"

import { useEffect, useRef, useState } from "react"

type LatLngLiteral = { lat: number; lng: number }

export function useMapLatLngScreenPosition(
  map: google.maps.Map | null,
  latLng: LatLngLiteral | null,
) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const overlayRef = useRef<google.maps.OverlayView | null>(null)

  useEffect(() => {
    if (!map || !latLng) {
      setPosition(null)
      return
    }

    const overlay = new google.maps.OverlayView()
    overlay.onAdd = () => {}
    overlay.draw = () => {
      const projection = overlay.getProjection()
      if (!projection) return

      const pixel = projection.fromLatLngToContainerPixel(
        new google.maps.LatLng(latLng.lat, latLng.lng),
      )
      if (pixel) {
        setPosition({ x: pixel.x, y: pixel.y })
      }
    }
    overlay.onRemove = () => {}
    overlay.setMap(map)
    overlayRef.current = overlay

    const refresh = () => overlay.draw()
    const listeners = [
      map.addListener("idle", refresh),
      map.addListener("zoom_changed", refresh),
      map.addListener("center_changed", refresh),
      map.addListener("drag", refresh),
      map.addListener("bounds_changed", refresh),
    ]

    return () => {
      overlay.setMap(null)
      overlayRef.current = null
      for (const listener of listeners) {
        google.maps.event.removeListener(listener)
      }
    }
  }, [map, latLng])

  return position
}
