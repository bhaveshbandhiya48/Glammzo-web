"use client"

import Image from "next/image"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckIcon, ChevronDownIcon, Trash2Icon, XIcon } from "lucide-react"

import type { SalonService } from "@/types/salon"
import { Button } from "@/components/ui/button"
import { ServicePriceText } from "@/components/salons/booking-catalog/service-price-text"
import {
  ServiceQuantityStepper,
  serviceUsesQuantity,
} from "@/components/salons/booking-catalog/service-quantity-stepper"
import {
  defaultPriceOptionId,
  formatInr,
  resolveServiceOptionPrice,
  serviceHasPriceOptions,
} from "@/lib/salons/catalog-utils"
import {
  formatPricingUnitQuantityCaption,
  parsePricingUnit,
  quantityForService,
} from "@/lib/salons/pricing-unit"
import { serviceGenderLabel, type ServiceGenderAudience } from "@/lib/salons/gender-audience"
import { cn } from "@/lib/utils"

const serviceCardPadX = "px-4 sm:px-5"
const serviceCardRadius = "rounded-xl"
const serviceListShellRadius = "rounded-xl"

type ServicePickerProps = {
  services: SalonService[]
  selectedIds: string[]
  quantities?: Record<string, number>
  priceOptionIds?: Record<string, string>
  genderAudience?: ServiceGenderAudience | null
  onToggle: (id: string) => void
  onQuantityChange?: (id: string, quantity: number) => void
  onPriceOptionChange?: (id: string, optionId: string) => void
  variant?: "list" | "cards"
  mode?: "select" | "cart"
  unstaffedIds?: string[]
}

