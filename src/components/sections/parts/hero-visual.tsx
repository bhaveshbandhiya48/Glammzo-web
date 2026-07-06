"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, MapPinIcon, StarIcon } from "lucide-react"

import { media } from "@/data/media"

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none" aria-label="Booking preview">
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--glam-coral)_14%,transparent),transparent_70%)]"
        aria-hidden
      />

      <div className="relative space-y-3 rounded-[1.5rem] border border-border/80 bg-card/60 p-3 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.03] backdrop-blur-sm">
        {/* Featured salon */}
        <Link
          href="/salons/s1"
          className="group block overflow-hidden rounded-[1.25rem] bg-card ring-1 ring-black/[0.04] transition-shadow hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.2)]"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            <Image
              src={media.salons.s1}
              alt="Velvet & Co. Studio interior"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 480px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
              Open now
            </span>

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[1.65rem]">
                    Velvet &amp; Co. Studio
                  </h3>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/75">
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
                      Indiranagar
                    </span>
                    <span className="text-white/35" aria-hidden>
                      ·
                    </span>
                    <span>From ₹799</span>
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                  <StarIcon className="size-3.5 fill-amber-300 text-amber-300" aria-hidden />
                  4.9
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/explore"
          className="flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
        >
          Browse salons in Bengaluru
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  )
}
