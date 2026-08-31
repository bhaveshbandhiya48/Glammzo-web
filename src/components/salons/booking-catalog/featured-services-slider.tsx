"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { FeaturedServiceCard } from "@/components/salons/booking-catalog/featured-service-card"
import type { ServiceBadge } from "@/lib/salons/catalog-utils"
import { bestOfferForService } from "@/lib/salons/offer-utils"
import type { SalonOffer, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type FeaturedServicesSliderProps = {
  services: SalonService[]
  badges: Map<string, ServiceBadge>
  offers?: SalonOffer[]
  selectedIds: string[]
  quantities?: Record<string, number>
  onOpenDetails: (service: SalonService) => void
  onToggleService: (serviceId: string) => void
  onQuantityChange?: (serviceId: string, quantity: number) => void
  className?: string
}

/** Viewport shows ~2.5 cards (2 full + half of third). Gap is 0.75rem (gap-3). */
const CARD_WIDTH = "w-[calc((100%-1.5rem)/2.5)]"
const CARD_GAP_PX = 12

export function FeaturedServicesSlider({
  services,
  badges,
  offers = [],
  selectedIds,
  quantities = {},
  onOpenDetails,
  onToggleService,
  onQuantityChange,
  className,
}: FeaturedServicesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const showSlider = services.length > 2

  const syncActiveIndex = useCallback(() => {
    const container = scrollRef.current
    if (!container || services.length === 0) return

    const firstCard = container.querySelector<HTMLElement>("[data-featured-card]")
    if (!firstCard) return

    const stride = firstCard.offsetWidth + CARD_GAP_PX
    if (stride <= 0) return

    const index = Math.round(container.scrollLeft / stride)
    setActiveIndex(Math.min(Math.max(index, 0), services.length - 1))
  }, [services])

  useEffect(() => {
    if (!showSlider) return
    const container = scrollRef.current
    if (!container) return

    container.addEventListener("scroll", syncActiveIndex, { passive: true })
    return () => container.removeEventListener("scroll", syncActiveIndex)
  }, [showSlider, syncActiveIndex])

  useEffect(() => {
    if (!showSlider) return
    setActiveIndex(0)
    scrollRef.current?.scrollTo({ left: 0, behavior: "instant" })
  }, [services, showSlider])

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current
    if (!container) return

    const firstCard = container.querySelector<HTMLElement>("[data-featured-card]")
    const stride = (firstCard?.offsetWidth ?? container.clientWidth / 2.5) + CARD_GAP_PX
    const nextIndex = Math.min(Math.max(index, 0), services.length - 1)

    container.scrollTo({ left: nextIndex * stride, behavior: "smooth" })
    setActiveIndex(nextIndex)
  }

  if (services.length === 0) return null

  return (
    <div className={cn("group relative", className)}>
      <div
        ref={showSlider ? scrollRef : undefined}
        className={cn(
          "flex gap-3",
          showSlider && [
            "overflow-x-auto scroll-smooth",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "snap-x snap-mandatory",
          ],
        )}
        aria-roledescription={showSlider ? "carousel" : undefined}
        aria-label="Most booked services"
      >
        {services.map((service) => (
          <div
            key={service.id}
            data-featured-card
            className={cn("shrink-0", CARD_WIDTH, showSlider && "snap-start")}
          >
            <FeaturedServiceCard
              service={service}
              badge={badges.get(service.id)}
              offer={bestOfferForService(offers, service.id, service.price)}
              selected={selectedIds.includes(service.id)}
              quantity={quantities[service.id] ?? 1}
              onOpenDetails={() => onOpenDetails(service)}
              onToggle={() => onToggleService(service.id)}
              onQuantityChange={
                onQuantityChange
                  ? (quantity) => onQuantityChange(service.id, quantity)
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {showSlider ? (
        <>
          <button
            type="button"
            aria-label="Previous services"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={cn(
              "absolute left-0 top-[calc(50%-1.5rem)] z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm backdrop-blur-sm transition-opacity",
              activeIndex === 0
                ? "pointer-events-none opacity-0"
                : "opacity-100 hover:bg-muted/80",
            )}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next services"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex >= services.length - 1}
            className={cn(
              "absolute right-0 top-[calc(50%-1.5rem)] z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm backdrop-blur-sm transition-opacity",
              activeIndex >= services.length - 1
                ? "pointer-events-none opacity-0"
                : "opacity-100 hover:bg-muted/80",
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
                onClick={() => scrollToIndex(index)}
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
