"use client"

import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "lucide-react"

import type { Salon } from "@/types/salon"
import { formatDistanceKmShort } from "@/lib/maps/haversine"
import { cn } from "@/lib/utils"

type MapListingCardProps = {
  salon: Salon
  active?: boolean
  onFocus?: () => void
  className?: string
}

/**
 * Compact horizontal salon strip for mobile map carousel.
 * Matches Glammzo mobile MapOverlay listing cards (~300×112).
 */
export function MapListingCard({
  salon,
  active = false,
  onFocus,
  className,
}: MapListingCardProps) {
  const href = `/salons/${salon.id}`
  const imageSrc = salon.coverImageUrl || salon.imageUrl
  const distanceLabel =
    salon.distanceKm != null && Number.isFinite(salon.distanceKm)
      ? formatDistanceKmShort(salon.distanceKm)
      : null
  const subtitle = [salon.area, salon.businessType].filter(Boolean).join(" · ")
  const priceFrom = Math.round(Number(salon.priceFrom) || 0)

  return (
    <article
      className={cn(
        "relative flex h-[7rem] w-full overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.06]",
        active && "ring-2 ring-primary shadow-[0_4px_18px_rgba(232,93,74,0.28)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onFocus}
        className="absolute inset-0 z-0"
        aria-label={`Focus ${salon.name} on map`}
      />

      <div className="relative z-[1] h-full w-[7rem] shrink-0 bg-muted pointer-events-none">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : null}
      </div>

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2 pointer-events-none">
        <p className="truncate text-sm font-semibold leading-tight text-foreground">
          {salon.name}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-foreground/55">{subtitle}</p>
        ) : null}
        <div className="mt-0.5 flex items-center gap-2">
          {salon.rating > 0 ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-px text-[11px] font-medium text-white">
              <StarIcon className="size-2.5 fill-current" aria-hidden />
              {salon.rating.toFixed(1)}
            </span>
          ) : null}
          {distanceLabel ? (
            <span className="text-[11px] text-foreground/55">{distanceLabel}</span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            {priceFrom > 0 ? `₹${priceFrom}` : "View prices"}
          </p>
          <Link
            href={href}
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto relative z-[2] px-1 py-0.5 text-xs font-medium text-primary"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  )
}
