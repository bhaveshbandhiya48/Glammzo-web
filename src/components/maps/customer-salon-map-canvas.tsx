"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Loader2Icon, LocateFixedIcon, Maximize2Icon, Minimize2Icon } from "lucide-react"

import { useMapLatLngScreenPosition } from "@/hooks/use-map-lat-lng-screen-position"
import { requestUserLocation } from "@/lib/geo"
import { getSpreadMarkerPositions } from "@/lib/maps/marker-positions"
import { loadGoogleMaps, type GoogleMapsRuntime } from "@/lib/maps/google-maps-loader"
import { getMapPopoverPlacement } from "@/lib/maps/popover-placement"
import {
  buildSalonPriceMarkerIcon,
  buildUserLocationMarkerIcon,
} from "@/lib/maps/price-marker-icon"
import { SALON_MAP_OPTIONS } from "@/lib/maps/salon-map-styles"
import type { NearbySalonRecord } from "@/lib/maps/nearby-salon.types"
import { cn } from "@/lib/utils"

type CustomerSalonMapCanvasProps = {
  center: google.maps.LatLngLiteral
  salons: NearbySalonRecord[]
  selectedSalonId: string | null
  onSelectSalon: (salonId: string) => void
  onClearSelection?: () => void
  onUserLocationFound?: (coords: { latitude: number; longitude: number }) => void
  children?: ReactNode
  showMapPopover?: boolean
  mapExpanded?: boolean
  onToggleMapExpanded?: () => void
  mapHeightClass?: string
}

