"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { LayoutListIcon, XIcon } from "lucide-react"

import { MapSkeleton } from "@/components/maps/map-skeleton"
import { SalonCard } from "@/components/salons/salon-card"
import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { applySalonDistances } from "@/lib/explore-distance"
import {
  LOCATION_UPDATED_EVENT,
  readStoredLocation,
  writeStoredLocation,
} from "@/lib/location-storage"
import { getExploreMapCenter, mapSalonsToNearbyRecords } from "@/lib/maps/explore-map"
import { isGoogleMapsConfigured } from "@/lib/maps/config"
import { filterSalonsByCity } from "@/lib/salons/city-filter"
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

type ExploreMobileMapOverlayProps = {
  salons: Salon[]
  locationCity?: string
  nearFromUrl?: boolean
  urlLatitude?: number
  urlLongitude?: number
  onClose: () => void
}

/**
 * Airbnb-style fullscreen map for mobile Explore: pins + bottom card carousel + Show list.
 */
export function ExploreMobileMapOverlay({
  salons,
  locationCity,
  nearFromUrl,
  urlLatitude,
  urlLongitude,
  onClose,
}: ExploreMobileMapOverlayProps) {
  const origin = useExploreDistanceOrigin({ nearFromUrl, urlLatitude, urlLongitude })
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null)
  const [showAllRegistered, setShowAllRegistered] = useState(false)
  const carouselRef = useRef<HTMLDivElement | null>(null)

  const mapCenter = getExploreMapCenter(origin)

  const citySalons = useMemo(() => {
    if (!locationCity?.trim()) return salons
    return filterSalonsByCity(salons, locationCity)
  }, [locationCity, salons])

  const scopedSalons = showAllRegistered ? salons : citySalons

  const salonsWithDistance = useMemo(
    () => applySalonDistances(scopedSalons, origin),
    [scopedSalons, origin],
  )

  const mapSalons = useMemo(
    () => mapSalonsToNearbyRecords(salonsWithDistance),
    [salonsWithDistance],
  )

  const carouselSalons = useMemo(() => {
    const onMap = new Set(mapSalons.map((salon) => salon.slug || salon.id))
    return salonsWithDistance.filter((salon) => onMap.has(salon.id))
  }, [mapSalons, salonsWithDistance])

  useEffect(() => {
    setShowAllRegistered(false)
  }, [locationCity])

  useEffect(() => {
    if (mapSalons.length === 0) {
      setSelectedSalonId(null)
      return
    }
    setSelectedSalonId((current) => {
      if (current && mapSalons.some((salon) => salon.id === current)) return current
      return mapSalons.reduce((closest, salon) =>
        salon.distanceKm < closest.distanceKm ? salon : closest,
      ).id
    })
  }, [mapSalons])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    if (!selectedSalonId || !carouselRef.current) return
    const card = carouselRef.current.querySelector<HTMLElement>(
      `[data-salon-id="${selectedSalonId}"]`,
    )
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [selectedSalonId])

  if (!isGoogleMapsConfigured()) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-background p-6">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 inline-flex size-10 items-center justify-center self-end rounded-full border border-border/70 bg-card"
          aria-label="Close map"
        >
          <XIcon className="size-4" />
        </button>
        <p className="text-sm text-foreground/70">
          Google Maps is not configured. Add{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
        </p>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[#f5f2ec]"
      role="dialog"
      aria-modal="true"
      aria-label="Map of salons"
    >
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-foreground shadow-lg shadow-black/15 ring-1 ring-black/5"
        >
          <LayoutListIcon className="size-4" aria-hidden />
          Show list
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-11 items-center justify-center rounded-full bg-white text-foreground shadow-lg shadow-black/15 ring-1 ring-black/5"
          aria-label="Close map"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
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
            onZoomChanged={() => setShowAllRegistered(true)}
            autoFitBounds={!showAllRegistered}
            showMapPopover={false}
            mapHeightClass="h-full"
            mapFrameClassName="rounded-none border-0 shadow-none"
            locateButtonClassName="bottom-[calc(22rem+env(safe-area-inset-bottom))] right-3"
          />
        </div>
      </div>

      {carouselSalons.length > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8">
          <div
            ref={carouselRef}
            className="pointer-events-auto flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselSalons.map((salon) => (
              <div
                key={salon.id}
                data-salon-id={salon.id}
                className="w-[min(78vw,18.5rem)] shrink-0 snap-center"
              >
                <SalonCard
                  salon={salon}
                  density="compact"
                  selected={salon.id === selectedSalonId}
                  onSelect={() => setSelectedSalonId(salon.id)}
                  className="h-full shadow-lg shadow-black/15"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
