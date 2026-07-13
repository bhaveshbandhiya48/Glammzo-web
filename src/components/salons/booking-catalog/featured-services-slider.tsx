"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { FeaturedServiceCard } from "@/components/salons/booking-catalog/featured-service-card"
import type { ServiceBadge } from "@/lib/salons/catalog-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type FeaturedServicesSliderProps = {
  services: SalonService[]
  badges: Map<string, ServiceBadge>
  selectedIds: string[]
  onOpenDetails: (service: SalonService) => void
  onToggleService: (serviceId: string) => void
  className?: string
}

/** ~2 full cards + half of the next, signals horizontal scroll. */
const PEEK_CARD_WIDTH = "w-[calc((100%-1.5rem)/2.5)]"

export function FeaturedServicesSlider({
  services,
  badges,
  selectedIds,
  onOpenDetails,
  onToggleService,
  className,
}: FeaturedServicesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const usePeekSlider = services.length > 2
  const canScroll = usePeekSlider

  const syncActiveIndex = useCallback(() => {
    const container = scrollRef.current
    if (!container || services.length === 0) {
      return
    }

    const firstCard = container.querySelector<HTMLElement>("[data-featured-card]")
    if (!firstCard) {
      return
    }

    const stride = firstCard.offsetWidth + 12
    if (stride <= 0) {
      return
    }

    const index = Math.round(container.scrollLeft / stride)
    setActiveIndex(Math.min(Math.max(index, 0), services.length - 1))
  }, [services.length])

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
  }, [services])

  const scrollByCard = (direction: -1 | 1) => {
    const container = scrollRef.current
    if (!container) {
      return
    }

    const firstCard = container.querySelector<HTMLElement>("[data-featured-card]")
    const stride = (firstCard?.offsetWidth ?? container.clientWidth) + 12
    const nextIndex = Math.min(
      Math.max(activeIndex + direction, 0),
      services.length - 1,
    )

    container.scrollTo({ left: nextIndex * stride, behavior: "smooth" })
    setActiveIndex(nextIndex)
  }

  if (!usePeekSlider) {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
        {services.map((service) => (
          <FeaturedServiceCard
            key={service.id}
            service={service}
            badge={badges.get(service.id)}
            selected={selectedIds.includes(service.id)}
            onOpenDetails={() => onOpenDetails(service)}
            onToggle={() => onToggleService(service.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("group relative", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-3 overflow-x-auto scroll-smooth",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "snap-x snap-mandatory",
        )}
        aria-roledescription="carousel"
        aria-label="Most booked services"
      >
        {services.map((service) => (
          <div
            key={service.id}
            data-featured-card
            className={cn("shrink-0 snap-start", PEEK_CARD_WIDTH)}
          >
            <FeaturedServiceCard
              service={service}
              badge={badges.get(service.id)}
              selected={selectedIds.includes(service.id)}
              onOpenDetails={() => onOpenDetails(service)}
              onToggle={() => onToggleService(service.id)}
            />
          </div>
        ))}
      </div>

      {canScroll ? (
        <>
          <button
            type="button"
            aria-label="Previous services"
            onClick={() => scrollByCard(-1)}
            disabled={activeIndex === 0}
            className={cn(
              "absolute left-0 top-[calc(50%-1.5rem)] z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm backdrop-blur-sm transition-opacity",
              activeIndex === 0
                ? "pointer-events-none opacity-0"
                : "opacity-100 hover:bg-muted/80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
            )}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next services"
            onClick={() => scrollByCard(1)}
            disabled={activeIndex >= services.length - 1}
            className={cn(
              "absolute right-0 top-[calc(50%-1.5rem)] z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm backdrop-blur-sm transition-opacity",
              activeIndex >= services.length - 1
                ? "pointer-events-none opacity-0"
                : "opacity-100 hover:bg-muted/80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
            )}
          >
            <ChevronRightIcon className="size-4" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {services.map((service, index) => (
              <button
                key={service.id}
                type="button"
                aria-label={`Go to ${service.name}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => {
                  const container = scrollRef.current
                  const firstCard = container?.querySelector<HTMLElement>("[data-featured-card]")
                  const stride = (firstCard?.offsetWidth ?? 0) + 12
                  container?.scrollTo({ left: index * stride, behavior: "smooth" })
                  setActiveIndex(index)
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === activeIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-foreground/20 hover:bg-foreground/35",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
