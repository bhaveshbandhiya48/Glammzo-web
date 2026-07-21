"use client"

import { SalonDistanceFromYou } from "@/components/salons/salon-distance"
import { Button } from "@/components/ui/button"
import { formatInr } from "@/lib/salons/catalog-utils"
import { scrollToSalonServicesSection } from "@/lib/salons/salon-detail-scroll"
import { cn } from "@/lib/utils"

import type { Salon } from "@/types/salon"

type SalonDetailBookingRailProps = {
  salon: Pick<Salon, "id" | "area" | "address" | "latitude" | "longitude" | "distanceKm">
  salonName: string
  priceFrom: number
  className?: string
}

export function SalonDetailBookingRail({
  salon,
  salonName,
  priceFrom,
  className,
}: SalonDetailBookingRailProps) {
  return (
    <>
      <aside
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 p-4 shadow-[0_-12px_40px_-20px_hsl(var(--foreground)/0.2)] backdrop-blur-md md:hidden",
          className,
        )}
        aria-label="Book appointment"
      >
        <div className="pointer-events-auto mx-auto flex max-w-[1280px] items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold">{salonName}</p>
            <p className="text-xs text-foreground/55">From {formatInr(priceFrom)}</p>
            <SalonDistanceFromYou salon={salon} className="mt-0.5 text-xs font-normal" />
          </div>
          <Button
            type="button"
            size="lg"
            className="shrink-0 px-6"
            onClick={() => scrollToSalonServicesSection()}
          >
            Book
          </Button>
        </div>
      </aside>
    </>
  )
}
