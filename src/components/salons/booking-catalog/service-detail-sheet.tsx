"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckIcon, ClockIcon, StarIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { buildBookHref } from "@/lib/bookings/utils"
import { resolveServiceThumbnail } from "@/lib/salons/catalog-utils"
import { ServiceDetailOffers } from "@/components/salons/offers/service-detail-offers"
import { ServicePriceText } from "@/components/salons/booking-catalog/service-price-text"
import {
  buildServiceDetailContent,
  type ServiceDetailContent,
} from "@/lib/salons/service-detail-utils"
import { offersForService } from "@/lib/salons/offer-utils"
import type { SalonOffer, SalonReview, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServiceDetailSheetProps = {
  service: SalonService | null
  allServices: SalonService[]
  salonReviews: SalonReview[]
  salonId: string
  authenticated: boolean
  offers?: SalonOffer[]
  selected: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggle: () => void
  onAddOnToggle: (id: string) => void
  selectedIds: string[]
}

function ServiceDetailSummaryPanel({
  service,
  content,
  thumbnail,
  bookHref,
  selected,
  selectedIds,
  serviceOffers,
  onToggle,
  onAddOnToggle,
  onClose,
  compactImage = false,
}: {
  service: SalonService
  content: ServiceDetailContent
  thumbnail: string
  bookHref: string
  selected: boolean
  selectedIds: string[]
  serviceOffers: SalonOffer[]
  onToggle: () => void
  onAddOnToggle: (id: string) => void
  onClose: () => void
  compactImage?: boolean
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden bg-muted/30",
          compactImage ? "h-[160px] rounded-t-3xl" : "h-[200px]",
        )}
      >
        <Image
          src={thumbnail}
          alt={service.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 420px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close service summary"
          className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
        <SheetHeader className="space-y-3 p-0 text-left">
          <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            Service summary
          </p>
          <div className="space-y-2.5">
            <SheetTitle className="font-heading text-xl leading-tight sm:text-2xl">
              {service.name}
            </SheetTitle>
            {content.rating !== null ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                <StarIcon className="size-3.5 fill-primary text-primary" />
                {content.rating.toFixed(1)}
                <span className="font-normal text-foreground/50">({content.reviewCount})</span>
              </span>
            ) : null}
          </div>

          {content.about || content.highlight ? (
            <p className="text-sm leading-relaxed text-foreground/70">
              {content.about ?? content.highlight}
            </p>
          ) : null}
        </SheetHeader>

        <div className="mt-4 rounded-xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-foreground/50">Price</p>
              <p className="font-heading text-2xl font-semibold text-foreground">
                <ServicePriceText service={service} />
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-foreground/50">Duration</p>
              <p className="inline-flex items-center justify-end gap-1 text-sm font-medium text-foreground">
                <ClockIcon className="size-3.5 text-foreground/50" />
                {service.durationMin} min
              </p>
            </div>
          </div>
        </div>

        <ServiceDetailOffers offers={serviceOffers} className="mt-5" />

        {content.includedSteps.length > 0 ? (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
              What&apos;s included
            </p>
            <ul className="space-y-2.5">
              {content.includedSteps.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/80"
                >
                  <CheckIcon
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {content.addOns.length > 0 ? (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
              Add-ons
            </p>
            <ul className="space-y-2">
              {content.addOns.map((addOn) => {
                const addOnSelected = selectedIds.includes(addOn.id)
                return (
                  <li
                    key={addOn.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{addOn.name}</p>
                      <p className="mt-0.5 text-xs text-foreground/55">
                        {addOn.durationMin} min ·{" "}
                        <ServicePriceText service={addOn} />
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={addOnSelected ? "secondary" : "outline"}
                      className="shrink-0"
                      onClick={() => onAddOnToggle(addOn.id)}
                    >
                      {addOnSelected ? "Added" : "Add"}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <div className="mt-auto space-y-2 border-t border-border/60 pt-5">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full"
            onClick={onToggle}
          >
            {selected ? "Remove from booking" : "Add to booking"}
          </Button>
          <Button asChild size="lg" className="w-full">
            <Link href={bookHref}>Book Service</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ServiceDetailSheet({
  service,
  allServices,
  salonReviews,
  salonId,
  authenticated,
  offers = [],
  selected,
  open,
  onOpenChange,
  onToggle,
  onAddOnToggle,
  selectedIds,
}: ServiceDetailSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  if (!service) return null

  const content = buildServiceDetailContent(service, allServices, salonReviews)
  const thumbnail = resolveServiceThumbnail(service)
  const bookHref = buildBookHref(salonId, [service.id], authenticated)
  const serviceOffers = offersForService(offers, service.id)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        showCloseButton={false}
        className={
          isDesktop
            ? "h-full w-[min(92vw,420px)] gap-0 overflow-hidden p-0"
            : "max-h-[92vh] gap-0 overflow-hidden rounded-t-3xl p-0"
        }
      >
        <ServiceDetailSummaryPanel
          service={service}
          content={content}
          thumbnail={thumbnail}
          bookHref={bookHref}
          selected={selected}
          selectedIds={selectedIds}
          serviceOffers={serviceOffers}
          onToggle={onToggle}
          onAddOnToggle={onAddOnToggle}
          onClose={() => onOpenChange(false)}
          compactImage={!isDesktop}
        />
      </SheetContent>
    </Sheet>
  )
}
