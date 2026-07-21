"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPinIcon, StarIcon, XIcon } from "lucide-react"

import { formatDistanceKm } from "@/lib/maps/haversine"
import type { NearbySalonRecord } from "@/lib/maps/nearby-salon.types"
import { salonServicesSectionHref } from "@/lib/salons/salon-detail-scroll"
import { Button } from "@/components/ui/button"

type SalonMapCardProps = {
  salon: NearbySalonRecord
  onClose: () => void
}

export function SalonMapCard({ salon, onClose }: SalonMapCardProps) {
  const salonId = salon.slug || salon.id
  const bookHref = salonServicesSectionHref(salonId)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl shadow-black/10">
      <div className="relative aspect-[16/10] w-full bg-muted">
        {salon.imageUrl ? (
          <Image
            src={salon.imageUrl}
            alt={salon.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo yet
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/90 backdrop-blur"
          aria-label="Close salon details"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight">{salon.name}</h2>
            {salon.rating > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                {salon.rating.toFixed(1)}
                <span className="text-foreground/50">({salon.reviewCount})</span>
              </span>
            ) : null}
          </div>
          <p className="inline-flex items-center gap-1.5 text-sm text-foreground/60">
            <MapPinIcon className="size-4 shrink-0" />
            {formatDistanceKm(salon.distanceKm)}
            {salon.area ? ` · ${salon.area}` : null}
          </p>
          <p className="text-sm text-foreground/55">{salon.fullAddress}</p>
        </div>

        {salon.services.length > 0 ? (
          <div className="min-h-0 flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/45">
              Popular services
            </p>
            <ul className="space-y-2 overflow-y-auto pr-1">
              {salon.services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{service.name}</p>
                    <p className="text-xs text-foreground/50">{service.category}</p>
                  </div>
                  <p className="shrink-0 font-medium">₹{service.price}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 pt-1">
          <Button asChild size="lg">
            <Link href={bookHref}>Book appointment</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/salons/${salonId}`}>View salon profile</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
