"use client"

import { useState } from "react"

import { SalonGalleryLightbox } from "@/components/salons/salon-gallery-lightbox"
import { cn } from "@/lib/utils"

type SalonGalleryMasonryProps = {
  gallery: string[]
  salonName: string
  className?: string
}

export function SalonGalleryMasonry({ gallery, salonName, className }: SalonGalleryMasonryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  function openAt(index: number) {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div
        className={cn(
          "columns-2 gap-4 sm:columns-3",
          "[column-gap:1rem] sm:[column-gap:1.25rem]",
          className,
        )}
      >
        {gallery.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-muted/30 text-left shadow-sm shadow-black/[0.03] transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            onClick={() => openAt(index)}
            aria-label={`View ${salonName} gallery photo ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${salonName} gallery`}
              className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      <SalonGalleryLightbox
        gallery={gallery}
        salonName={salonName}
        index={activeIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setActiveIndex}
      />
    </>
  )
}