export function ServicePicker({
  services,
  selectedIds,
  quantities = {},
  priceOptionIds = {},
  genderAudience = null,
  onToggle,
  onQuantityChange,
  onPriceOptionChange,
  variant = "cards",
  mode = "select",
  unstaffedIds = [],
}: ServicePickerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id))
  }

  if (variant === "list") {
    const isCart = mode === "cart"

    if (isCart) {
      return (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
          <AnimatePresence initial={false}>
            {services.map((svc) => (
              <motion.li
                key={svc.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <CompactCartServiceRow
                  service={svc}
                  quantity={quantityForService(svc, quantities)}
                  selectedOptionId={priceOptionIds[svc.id] ?? null}
                  genderAudience={genderAudience}
                  unstaffed={unstaffedIds.includes(svc.id)}
                  onRemove={() => onToggle(svc.id)}
                  onQuantityChange={
                    onQuantityChange
                      ? (quantity) => onQuantityChange(svc.id, quantity)
                      : undefined
                  }
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )
    }

    return (
      <ul
        className={cn(
          "space-y-2 border border-border/70 bg-card/40 p-2.5 sm:p-3",
          serviceListShellRadius,
        )}
      >
        {services.map((svc) => (
          <li key={svc.id}>
            <ServicePickerItem
              service={svc}
              selected={selectedIds.includes(svc.id)}
              expanded={expandedId === svc.id || selectedIds.includes(svc.id)}
              quantity={quantityForService(svc, quantities)}
              selectedOptionId={priceOptionIds[svc.id] ?? null}
              onToggle={() => onToggle(svc.id)}
              onQuantityChange={
                onQuantityChange
                  ? (quantity) => onQuantityChange(svc.id, quantity)
                  : undefined
              }
              onPriceOptionChange={
                onPriceOptionChange
                  ? (optionId) => onPriceOptionChange(svc.id, optionId)
                  : undefined
              }
              onToggleDetails={() => toggleExpanded(svc.id)}
              variant="list"
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="grid gap-3">
      {services.map((svc) => (
        <ServicePickerItem
          key={svc.id}
          service={svc}
          selected={selectedIds.includes(svc.id)}
          expanded={selectedIds.includes(svc.id)}
          quantity={quantityForService(svc, quantities)}
          selectedOptionId={priceOptionIds[svc.id] ?? null}
          onToggle={() => onToggle(svc.id)}
          onQuantityChange={
            onQuantityChange
              ? (quantity) => onQuantityChange(svc.id, quantity)
              : undefined
          }
          onPriceOptionChange={
            onPriceOptionChange
              ? (optionId) => onPriceOptionChange(svc.id, optionId)
              : undefined
          }
          onToggleDetails={() => {}}
          variant="cards"
        />
      ))}
    </div>
  )
}

function CompactCartServiceRow({
  service,
  quantity = 1,
  selectedOptionId = null,
  genderAudience = null,
  unstaffed = false,
  onRemove,
  onQuantityChange,
}: {
  service: SalonService
  quantity?: number
  selectedOptionId?: string | null
  genderAudience?: ServiceGenderAudience | null
  unstaffed?: boolean
  onRemove: () => void
  onQuantityChange?: (quantity: number) => void
}) {
  const unit = parsePricingUnit(service.pricingUnit)
  const caption = formatPricingUnitQuantityCaption(unit, quantity)
  const selectedOption = service.priceOptions?.find((option) => option.id === selectedOptionId)
  const unitPrice = resolveServiceOptionPrice(service, selectedOptionId)
  const linePrice = unitPrice * quantity
  const lineDuration = service.durationMin * quantity
  const showQuantity = serviceUsesQuantity(service) && Boolean(onQuantityChange)
  const genderLabel =
    serviceGenderLabel(service.genderAudience) ?? serviceGenderLabel(genderAudience)
  const meta = [service.category, caption, `${lineDuration} min`].filter(Boolean)

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-3 sm:px-4",
        unstaffed && "bg-destructive/[0.04]",
      )}
    >
      {service.imageUrl?.trim() ? (
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
          <Image src={service.imageUrl} alt="" fill className="object-cover" sizes="48px" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
          {genderLabel ? (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-foreground/70">
              {genderLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {meta.join(" · ")}
          {selectedOption ? ` · ${selectedOption.name}` : ""}
        </p>
        {unstaffed ? (
          <p className="mt-1 text-xs font-medium text-destructive" role="alert">
            This service has no staff. Remove it to continue.
          </p>
        ) : null}
      </div>
      {showQuantity ? (
        <ServiceQuantityStepper
          service={service}
          quantity={quantity}
          onQuantityChange={onQuantityChange!}
          onRemove={onRemove}
        />
      ) : null}
      <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {showQuantity ? (
          formatInr(linePrice)
        ) : (
          <ServicePriceText
            service={service}
            selectedOptionId={selectedOptionId}
            finalPrice
          />
        )}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={onRemove}
        aria-label={`Remove ${service.name}`}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  )
}

function ServiceIncludes({ includes }: { includes: string[] }) {
  return (
    <div className={cn("border-t border-border/50 bg-muted/20 py-3", serviceCardPadX)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        What&apos;s included
      </p>
      <ul className="mt-2 grid gap-1">
        {includes.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-2 text-xs leading-relaxed text-foreground/70"
          >
            <CheckIcon className="size-3 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ServiceThumbnail({ service, compact = false }: { service: SalonService; compact?: boolean }) {
  const src = service.imageUrl?.trim()
  if (!src) return null

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30",
        compact ? "size-12" : "size-14 sm:size-16",
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes={compact ? "48px" : "64px"}
      />
    </div>
  )
}

function ServicePickerItem({
  service,
  selected,
  expanded,
  quantity = 1,
  selectedOptionId = null,
  onToggle,
  onQuantityChange,
  onPriceOptionChange,
  onToggleDetails,
  variant,
}: {
  service: SalonService
  selected: boolean
  expanded: boolean
  quantity?: number
  selectedOptionId?: string | null
  onToggle: () => void
  onQuantityChange?: (quantity: number) => void
  onPriceOptionChange?: (optionId: string) => void
  onToggleDetails: () => void
  variant: "list" | "cards"
}) {
  const isList = variant === "list"
  const hasIncludes = service.includes.length > 0
  const showIncludes = hasIncludes && expanded
  const showQuantity = selected && serviceUsesQuantity(service) && Boolean(onQuantityChange)
  const hasOptions = serviceHasPriceOptions(service)
  const priceOptions = service.priceOptions ?? []
  const activeOptionId = selectedOptionId || defaultPriceOptionId(service) || ""

  function handleAdd() {
    if (hasOptions && onPriceOptionChange && activeOptionId) {
      onPriceOptionChange(activeOptionId)
      return
    }
    onToggle()
  }

  return (
    <div
      className={cn(
        "border transition-[border-color,background-color,box-shadow]",
        serviceCardRadius,
        "overflow-hidden",
        selected
          ? "border-primary bg-primary/[0.07] shadow-sm shadow-primary/10"
          : isList
            ? "border-transparent hover:border-primary/15 hover:bg-accent/20"
            : "border-border/70 hover:border-primary/25 hover:bg-accent/40",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          serviceCardPadX,
          isList ? "py-3.5 sm:py-4" : "py-4",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <ServiceThumbnail service={service} />
          <div className="min-w-0">
            <p className="font-medium leading-snug">{service.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {service.category} · {service.durationMin} min
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-heading text-base font-semibold sm:text-lg">
            <ServicePriceText
              service={service}
              selectedOptionId={hasOptions ? (selected ? activeOptionId : undefined) : undefined}
              finalPrice={selected && hasOptions}
            />
          </span>
          {showQuantity ? (
            <ServiceQuantityStepper
              service={service}
              quantity={quantity}
              onQuantityChange={onQuantityChange!}
              onRemove={onToggle}
            />
          ) : selected ? (
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="size-8 shrink-0 rounded-full"
              onClick={onToggle}
              aria-label={`Remove ${service.name}`}
            >
              <XIcon className="size-3.5" strokeWidth={2.2} aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="default"
              className="min-w-[4rem]"
              onClick={handleAdd}
            >
              Add
            </Button>
          )}
        </div>
      </div>

      {hasOptions ? (
        <div className={cn("space-y-2 pb-3", serviceCardPadX)}>
          <p className="text-xs font-medium text-muted-foreground">Choose a price</p>
          <div className="grid gap-2">
            {priceOptions.map((option) => {
              const active = selected && activeOptionId === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    if (onPriceOptionChange) {
                      onPriceOptionChange(option.id)
                      return
                    }
                    handleAdd()
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-background/80 hover:border-primary/40",
                  )}
                >
                  <span className="font-medium">{option.name}</span>
                  <span className="tabular-nums font-semibold">{formatInr(option.price)}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {isList && hasIncludes && !expanded ? (
        <div className={cn(serviceCardPadX, "pb-3")}>
          <button
            type="button"
            onClick={onToggleDetails}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary/80 transition-colors hover:text-primary"
          >
            What&apos;s included
            <ChevronDownIcon className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}

      {showIncludes ? <ServiceIncludes includes={service.includes} /> : null}

      {isList && hasIncludes && expanded && !selected ? (
        <div className={cn("border-t border-border/40 py-2", serviceCardPadX)}>
          <button
            type="button"
            onClick={onToggleDetails}
            className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Hide details
          </button>
        </div>
      ) : null}
    </div>
  )
}
