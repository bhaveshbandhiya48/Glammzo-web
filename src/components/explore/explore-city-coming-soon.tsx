"use client"

import Image from "next/image"
import { MapPinIcon } from "lucide-react"

import { media } from "@/data/media"

type ExploreCityComingSoonProps = {
  city: string
}

export function ExploreCityComingSoon({ city }: ExploreCityComingSoonProps) {
  const cityLabel = city.trim() || "your city"

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03]">
      <div className="grid sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)]">
        <div className="relative min-h-[180px] sm:min-h-[240px]">
          <Image
            src={media.sections.exploreComingSoon}
            alt="Modern salon interior"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/20" />
        </div>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            <MapPinIcon className="size-3.5 text-primary" aria-hidden />
            {cityLabel}
          </p>
          <h3 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-foreground">
            Coming soon
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/60 sm:text-[0.95rem]">
            We&apos;re onboarding salon partners in {cityLabel}. Set your location to browse cities
            that are live today.
          </p>
        </div>
      </div>
    </div>
  )
}
