"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type SalonCardImageSliderProps = {
  images: string[]
  salonName: string
  compact?: boolean
  href?: string
  onActivate?: () => void
}

export function SalonCardImageSlider({
  images,
  salonName,
  compact = false,
  href,
  onActivate,
}: SalonCardImageSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultiple = images.length > 1

  const syncActiveIndex = useCallback(() => {
    const container = scrollRef.current
    if (!container || images.length === 0) {
      return
    }

    const width = container.clientWidth
    if (width <= 0) {
      return
    }

    const index = Math.round(container.scrollLeft / width)
    setActiveIndex(Math.min(Math.max(index, 0), images.length - 1))
  }, [images.length])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) {
      return
    }

    container.addEventListener("scroll", syncActiveIndex, { passive: true })
    return () => container.removeEventListener("scroll", syncActiveIndex)
  }, [syncActiveIndex])

  useEffect(() => {
    setActiveIndex(0)
    scrollRef.current?.scrollTo({ left: 0, behavior: "instant" })
  }, [images])

  const scrollTo = (index: number) => {
    const container = scrollRef.current
    if (!container) {
      return
    }

    const clamped = Math.min(Math.max(index, 0), images.length - 1)
    container.scrollTo({ left: clamped * container.clientWidth, behavior: "smooth" })
    setActiveIndex(clamped)
  }

  const imageSizes = compact ? "(max-width: 1024px) 50vw, 25vw" : "(max-width: 768px) 100vw, 33vw"

  const renderSlide = (src: string, index: number) => {
    const image = (
      <Image
        src={src}
        alt={`${salonName} photo ${index + 1}`}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes={imageSizes}
        priority={index === 0}
      />
    )

    if (href) {
      return (
        <Link href={href} className="relative block h-full w-full">
          {image}
        </Link>
      )
    }

    if (onActivate) {
      return (
        <button
          type="button"
          onClick={onActivate}
          className="relative block h-full w-full cursor-pointer text-left"
        >
          {image}
        </button>
      )
    }

    return <div className="relative h-full w-full">{image}</div>
  }

  return (
    <div className="absolute inset-0">
      <div
        ref={scrollRef}
        className={cn(
          "flex h-full snap-x snap-mandatory overflow-x-auto",
          hasMultiple &&
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
        aria-roledescription={hasMultiple ? "carousel" : undefined}
        aria-label={hasMultiple ? `${salonName} photos` : undefined}
      >
        {images.map((src, index) => (
          <div key={`${src}-${index}`} className="relative h-full w-full shrink-0 snap-center">
            {renderSlide(src, index)}
          </div>
        ))}
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(event) => {
              event.stopPropagation()
              scrollTo(activeIndex - 1)
            }}
            disabled={activeIndex === 0}
            className={cn(
              "absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition-opacity",
              compact ? "size-6" : "size-7",
              activeIndex === 0
                ? "pointer-events-none opacity-0"
                : "opacity-100 hover:bg-black/55 sm:opacity-0 sm:group-hover:opacity-100",
            )}
          >
            <ChevronLeftIcon className={compact ? "size-3" : "size-3.5"} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation()
              scrollTo(activeIndex + 1)
            }}
            disabled={activeIndex === images.length - 1}
            className={cn(
              "absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition-opacity",
              compact ? "size-6" : "size-7",
              activeIndex === images.length - 1
                ? "pointer-events-none opacity-0"
                : "opacity-100 hover:bg-black/55 sm:opacity-0 sm:group-hover:opacity-100",
            )}
          >
            <ChevronRightIcon className={compact ? "size-3" : "size-3.5"} />
          </button>

          <div
            className={cn(
              "absolute left-1/2 z-20 flex -translate-x-1/2 gap-1",
              compact ? "bottom-[4.25rem]" : "bottom-[5.5rem]",
            )}
          >
            {images.map((src, index) => (
              <button
                key={`${src}-dot-${index}`}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={(event) => {
                  event.stopPropagation()
                  scrollTo(index)
                }}
                className={cn(
                  "rounded-full bg-white/90 transition-all",
                  index === activeIndex
                    ? compact
                      ? "h-1 w-3.5"
                      : "h-1.5 w-5"
                    : compact
                      ? "size-1 bg-white/55 hover:bg-white/80"
                      : "size-1.5 bg-white/55 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
