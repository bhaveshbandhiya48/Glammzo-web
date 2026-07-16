"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { MapPinIcon } from "lucide-react"

import type { Salon } from "@/types/salon"
import { distanceToSalonKm, getSalonCoordinates } from "@/lib/geo"
import {
  LOCATION_UPDATED_EVENT,
  hasActiveNearMe,
  readStoredLocation,
} from "@/lib/location-storage"

type ExploreScatterMapProps = {
  salons: Salon[]
  /** From URL ?near=1, prefer sorting by user coordinates */
  nearFromUrl?: boolean
  urlLatitude?: number
  urlLongitude?: number
  radiusKm?: number | null
}

function parseCoord(value: number | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null
  return value
}

export function ExploreScatterMap({
  salons,
  nearFromUrl,
  urlLatitude,
  urlLongitude,
  radiusKm,
}: ExploreScatterMapProps) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const syncCoords = () => {
    const urlLat = parseCoord(urlLatitude)
    const urlLng = parseCoord(urlLongitude)

    if (nearFromUrl && urlLat != null && urlLng != null) {
      setCoords({ latitude: urlLat, longitude: urlLng })
      return
    }

    const stored = readStoredLocation()?.stored
    if (hasActiveNearMe(stored) && stored?.latitude != null && stored?.longitude != null) {
      setCoords({ latitude: stored.latitude, longitude: stored.longitude })
      return
    }

    setCoords(null)
  }

  useEffect(() => {
    syncCoords()
    const onUpdate = () => syncCoords()
    window.addEventListener(LOCATION_UPDATED_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearFromUrl, urlLatitude, urlLongitude])

  const displaySalons = useMemo(() => {
    if (!coords || radiusKm == null) return salons

    return salons.filter((salon) => {
      const d = distanceToSalonKm(salon, coords.latitude, coords.longitude)
      // Keep salons we can't measure (no coords); only drop those known farther than radius.
      if (!(d > 0) || !Number.isFinite(d)) return true
      return d <= radiusKm
    })
  }, [salons, coords, radiusKm])

  const points = useMemo(() => {
    return displaySalons.map((salon) => {
      const { lat, lng } = getSalonCoordinates(salon)
      return { salon, lat, lng }
    })
  }, [displaySalons])

  const bounds = useMemo(() => {
    if (points.length === 0) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
    }

    const latVals = points.map((p) => p.lat)
    const lngVals = points.map((p) => p.lng)

    if (coords) {
      latVals.push(coords.latitude)
      lngVals.push(coords.longitude)
    }

    const minLat = Math.min(...latVals)
    const maxLat = Math.max(...latVals)
    const minLng = Math.min(...lngVals)
    const maxLng = Math.max(...lngVals)

    return { minLat, maxLat, minLng, maxLng }
  }, [points, coords])

  const project = (lat: number, lng: number) => {
    const latSpan = bounds.maxLat - bounds.minLat || 1e-6
    const lngSpan = bounds.maxLng - bounds.minLng || 1e-6

    const x = (lng - bounds.minLng) / lngSpan
    const y = 1 - (lat - bounds.minLat) / latSpan

    return { x, y }
  }

  if (points.length === 0) {
    return (
      <div className="relative h-[520px] overflow-hidden rounded-3xl border border-border/70 bg-card/40 p-6">
        <p className="text-sm text-muted-foreground">Map preview unavailable.</p>
      </div>
    )
  }

  return (
    <div className="relative h-[520px] overflow-hidden rounded-3xl border border-border/70 bg-card/40">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const v = i * 20
          return <line key={`h-${i}`} x1="0" y1={v} x2="100" y2={v} stroke="currentColor" strokeWidth="0.6" />
        })}
        {Array.from({ length: 6 }).map((_, i) => {
          const v = i * 20
          return <line key={`v-${i}`} x1={v} y1="0" x2={v} y2="100" stroke="currentColor" strokeWidth="0.6" />
        })}
      </svg>

      {coords ? (
        (() => {
          const p = project(coords.latitude, coords.longitude)
          return (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
              title="Your location"
              aria-label="Your location"
            >
              <div className="flex items-center gap-2 rounded-full bg-background/85 px-3 py-2 shadow-sm ring-1 ring-border/60">
                <MapPinIcon className="size-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">You</span>
              </div>
            </div>
          )
        })()
      ) : null}

      {points.map(({ salon, lat, lng }) => {
        const p = project(lat, lng)
        const isActive = activeId === salon.id

        return (
          <Link
            key={salon.id}
            href={`/salons/${salon.id}`}
            onMouseEnter={() => setActiveId(salon.id)}
            onMouseLeave={() => setActiveId(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            aria-label={`View ${salon.name}`}
            title={`${salon.name} (${salon.area})`}
          >
            <div
              className={[
                "flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 shadow-sm shadow-black/[0.05] backdrop-blur",
                isActive ? "ring-2 ring-primary/30" : "ring-0",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex size-2.5 shrink-0 rounded-full",
                  isActive ? "bg-primary" : "bg-muted-foreground/60",
                ].join(" ")}
              />
              <span className="hidden text-xs font-semibold text-foreground sm:block">
                {salon.name}
              </span>
            </div>
          </Link>
        )
      })}

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4">
        <div className="rounded-2xl border border-border/60 bg-background/80 px-3 py-2">
          <p className="text-xs font-semibold text-foreground/70">Map-based discovery</p>
          <p className="mt-0.5 text-xs text-foreground/45">
            Approximate positions for this demo view.
          </p>
        </div>
      </div>
    </div>
  )
}

