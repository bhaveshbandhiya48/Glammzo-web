"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
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
import { formatInr, resolveServiceThumbnail } from "@/lib/salons/catalog-utils"
import { ServiceDetailOffers } from "@/components/salons/offers/service-detail-offers"
import { ServicePriceText } from "@/components/salons/booking-catalog/service-price-text"
import {
  ServiceQuantityStepper,
  serviceUsesQuantity,
} from "@/components/salons/booking-catalog/service-quantity-stepper"
import {
  buildServiceDetailContent,
  type ServiceDetailContent,
} from "@/lib/salons/service-detail-utils"
import { offersForService } from "@/lib/salons/offer-utils"
import {
  formatDurationWithUnit,
  formatPricingUnitQuantityCaption,
  parsePricingUnit,
  pricingUnitQuantityLabel,
} from "@/lib/salons/pricing-unit"
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
  quantity?: number
  priceOptionId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggle: () => void
  onAddOnToggle: (id: string) => void
  onQuantityChange?: (quantity: number) => void
  onPriceOptionChange?: (optionId: string) => void
  selectedIds: string[]
}

function ServiceDetailSummaryPanel({
  service,
  content,
  thumbnail,
  selected,
  selectedIds,
  serviceOffers,
  quantity,
  priceOptionId,
  salonId,
  authenticated,
  onToggle,
  onAddOnToggle,
  onQuantityChange,
  onPriceOptionChange,
  onClose,
  compactImage = false,
}: {
  service: SalonService
  content: ServiceDetailContent
  thumbnail: string | null
  selected: boolean
  selectedIds: string[]
  serviceOffers: SalonOffer[]
  quantity: number
  priceOptionId?: string
  salonId: string
  authenticated: boolean
  onToggle: () => void
  onAddOnToggle: (id: string) => void
  onQuantityChange?: (quantity: number) => void
  onPriceOptionChange?: (optionId: string) => void
  onClose: () => void
  compactImage?: boolean
}) {
  const usesQuantity = serviceUsesQuantity(service)
  const unit = parsePricingUnit(service.pricingUnit)
  const [draftQuantity, setDraftQuantity] = useState(quantity)
  const priceOptions = service.priceOptions ?? []
  const hasOptions = priceOptions.length >= 2
  const defaultOptionId = priceOptions[0]?.id ?? ""
  const [draftOptionId, setDraftOptionId] = useState(priceOptionId || defaultOptionId)

  useEffect(() => {
    setDraftQuantity(quantity)
  }, [service.id, quantity, selected])

  useEffect(() => {
    setDraftOptionId(priceOptionId || defaultOptionId)
  }, [service.id, priceOptionId, defaultOptionId])

  const activeQuantity = selected ? quantity : draftQuantity
  const quantityCaption = formatPricingUnitQuantityCaption(unit, activeQuantity)
  const bookHref = buildBookHref(
    salonId,
    [service.id],
    authenticated,
    null,
    null,
    usesQuantity ? { [service.id]: activeQuantity } : undefined,
    service.genderAudience,
    hasOptions ? { [service.id]: draftOptionId } : undefined,
  )
  return (
    <div className="flex h-full min-h-0 flex-col">
      {thumbnail ? (
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
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
        <SheetHeader className="space-y-3 p-0 text-left">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
              Service summary
            </p>
            {!thumbnail ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close service summary"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-accent hover:text-foreground"
              >
                <XIcon className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
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
                <ServicePriceText
                  service={service}
                  selectedOptionId={hasOptions ? draftOptionId : undefined}
                />
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-foreground/50">Duration</p>
              <p className="inline-flex items-center justify-end gap-1 text-sm font-medium text-foreground">
                <ClockIcon className="size-3.5 text-foreground/50" />
                {formatDurationWithUnit(`${service.durationMin} min`, unit)}
              </p>
            </div>
          </div>
          {hasOptions ? (
            <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
              <p className="text-xs font-medium text-foreground/50">Choose a price</p>
              <div className="grid gap-2">
                {priceOptions.map((option) => {
                  const active = draftOptionId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setDraftOptionId(option.id)
                        if (selected) onPriceOptionChange?.(option.id)
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border/70 hover:border-primary/40",
                      )}
                    >
                      <span className="font-medium">{option.name}</span>
                      <span className="tabular-nums font-semibold">
                        {formatInr(option.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
          {usesQuantity ? (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
              <div>
                <p className="text-xs font-medium text-foreground/50">
                  {pricingUnitQuantityLabel(unit)}
                </p>
                {quantityCaption ? (
                  <p className="text-sm font-medium text-foreground">{quantityCaption}</p>
                ) : null}
              </div>
              <ServiceQuantityStepper
                service={service}
                quantity={activeQuantity}
                compact={false}
                onQuantityChange={(next) => {
                  setDraftQuantity(next)
                  if (selected) onQuantityChange?.(next)
                }}
                onRemove={selected ? onToggle : undefined}
              />
            </div>
          ) : null}
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
            onClick={() => {
              if (!selected) {
                if (hasOptions) onPriceOptionChange?.(draftOptionId)
                if (usesQuantity) onQuantityChange?.(draftQuantity)
                if (!hasOptions && !usesQuantity) onToggle()
                return
              }
              onToggle()
            }}
          >
            {selected ? "Remove from booking" : "Add to booking"}
          </Button>
          <Button asChild size="lg" className="w-full">
            <Link
              href={bookHref}
              onClick={() => {
                if (hasOptions) onPriceOptionChange?.(draftOptionId)
                else if (!selected) onToggle()
              }}
            >
              Book Service
            </Link>
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
  quantity = 1,
  priceOptionId,
  open,
  onOpenChange,
  onToggle,
  onAddOnToggle,
  onQuantityChange,
  onPriceOptionChange,
  selectedIds,
}: ServiceDetailSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  if (!service) return null

  const content = buildServiceDetailContent(service, allServices, salonReviews)
  const thumbnail = resolveServiceThumbnail(service)
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
          salonId={salonId}
          authenticated={authenticated}
          selected={selected}
          selectedIds={selectedIds}
          serviceOffers={serviceOffers}
          quantity={quantity}
          priceOptionId={priceOptionId}
          onToggle={onToggle}
          onAddOnToggle={onAddOnToggle}
          onQuantityChange={onQuantityChange}
          onPriceOptionChange={onPriceOptionChange}
          onClose={() => onOpenChange(false)}
          compactImage={!isDesktop}
        />
      </SheetContent>
    </Sheet>
  )
}
