"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

import { MapSkeleton } from "@/components/maps/map-skeleton"
import { SalonMapPopoverCard } from "@/components/maps/salon-map-popover-card"
import { SalonMapSidebarList } from "@/components/maps/salon-map-sidebar-list"
import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { applySalonDistances } from "@/lib/explore-distance"
import {
  LOCATION_UPDATED_EVENT,
  readStoredLocation,
  writeStoredLocation,
} from "@/lib/location-storage"
import { getExploreMapCenter, mapSalonsToNearbyRecords } from "@/lib/maps/explore-map"
import { isGoogleMapsConfigured } from "@/lib/maps/config"
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

export function ExploreGoogleMap({
  salons,
  nearFromUrl,
  urlLatitude,
  urlLongitude,
  favoriteSalonIds = [],
  authenticated = false,
}: ExploreGoogleMapProps) {
  const origin = useExploreDistanceOrigin({ nearFromUrl, urlLatitude, urlLongitude })
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null)
  const [mapExpanded, setMapExpanded] = useState(false)

  const mapCenter = getExploreMapCenter(origin)

  const salonsWithDistance = useMemo(
    () => applySalonDistances(salons, origin),
    [salons, origin],
  )

  const mapSalons = useMemo(
    () => mapSalonsToNearbyRecords(salonsWithDistance),
    [salonsWithDistance],
  )

  const sidebarSalons = useMemo(() => {
    const mapIds = new Set(mapSalons.map((salon) => salon.id))
    return salonsWithDistance.filter((salon) => mapIds.has(salon.id))
  }, [salonsWithDistance, mapSalons])

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

  return (
    <div
      className={cn(
        "grid gap-4 lg:items-start",
        mapExpanded ? "grid-cols-1" : "lg:grid-cols-2",
      )}
    >
      <CustomerSalonMapCanvas
        center={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
        salons={mapSalons}
        selectedSalonId={selectedSalonId}
        onSelectSalon={setSelectedSalonId}
        onClearSelection={() => setSelectedSalonId(null)}
        onUserLocationFound={(coords) => {
          const current = readStoredLocation()?.stored
          if (current) {
            writeStoredLocation({
              ...current,
              nearMe: true,
              latitude: coords.latitude,
              longitude: coords.longitude,
            })
          }
          window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT))
        }}
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
        <SalonMapSidebarList
          salons={sidebarSalons}
          selectedSalonId={selectedSalonId}
          onSelectSalon={setSelectedSalonId}
          className={cn("min-h-80", mapHeightClass)}
          emptyMessage="No salons with map coordinates are available yet."
          favoriteSalonIds={favoriteSalonIds}
          authenticated={authenticated}
        />
      ) : null}
    </div>
  )
}
