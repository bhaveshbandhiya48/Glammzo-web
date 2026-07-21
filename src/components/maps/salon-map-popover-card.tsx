"use client"

import Image from "next/image"
import Link from "next/link"
import { StarIcon, XIcon } from "lucide-react"

import { formatDistanceKm } from "@/lib/maps/haversine"
import { formatMapPriceLabel } from "@/lib/maps/price-marker-icon"
import type { NearbySalonRecord } from "@/lib/maps/nearby-salon.types"
import { salonServicesSectionHref } from "@/lib/salons/salon-detail-scroll"
import { cn } from "@/lib/utils"

type SalonMapPopoverCardProps = {
  salon: NearbySalonRecord
  onClose: () => void
  className?: string
}

export function SalonMapPopoverCard({ salon, onClose, className }: SalonMapPopoverCardProps) {
  const salonId = salon.slug || salon.id
  const salonHref = `/salons/${salonId}`
  const bookHref = salonServicesSectionHref(salonId)
  const imageSrc = salon.coverImageUrl || salon.imageUrl
  const priceLabel = formatMapPriceLabel(salon.priceFrom)

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.06]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-stone-100">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={salon.name}
            fill
            className="object-cover"
            sizes="320px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo yet
          </div>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onClose()
          }}
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm ring-1 ring-black/5 transition-colors hover:bg-white"
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <Link href={salonHref} className="block p-4 transition-colors hover:bg-stone-50/80">
        <p className="text-sm text-foreground/55">Salon in {salon.area}</p>
        <h3 className="mt-0.5 font-heading text-[1.05rem] font-semibold leading-snug tracking-tight text-foreground">
          {salon.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground/60">
          {salon.rating > 0 ? (
            <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
              <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
              {salon.rating.toFixed(1)}
              <span className="font-normal text-foreground/45">({salon.reviewCount})</span>
            </span>
          ) : (
            <span className="font-medium text-foreground/70">New on Glammzo</span>
          )}
          <span aria-hidden>·</span>
          <span>{formatDistanceKm(salon.distanceKm)}</span>
        </div>

        <p className="mt-3 text-sm text-foreground/70">
          <span className="font-semibold text-foreground">{priceLabel}</span>
          {salon.priceFrom > 0 ? <span> · services from</span> : null}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              salon.isOpenNow
                ? "bg-emerald-50 text-emerald-800"
                : "bg-stone-100 text-stone-600",
            )}
          >
            {salon.isOpenNow ? "Open now" : "Closed"}
          </span>
          {salon.services.length > 0 ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
              {salon.services.length} service{salon.services.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="border-t border-stone-100 px-4 py-3">
        <Link
          href={bookHref}
          className="inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Book appointment
        </Link>
      </div>
    </article>
  )
}
