"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2Icon, MapPinIcon, SearchIcon } from "lucide-react"

import { MapSkeleton } from "@/components/maps/map-skeleton"
import { SalonMapPopoverCard } from "@/components/maps/salon-map-popover-card"
import { SalonMapSidebarList } from "@/components/maps/salon-map-sidebar-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_NEARBY_RADIUS_KM,
  isGoogleMapsConfigured,
} from "@/lib/maps/config"
import type { NearbySalonRecord, NearbySalonsResponse } from "@/lib/maps/nearby-salon.types"
import { nearbyRecordToSalonPreview } from "@/lib/maps/explore-map"
import { requestUserLocation } from "@/lib/geo"
import { cn } from "@/lib/utils"

const CustomerSalonMapCanvas = dynamic(
  () => import("@/components/maps/customer-salon-map-canvas").then((mod) => mod.CustomerSalonMapCanvas),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
)

type MapViewState = "locating" | "loading" | "ready" | "error"

type MapCenter = {
  latitude: number
  longitude: number
  label: string
}

export function CustomerSalonMap() {
  const mapsConfigured = isGoogleMapsConfigured()
  const [viewState, setViewState] = useState<MapViewState>("locating")
  const [error, setError] = useState<string | null>(null)
  const [center, setCenter] = useState<MapCenter>(DEFAULT_MAP_CENTER)
  const [radiusKm, setRadiusKm] = useState(DEFAULT_NEARBY_RADIUS_KM)
  const [query, setQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [salons, setSalons] = useState<NearbySalonRecord[]>([])
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null)
  const [mapExpanded, setMapExpanded] = useState(false)

  const selectedSalon = useMemo(
    () => salons.find((salon) => salon.id === selectedSalonId) ?? null,
    [salons, selectedSalonId],
  )

  const sidebarSalons = useMemo(
    () => salons.map((salon) => nearbyRecordToSalonPreview(salon)),
    [salons],
  )

  const loadNearbySalons = useCallback(
    async (latitude: number, longitude: number, nextQuery = query) => {
      setViewState("loading")
      setError(null)

      try {
        const params = new URLSearchParams({
          lat: String(latitude),
          lng: String(longitude),
          radius: String(radiusKm),
        })

        if (nextQuery.trim()) {
          params.set("q", nextQuery.trim())
        }

        const response = await fetch(`/api/salons/nearby?${params.toString()}`)
        const payload = (await response.json()) as NearbySalonsResponse & { error?: string }

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load nearby salons.")
        }

        setSalons(payload.salons)
        setCenter({ latitude: payload.center.latitude, longitude: payload.center.longitude, label: "You" })
        setViewState("ready")
        setSelectedSalonId((current) => current ?? payload.salons[0]?.id ?? null)
      } catch (loadError) {
        setViewState("error")
        setError(loadError instanceof Error ? loadError.message : "Could not load nearby salons.")
      }
    },
    [query, radiusKm],
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const position = await requestUserLocation()
        if (cancelled) return

        const params = new URLSearchParams({
          lat: String(position.latitude),
          lng: String(position.longitude),
          radius: String(DEFAULT_NEARBY_RADIUS_KM),
        })
        const response = await fetch(`/api/salons/nearby?${params.toString()}`)
        const payload = (await response.json()) as NearbySalonsResponse
        if (cancelled) return
        setSalons(payload.salons)
        setCenter({
          latitude: payload.center.latitude,
          longitude: payload.center.longitude,
          label: "You",
        })
        setSelectedSalonId(payload.salons[0]?.id ?? null)
        setViewState("ready")
      } catch {
        if (cancelled) return
        const params = new URLSearchParams({
          lat: String(DEFAULT_MAP_CENTER.latitude),
          lng: String(DEFAULT_MAP_CENTER.longitude),
          radius: String(DEFAULT_NEARBY_RADIUS_KM),
        })
        const response = await fetch(`/api/salons/nearby?${params.toString()}`)
        const payload = (await response.json()) as NearbySalonsResponse
        if (cancelled) return
        setSalons(payload.salons)
        setCenter(DEFAULT_MAP_CENTER)
        setSelectedSalonId(payload.salons[0]?.id ?? null)
        setViewState("ready")
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  if (!mapsConfigured) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm">
        <p className="font-medium text-foreground">Google Maps is not configured.</p>
        <p className="mt-2 text-foreground/60">
          Add <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
          enable the interactive map.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(searchInput)
            void loadNearbySalons(center.latitude, center.longitude, searchInput)
          }}
        >
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search salon, service, or area"
              className="h-11 rounded-full pl-10"
            />
          </div>
          <Button type="submit" className="h-11 rounded-full px-5">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <MapPinIcon className="size-4" />
          Within {radiusKm} km
        </div>
      </div>

      {viewState === "error" ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="relative">
        <div
          className={cn(
            "grid gap-4 lg:items-start",
            mapExpanded ? "grid-cols-1" : "lg:grid-cols-2",
          )}
        >
        {viewState === "locating" || viewState === "loading" ? (
          <div className={cn("relative", mapExpanded ? "h-[min(85vh,56rem)]" : "h-[min(72vh,42rem)]")}>
            <MapSkeleton />
          </div>
        ) : null}
        {viewState === "ready" ? (
          <CustomerSalonMapCanvas
            center={{ lat: center.latitude, lng: center.longitude }}
            salons={salons}
            selectedSalonId={selectedSalonId}
            onSelectSalon={setSelectedSalonId}
            onClearSelection={() => setSelectedSalonId(null)}
            onUserLocationFound={(coords) => {
              setCenter({ latitude: coords.latitude, longitude: coords.longitude, label: "You" })
              void loadNearbySalons(coords.latitude, coords.longitude)
            }}
            showMapPopover={mapExpanded}
            mapExpanded={mapExpanded}
            onToggleMapExpanded={() => setMapExpanded((current) => !current)}
            mapHeightClass={mapExpanded ? "h-[min(85vh,56rem)]" : "h-[min(72vh,42rem)]"}
          >
            {mapExpanded && selectedSalon ? (
              <SalonMapPopoverCard
                salon={selectedSalon}
                onClose={() => setSelectedSalonId(null)}
              />
            ) : null}
          </CustomerSalonMapCanvas>
        ) : null}

        {!mapExpanded && viewState === "ready" ? (
          <SalonMapSidebarList
            salons={sidebarSalons}
            selectedSalonId={selectedSalonId}
            onSelectSalon={setSelectedSalonId}
            className="min-h-[min(72vh,42rem)]"
            emptyMessage="No published salons with map pins were found in this area yet."
          />
        ) : null}

        {(viewState === "locating" || viewState === "loading") && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-sm">
              <Loader2Icon className="size-4 animate-spin" />
              {viewState === "locating" ? "Getting your location…" : "Loading nearby salons…"}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
