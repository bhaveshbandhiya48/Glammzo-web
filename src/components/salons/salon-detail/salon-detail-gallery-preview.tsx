"use client"

import { useState } from "react"
import Image from "next/image"

import { SalonGalleryLightbox } from "@/components/salons/salon-gallery-lightbox"
import { cn } from "@/lib/utils"

type SalonDetailGalleryPreviewProps = {
  gallery: string[]
  coverImageUrl: string
  salonName: string
  className?: string
}

export function SalonDetailGalleryPreview({
  gallery,
  coverImageUrl,
  salonName,
  className,
}: SalonDetailGalleryPreviewProps) {
  const images =
    gallery.length > 0
      ? gallery
      : coverImageUrl
        ? [coverImageUrl]
        : []

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) return null

  const preview = images.slice(0, 5)
  const remaining = Math.max(0, images.length - preview.length)

  function openAt(index: number) {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div
        className={cn(
          "grid h-[200px] gap-2 overflow-hidden rounded-2xl sm:h-[220px] sm:grid-cols-4 sm:grid-rows-2",
          className,
        )}
      >
        <button
          type="button"
          className="relative col-span-2 row-span-2 overflow-hidden rounded-2xl transition duration-200 hover:brightness-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onClick={() => openAt(0)}
          aria-label={`View ${salonName} gallery photo 1`}
        >
          <Image
            src={preview[0]!}
            alt=""
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </button>

        {preview.slice(1, 5).map((src, offset) => {
          const index = offset + 1
          const isLast = index === 4 && remaining > 0
          return (
            <button
              key={`${src}-${index}`}
              type="button"
              className="relative hidden overflow-hidden rounded-xl transition duration-200 hover:brightness-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:block"
              onClick={() => openAt(index)}
              aria-label={
                isLast
                  ? `View all ${images.length} photos`
                  : `View ${salonName} gallery photo ${index + 1}`
              }
            >
              <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
              {isLast ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                  +{remaining} photos
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <SalonGalleryLightbox
        gallery={images}
        salonName={salonName}
        index={activeIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setActiveIndex}
      />
    </>
  )
}
