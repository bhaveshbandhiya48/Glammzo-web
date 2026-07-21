"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { HeroSalonSlider } from "@/components/hero/hero-salon-slider"
import { useCitySalonCatalog } from "@/hooks/use-city-salon-catalog"
import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { useUserLocation } from "@/hooks/use-user-location"
import { buildExploreNearMeHref } from "@/lib/location-storage"

export function HeroVisual() {
  const { browseCity, coords, nearMe } = useUserLocation()
  const origin = useExploreDistanceOrigin({})
  const { salons, loaded, cityFallback } = useCitySalonCatalog()
  const exploreHref = coords
    ? buildExploreNearMeHref(coords.latitude, coords.longitude)
    : cityFallback
      ? "/explore"
      : browseCity
        ? `/explore?city=${encodeURIComponent(browseCity)}`
        : "/explore"

  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-label="Booking preview">
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--glam-coral)_14%,transparent),transparent_70%)]"
        aria-hidden
      />

      <div className="relative space-y-3 rounded-[1.5rem] border border-border/80 bg-card/60 p-3 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.03] backdrop-blur-sm">
        {loaded ? (
          <HeroSalonSlider
            salons={salons}
            origin={origin}
            browseCity={browseCity}
            hasDeviceLocation={nearMe}
          />
        ) : (
          <div className="aspect-[4/3] w-full animate-pulse rounded-[1.25rem] bg-muted" />
        )}

        <Link
          href={exploreHref}
          className="flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
        >
          {cityFallback ? "Browse live salons" : `Browse salons in ${browseCity}`}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  )
}
