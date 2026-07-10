"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, StarIcon } from "lucide-react"

import { media } from "@/data/media"
import { MirrorShine } from "@/components/hero/MirrorShine"
import { sortSalonsByDistance } from "@/lib/geo"
import { cn } from "@/lib/utils"
import type { Salon } from "@/types/salon"

type SalonWithDistance = Salon & { distanceKm: number }

type HeroSalonSliderProps = {
  salons: Salon[]
  coords: { latitude: number; longitude: number } | null
  browseCity: string
  maxSlides?: number
}

function formatDistanceKm(km: number): string {
  if (km < 1) return `${(Math.round(km * 10) / 10).toFixed(1)} km`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

function badgeForSalon(salon: SalonWithDistance, index: number, hasCoords: boolean): string {
  if (!hasCoords) return index === 0 ? "Trending in town" : "Popular nearby"
  if (index === 0 && salon.distanceKm <= 8) return "Trending in your area"
  if (salon.distanceKm <= 15) return "Nearby"
  return "In your city"
}

function HeroSalonSlide({
  salon,
  badge,
  showDistance,
  isActive,
}: {
  salon: SalonWithDistance
  badge: string
  showDistance: boolean
  isActive: boolean
}) {
  return (
    <Link
      href={`/salons/${salon.id}`}
      className="group block w-full shrink-0 snap-center overflow-hidden rounded-[1.25rem] bg-card ring-1 ring-black/[0.04] transition-shadow hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.2)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={salon.coverImageUrl ?? salon.imageUrl}
          alt={salon.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 480px"
          priority={isActive}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        {isActive ? <MirrorShine /> : null}

        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-[var(--glam-coral)]" aria-hidden />
            {badge}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <span
              className={cn(
                "size-1.5 rounded-full",
                salon.isOpenNow ? "bg-emerald-400" : "bg-white/50"
              )}
              aria-hidden
            />
            {salon.isOpenNow ? "Open now" : "Closed"}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[1.65rem]">
                {salon.name}
              </h3>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/75">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
                  {salon.area}
                  {showDistance ? ` · ${formatDistanceKm(salon.distanceKm)}` : null}
                </span>
                <span className="text-white/35" aria-hidden>
                  ·
                </span>
                <span>
                  {salon.priceFrom > 0 ? `From ₹${salon.priceFrom}` : "View services"}
                </span>
              </p>
            </div>
            {salon.rating > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                <StarIcon className="size-3.5 fill-amber-300 text-amber-300" aria-hidden />
                {salon.rating.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function HeroSalonSlider({
  salons,
  coords,
  browseCity,
  maxSlides = 6,
}: HeroSalonSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const slides = useMemo((): SalonWithDistance[] => {
    if (salons.length === 0) return []
    if (coords) {
      return sortSalonsByDistance(salons, coords.latitude, coords.longitude).slice(0, maxSlides)
    }
    return salons.slice(0, maxSlides).map((salon) => ({ ...salon, distanceKm: salon.distanceKm }))
  }, [salons, coords, maxSlides])

  const syncActiveIndex = useCallback(() => {
    const container = scrollRef.current
    if (!container || slides.length === 0) return
    const width = container.clientWidth
    if (width <= 0) return
    const index = Math.round(container.scrollLeft / width)
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1))
  }, [slides.length])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.addEventListener("scroll", syncActiveIndex, { passive: true })
    return () => container.removeEventListener("scroll", syncActiveIndex)
  }, [syncActiveIndex])

  useEffect(() => {
    setActiveIndex(0)
    scrollRef.current?.scrollTo({ left: 0, behavior: "instant" })
  }, [slides.length, coords?.latitude, coords?.longitude])

  const scrollTo = (index: number) => {
    const container = scrollRef.current
    if (!container) return
    const clamped = Math.min(Math.max(index, 0), slides.length - 1)
    container.scrollTo({ left: clamped * container.clientWidth, behavior: "smooth" })
    setActiveIndex(clamped)
  }

  if (slides.length === 0) {
    return (
      <Link
        href="/explore"
        className="group block w-full overflow-hidden rounded-[1.25rem] bg-card ring-1 ring-black/[0.04]"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={media.salons.s1}
            alt="Explore salons"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 480px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <h3 className="font-heading text-2xl font-semibold text-white">Explore salons</h3>
            <p className="mt-2 text-sm text-white/75">Browse salons in {browseCity}</p>
          </div>
        </div>
      </Link>
    )
  }

  const showDistance = Boolean(coords)
  const canNavigate = slides.length > 1

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )}
        aria-roledescription="carousel"
        aria-label="Nearby salons"
      >
        {slides.map((salon, index) => (
          <div key={salon.id} className="w-full shrink-0 snap-center">
            <HeroSalonSlide
              salon={salon}
              badge={badgeForSalon(salon, index, showDistance)}
              showDistance={showDistance}
              isActive={index === activeIndex}
            />
          </div>
        ))}
      </div>

      {canNavigate ? (
        <>
          <button
            type="button"
            aria-label="Previous salon"
            onClick={() => scrollTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={cn(
              "absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition-opacity",
              activeIndex === 0 ? "pointer-events-none opacity-0" : "opacity-100 hover:bg-black/50"
            )}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next salon"
            onClick={() => scrollTo(activeIndex + 1)}
            disabled={activeIndex === slides.length - 1}
            className={cn(
              "absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition-opacity",
              activeIndex === slides.length - 1
                ? "pointer-events-none opacity-0"
                : "opacity-100 hover:bg-black/50"
            )}
          >
            <ChevronRightIcon className="size-4" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {slides.map((salon, index) => (
              <button
                key={salon.id}
                type="button"
                aria-label={`Go to ${salon.name}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === activeIndex
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-foreground/25 hover:bg-foreground/40"
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
