"use client"

import Image from "next/image"
import { ClockIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServiceOfferBadge } from "@/components/salons/offers/service-offer-badge"
import { ServicePriceText } from "@/components/salons/booking-catalog/service-price-text"
import {
  ServiceQuantityStepper,
  serviceUsesQuantity,
} from "@/components/salons/booking-catalog/service-quantity-stepper"
import { resolveServiceThumbnail, type ServiceBadge } from "@/lib/salons/catalog-utils"
import type { SalonOffer, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type FeaturedServiceCardProps = {
  service: SalonService
  badge?: ServiceBadge
  offer?: Pick<SalonOffer, "discountType" | "discountValue" | "code"> | null
  selected?: boolean
  quantity?: number
  onOpenDetails: () => void
  onToggle: () => void
  onQuantityChange?: (quantity: number) => void
  className?: string
}

export function FeaturedServiceCard({
  service,
  badge,
  offer = null,
  selected = false,
  quantity = 1,
  onOpenDetails,
  onToggle,
  onQuantityChange,
  className,
}: FeaturedServiceCardProps) {
  const thumbnail = resolveServiceThumbnail(service)
  const showQuantity = selected && serviceUsesQuantity(service) && Boolean(onQuantityChange)

  return (
    <article
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border/70 bg-card/90 shadow-sm shadow-black/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-black/[0.05]",
        selected && "border-primary",
        className,
      )}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpenDetails()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${service.name}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 40vw, 22vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute top-1.5 left-1.5 z-10 flex flex-col items-start gap-1">
          {offer ? <ServiceOfferBadge offer={offer} /> : null}
          {!offer && badge ? (
            <Badge className="rounded-full border-0 bg-background/95 px-1.5 py-0 text-[9px] font-medium text-primary shadow-sm backdrop-blur-sm hover:bg-background/95">
              <span aria-hidden>{badge.emoji}</span> {badge.label}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3 className="line-clamp-1 font-heading text-sm font-semibold leading-snug text-foreground">
          {service.name}
        </h3>

        <p className="truncate text-[11px] text-foreground/55">{service.category}</p>

        <div className="mt-auto space-y-2 pt-1">
          <div className="flex items-end justify-between gap-1.5">
            <p className="inline-flex items-center gap-1 text-[11px] text-foreground/55">
              <ClockIcon className="size-3 shrink-0" />
              {service.durationMin} min
            </p>
            <p className="font-heading text-sm font-semibold text-foreground">
              <ServicePriceText service={service} />
            </p>
          </div>

          {showQuantity ? (
            <div
              className="relative z-10 flex justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <ServiceQuantityStepper
                service={service}
                quantity={quantity}
                onQuantityChange={onQuantityChange!}
                onRemove={onToggle}
              />
            </div>
          ) : (
            <Button
              type="button"
              variant={selected ? "outline" : "default"}
              size="sm"
              className={cn(
                "relative z-10 h-8 w-full text-xs",
                selected &&
                  "border-border/80 bg-background text-foreground/75 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive",
              )}
              onClick={(event) => {
                event.stopPropagation()
                onToggle()
              }}
            >
              {selected ? "Remove" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
