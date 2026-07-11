"use client"

import { MapPinIcon, StarIcon } from "lucide-react"

import { formatDistanceKm } from "@/lib/maps/haversine"
import type { NearbySalonRecord } from "@/lib/maps/nearby-salon.types"
import { cn } from "@/lib/utils"

type SalonMapSidebarListProps = {
  salons: NearbySalonRecord[]
  selectedSalonId: string | null
  onSelectSalon: (salonId: string) => void
  className?: string
  emptyMessage?: string
}

export function SalonMapSidebarList({
  salons,
  selectedSalonId,
  onSelectSalon,
  className,
  emptyMessage = "No salons with map locations match your filters yet.",
}: SalonMapSidebarListProps) {
  if (salons.length === 0) {
    return (
      <div
        className={cn(
          "flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 text-center",
          className,
        )}
      >
        <p className="font-medium">No salons on the map</p>
        <p className="mt-2 text-sm text-foreground/55">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm shadow-black/[0.04]",
        className,
      )}
    >
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          {salons.length} salon{salons.length === 1 ? "" : "s"}
        </p>
        <p className="mt-0.5 text-xs text-foreground/50">Tap a salon or select a pin on the map</p>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]">
        {salons.map((salon) => {
          const selected = salon.id === selectedSalonId

          return (
            <li key={salon.id}>
              <button
                type="button"
                onClick={() => onSelectSalon(salon.id)}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                  selected
                    ? "bg-primary/8 ring-1 ring-primary/25"
                    : "hover:bg-muted/60",
                )}
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPinIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate font-medium text-foreground">{salon.name}</span>
                    {salon.rating > 0 ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-foreground/60">
                        <StarIcon className="size-3 fill-primary text-primary" />
                        {salon.rating.toFixed(1)}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block truncate text-xs text-foreground/55">
                    {formatDistanceKm(salon.distanceKm)}
                    {salon.area ? ` · ${salon.area}` : null}
                  </span>
                  {salon.priceFrom > 0 ? (
                    <span className="mt-1 block text-xs font-medium text-foreground/70">
                      From ₹{salon.priceFrom}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
