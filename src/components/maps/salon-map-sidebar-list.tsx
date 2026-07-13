"use client"

import { useMemo } from "react"

import { SalonCard } from "@/components/salons/salon-card"
import { cn } from "@/lib/utils"
import type { Salon } from "@/types/salon"

type SalonMapSidebarListProps = {
  salons: Salon[]
  selectedSalonId: string | null
  onSelectSalon: (salonId: string) => void
  className?: string
  emptyMessage?: string
  favoriteSalonIds?: string[]
  authenticated?: boolean
}

export function SalonMapSidebarList({
  salons,
  selectedSalonId,
  onSelectSalon,
  className,
  emptyMessage = "No salons with map locations match your filters yet.",
  favoriteSalonIds = [],
  authenticated = false,
}: SalonMapSidebarListProps) {
  const favoriteSet = useMemo(() => new Set(favoriteSalonIds), [favoriteSalonIds])

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
        "flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border/80 bg-muted/20 shadow-sm shadow-black/[0.04]",
        className,
      )}
    >
      <div className="border-b border-border/60 bg-card px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          {salons.length} salon{salons.length === 1 ? "" : "s"}
        </p>
        <p className="mt-0.5 text-xs text-foreground/50">Tap a salon or select a pin on the map</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:thin]">
        <div className="grid grid-cols-2 gap-3">
          {salons.map((salon) => (
            <SalonCard
              key={salon.id}
              salon={salon}
              density="compact"
              selected={salon.id === selectedSalonId}
              onSelect={() => onSelectSalon(salon.id)}
              favorite={
                salon.crmSalonId
                  ? {
                      authenticated,
                      initialFavorited: favoriteSet.has(salon.crmSalonId),
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