export function CustomerSalonMapCanvas({
  center,
  salons,
  selectedSalonId,
  onSelectSalon,
  onClearSelection,
  onUserLocationFound,
  children,
  showMapPopover = false,
  mapExpanded = false,
  onToggleMapExpanded,
  mapHeightClass = "h-[min(72vh,42rem)]",
}: CustomerSalonMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const mapsRuntimeRef = useRef<GoogleMapsRuntime | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const lastBoundsKeyRef = useRef("")
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const selectedSalon = useMemo(
    () => salons.find((salon) => salon.id === selectedSalonId) ?? null,
    [salons, selectedSalonId],
  )

  const selectedLatLng = useMemo(
    () =>
      selectedSalon
        ? { lat: selectedSalon.latitude, lng: selectedSalon.longitude }
        : null,
    [selectedSalon],
  )

  const markerPositions = useMemo(() => getSpreadMarkerPositions(salons), [salons])

  const markerScreenPos = useMapLatLngScreenPosition(mapInstance, selectedLatLng)

  const popoverPlacement = useMemo(() => {
    if (!markerScreenPos || containerSize.width === 0) return null
    return getMapPopoverPlacement(markerScreenPos, containerSize)
  }, [containerSize, markerScreenPos])

  useEffect(() => {
    const element = containerRef.current?.parentElement
    if (!element) return

    const updateSize = () => {
      setContainerSize({ width: element.offsetWidth, height: element.offsetHeight })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const handleMyLocation = useCallback(async () => {
    if (!mapRef.current || !mapsRuntimeRef.current) return

    setLocating(true)
    setLocationError(null)

    try {
      const position = await requestUserLocation()
      const latLng = { lat: position.latitude, lng: position.longitude }
      const { Marker, SymbolPath } = mapsRuntimeRef.current

      mapRef.current.panTo(latLng)
      mapRef.current.setZoom(15)

      if (!userMarkerRef.current) {
        userMarkerRef.current = new Marker({
          map: mapRef.current,
          position: latLng,
          title: "Your location",
          icon: buildUserLocationMarkerIcon(SymbolPath),
          zIndex: 1000,
        })
      } else {
        userMarkerRef.current.setPosition(latLng)
        userMarkerRef.current.setMap(mapRef.current)
      }

      onUserLocationFound?.({
        latitude: position.latitude,
        longitude: position.longitude,
      })
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : "Could not get your current location.",
      )
    } finally {
      setLocating(false)
    }
  }, [onUserLocationFound])

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      if (!containerRef.current) {
        return
      }

      const runtime = await loadGoogleMaps()
      const { Map, Marker, LatLngBounds, Size, Point } = runtime
      if (cancelled || !containerRef.current) {
        return
      }

      mapsRuntimeRef.current = runtime

      if (!mapRef.current) {
        mapRef.current = new Map(containerRef.current, {
          ...SALON_MAP_OPTIONS,
          center,
          zoom: 13,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
        })

        mapRef.current.addListener("click", () => {
          onClearSelection?.()
        })
        setMapInstance(mapRef.current)
      } else {
        mapRef.current.setCenter(center)
        mapRef.current.setOptions({
          ...SALON_MAP_OPTIONS,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
        })
      }

      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      const markers = salons.map((salon) => {
        const isSelected = selectedSalonId === salon.id
        const position = markerPositions.get(salon.id) ?? {
          lat: salon.latitude,
          lng: salon.longitude,
        }
        const marker = new Marker({
          map: mapRef.current!,
          position,
          title: salon.name,
          icon: buildSalonPriceMarkerIcon(Size, Point, salon.priceFrom, isSelected),
          zIndex: isSelected ? 500 : 100,
        })

        marker.addListener("click", () => {
          onSelectSalon(salon.id)
          mapRef.current?.panTo({ lat: salon.latitude, lng: salon.longitude })
        })

        return marker
      })

      markersRef.current = markers

      if (salons.length > 0) {
        const boundsKey = `${center.lat},${center.lng}:${salons.map((s) => s.id).join(",")}`
        if (boundsKey !== lastBoundsKeyRef.current) {
          const bounds = new LatLngBounds()
          bounds.extend(center)
          salons.forEach((salon) => {
            const position = markerPositions.get(salon.id) ?? {
              lat: salon.latitude,
              lng: salon.longitude,
            }
            bounds.extend(position)
          })
          mapRef.current.fitBounds(bounds, 80)
          lastBoundsKeyRef.current = boundsKey
        }
      }
    }

    void initMap().catch((error) => {
      console.error("[Glammzo] Failed to initialize salon map:", error)
    })

    return () => {
      cancelled = true
    }
  }, [center, markerPositions, onClearSelection, onSelectSalon, salons, selectedSalonId])

  useEffect(() => {
    if (!mapInstance) return
    const frame = window.requestAnimationFrame(() => {
      google.maps.event.trigger(mapInstance, "resize")
      if (selectedLatLng) {
        mapInstance.panTo(selectedLatLng)
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [mapHeightClass, mapInstance, selectedLatLng])

  return (
    <div className="relative">
      <div className={cn("relative w-full", mapHeightClass)}>
        <div
          ref={containerRef}
          className="h-full w-full overflow-hidden rounded-3xl border border-border/60 bg-[#f5f2ec] shadow-sm"
        />

        {showMapPopover && children && selectedSalonId && popoverPlacement ? (
          <div
            className="pointer-events-none absolute z-20"
            style={{
              left: popoverPlacement.left,
              top: popoverPlacement.top,
              transform: popoverPlacement.transform,
            }}
          >
            <div className="pointer-events-auto w-[min(300px,calc(100vw-2rem))] sm:w-[320px]">
              {children}
            </div>
          </div>
        ) : null}

        {onToggleMapExpanded ? (
          <button
            type="button"
            onClick={onToggleMapExpanded}
            aria-label={mapExpanded ? "Exit expanded map view" : "Expand map view"}
            title={mapExpanded ? "Exit expanded view" : "Expand map"}
            className={cn(
              "absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-sm border border-border/70 bg-white text-foreground shadow-md shadow-black/10 transition-colors",
              "hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          >
            {mapExpanded ? (
              <Minimize2Icon className="size-4" aria-hidden />
            ) : (
              <Maximize2Icon className="size-4" aria-hidden />
            )}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void handleMyLocation()}
          disabled={locating}
          aria-label="Go to my current location"
          title="My location"
          className={cn(
            "absolute bottom-28 right-3 z-10 flex size-10 items-center justify-center rounded-full border border-border/70 bg-white text-foreground shadow-md shadow-black/10 transition-colors",
            "hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-70",
          )}
        >
          {locating ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : (
            <LocateFixedIcon className="size-4" aria-hidden />
          )}
        </button>

        {locationError ? (
          <div className="pointer-events-none absolute bottom-4 left-4 right-20 z-10 rounded-2xl border border-destructive/30 bg-white/95 px-3 py-2 text-xs text-destructive shadow-sm">
            {locationError}
          </div>
        ) : null}
      </div>
    </div>
  )
}
