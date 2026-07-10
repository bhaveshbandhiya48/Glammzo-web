"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

import { MapSkeleton } from "@/components/maps/map-skeleton"
import { SalonMapPopoverCard } from "@/components/maps/salon-map-popover-card"
import { SalonCard } from "@/components/salons/salon-card"
import { getFallbackMapCenter, mapSalonsToNearbyRecords } from "@/lib/maps/explore-map"
import { DEFAULT_MAP_CENTER, isGoogleMapsConfigured } from "@/lib/maps/config"
import {
  LOCATION_UPDATED_EVENT,
  hasActiveNearMe,
  readStoredLocation,
} from "@/lib/location-storage"
import { cn } from "@/lib/utils"
import type { Salon } from "@/types/salon"

const CustomerSalonMapCanvas = dynamic(
  () =>
    import("@/components/maps/customer-salon-map-canvas").then(
      (mod) => mod.CustomerSalonMapCanvas,
    ),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
)

type ExploreGoogleMapProps = {
  salons: Salon[]
  nearFromUrl?: boolean
  urlLatitude?: number
  urlLongitude?: number
  favoriteSalonIds?: string[]
  authenticated?: boolean
}

const MAP_HEIGHT_DEFAULT = "h-[min(72vh,42rem)]"
const MAP_HEIGHT_EXPANDED = "h-[min(85vh,56rem)]"

function parseCoord(value: number | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null
  return value
}

export function ExploreGoogleMap({
  salons,
  nearFromUrl,
  urlLatitude,
  urlLongitude,
  favoriteSalonIds = [],
  authenticated = false,
}: ExploreGoogleMapProps) {
  const [center, setCenter] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null)
  const [mapExpanded, setMapExpanded] = useState(false)

  useEffect(() => {
    const syncCenter = () => {
      const urlLat = parseCoord(urlLatitude)
      const urlLng = parseCoord(urlLongitude)

      if (nearFromUrl && urlLat != null && urlLng != null) {
        setCenter({ latitude: urlLat, longitude: urlLng })
        return
      }

      const stored = readStoredLocation()?.stored
      if (hasActiveNearMe(stored) && stored?.latitude != null && stored?.longitude != null) {
        setCenter({ latitude: stored.latitude, longitude: stored.longitude })
        return
      }

      setCenter(getFallbackMapCenter(salons))
    }

    syncCenter()
    window.addEventListener(LOCATION_UPDATED_EVENT, syncCenter)
    window.addEventListener("storage", syncCenter)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, syncCenter)
      window.removeEventListener("storage", syncCenter)
    }
  }, [nearFromUrl, salons, urlLatitude, urlLongitude])

  const mapSalons = useMemo(
    () => mapSalonsToNearbyRecords(salons, center),
    [salons, center],
  )

  useEffect(() => {
    if (mapSalons.length === 0) {
      setSelectedSalonId(null)
      return
    }

    setSelectedSalonId((current) => {
      if (current && mapSalons.some((salon) => salon.id === current)) {
        return current
      }

      const nearest = mapSalons.reduce((closest, salon) =>
        salon.distanceKm < closest.distanceKm ? salon : closest,
      )
      return nearest.id
    })
  }, [mapSalons])

  const selectedSalon = useMemo(
    () => mapSalons.find((salon) => salon.id === selectedSalonId) ?? null,
    [mapSalons, selectedSalonId],
  )

  const selectedListSalon = useMemo(() => {
    if (!selectedSalonId) return null
    const salon = salons.find((item) => item.id === selectedSalonId)
    if (!salon) return null
    if (selectedSalon) {
      return { ...salon, distanceKm: selectedSalon.distanceKm }
    }
    return salon
  }, [salons, selectedSalon, selectedSalonId])

  const mapCenter = center ?? {
    latitude: DEFAULT_MAP_CENTER.latitude,
    longitude: DEFAULT_MAP_CENTER.longitude,
  }

  const mapHeightClass = mapExpanded ? MAP_HEIGHT_EXPANDED : MAP_HEIGHT_DEFAULT

  if (!isGoogleMapsConfigured()) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm">
        <p className="font-medium text-foreground">Google Maps is not configured.</p>
        <p className="mt-2 text-foreground/60">
          Add{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
          enable the interactive map.
        </p>
      </div>
    )
  }

  if (!center) {
    return <MapSkeleton />
  }

  return (
    <div
      className={cn(
        "grid gap-4 lg:items-start",
        mapExpanded ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_360px]",
      )}
    >
      <CustomerSalonMapCanvas
        center={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
        salons={mapSalons}
        selectedSalonId={selectedSalonId}
        onSelectSalon={setSelectedSalonId}
        onClearSelection={() => setSelectedSalonId(null)}
        onUserLocationFound={setCenter}
        showMapPopover={mapExpanded}
        mapExpanded={mapExpanded}
        onToggleMapExpanded={() => setMapExpanded((current) => !current)}
        mapHeightClass={mapHeightClass}
      >
        {mapExpanded && selectedSalon ? (
          <SalonMapPopoverCard
            salon={selectedSalon}
            onClose={() => setSelectedSalonId(null)}
          />
        ) : null}
      </CustomerSalonMapCanvas>

      {!mapExpanded ? (
        <div className={cn("min-h-80", mapHeightClass)}>
          {selectedListSalon ? (
            <SalonCard
              salon={selectedListSalon}
              favorite={
                selectedListSalon.crmSalonId
                  ? {
                      authenticated,
                      initialFavorited: favoriteSalonIds.includes(selectedListSalon.crmSalonId),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 text-center">
              <p className="font-medium">Select a salon on the map</p>
              <p className="mt-2 text-sm text-foreground/55">
                {mapSalons.length === 0
                  ? "No salons with map locations match your filters yet."
                  : `${mapSalons.length} salon${mapSalons.length === 1 ? "" : "s"} on the map`}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
