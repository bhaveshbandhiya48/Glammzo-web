"use client"

import Link from "next/link"

import { SalonCard } from "@/components/salons/salon-card"
import { buildSalonMarqueeTrack } from "@/lib/salons/nearby-salons"
import type { SalonWithDistance } from "@/lib/salons/nearby-salons"
import { cn } from "@/lib/utils"

type SalonMarqueeBandProps = {
  salons: SalonWithDistance[]
  className?: string
}

const MARQUEE_CARD_WIDTH = "w-[min(88vw,300px)] sm:w-[300px] lg:w-[320px]"

export function SalonMarqueeBand({ salons, className }: SalonMarqueeBandProps) {
  const track = buildSalonMarqueeTrack(salons)
  const durationSec = Math.max(16, track.length * 3.5)

  if (track.length === 0) {
    return (
      <div className={cn("bg-muted/20 px-6 py-10 text-center", className)}>
        <p className="text-sm text-foreground/60">
          No salons within 10 km right now. Try exploring the full city list.
        </p>
        <Link
          href="/explore"
          className="mt-3 inline-block text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Browse all salons
        </Link>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "salon-marquee-band relative w-full py-0",
        className,
      )}
    >
      <div className="salon-marquee-viewport">
        <div
          className="salon-marquee-track flex w-max items-stretch gap-5 px-4 will-change-transform sm:gap-6 sm:px-6"
          style={{ ["--salon-marquee-duration" as string]: `${durationSec}s` }}
          aria-label="Nearby salon listings"
        >
          {track.map((salon, index) => (
            <div key={`${salon.id}-${index}`} className={cn("shrink-0", MARQUEE_CARD_WIDTH)}>
              <SalonCard salon={salon} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
