"use client"

import Image from "next/image"
import { ClockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ServicePriceText } from "@/components/salons/booking-catalog/service-price-text"
import {
  ServiceQuantityStepper,
  serviceUsesQuantity,
} from "@/components/salons/booking-catalog/service-quantity-stepper"
import { resolveServiceThumbnail } from "@/lib/salons/catalog-utils"
import { formatDurationWithUnit, parsePricingUnit } from "@/lib/salons/pricing-unit"
import { getServiceCardSummary } from "@/lib/salons/service-detail-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServiceCatalogRowProps = {
  service: SalonService
  selected?: boolean
  quantity?: number
  offerBadgeLabel?: string | null
  highlighted?: boolean
  onOpen: () => void
  onToggle: () => void
  onQuantityChange?: (quantity: number) => void
  className?: string
  registerRef?: (node: HTMLDivElement | null) => void
}

export function ServiceCatalogRow({
  service,
  selected = false,
  quantity = 1,
  offerBadgeLabel = null,
  highlighted = false,
  onOpen,
  onToggle,
  onQuantityChange,
  className,
  registerRef,
}: ServiceCatalogRowProps) {
  const thumbnail = resolveServiceThumbnail(service)
  const summary = getServiceCardSummary(service)
  const showQuantity = selected && serviceUsesQuantity(service) && Boolean(onQuantityChange)

  return (
    <div
      ref={registerRef}
      data-service-id={service.id}
      className={cn(
        "flex min-h-[76px] w-full items-center gap-2 border-b border-border/50 last:border-b-0 transition-colors duration-500",
        highlighted && "bg-primary/10 ring-2 ring-inset ring-primary/30",
        className,
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
      >
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/20 sm:size-11">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt=""
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[15px] font-medium text-foreground">{service.name}</p>
            {offerBadgeLabel ? (
              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
                {offerBadgeLabel}
              </span>
            ) : null}
          </div>
          {summary ? (
            <p className="mt-0.5 truncate text-xs text-foreground/50">{summary}</p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="inline-flex items-center justify-end gap-1 text-xs text-foreground/55">
            <ClockIcon className="size-3 shrink-0" />
            {formatDurationWithUnit(
              `${service.durationMin} min`,
              parsePricingUnit(service.pricingUnit),
            )}
          </p>
          <p className="mt-0.5 font-heading text-sm font-semibold text-foreground">
            <ServicePriceText service={service} />
          </p>
        </div>
      </button>

      {showQuantity ? (
        <div
          className="mr-3 shrink-0"
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
          size="sm"
          variant={selected ? "outline" : "default"}
          className={cn(
            "mr-3 shrink-0",
            selected &&
              "border-border/80 bg-background text-foreground/75 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive",
          )}
          onClick={onToggle}
        >
          {selected ? "Remove" : "Add"}
        </Button>
      )}
    </div>
  )
}
