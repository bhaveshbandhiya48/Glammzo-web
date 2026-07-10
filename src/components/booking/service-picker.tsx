"use client"

import Image from "next/image"
import { useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import type { SalonService } from "@/types/salon"
import { Button } from "@/components/ui/button"
import { RemoveServiceButton } from "@/components/booking/remove-service-button"
import { cn } from "@/lib/utils"

/** Shared spacing + radius for service cards (salon detail + booking) */
const serviceCardPadX = "px-6 sm:px-7"
const serviceCardRadius = "rounded-xl"
const serviceListShellRadius = "rounded-2xl"

type ServicePickerProps = {
  services: SalonService[]
  selectedIds: string[]
  onToggle: (id: string) => void
  /** compact = salon detail list; default = booking form cards */
  variant?: "list" | "cards"
  /** cart = selected items with remove control (booking/cart page) */
  mode?: "select" | "cart"
}

export function ServicePicker({
  services,
  selectedIds,
  onToggle,
  variant = "cards",
  mode = "select",
}: ServicePickerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id))
  }

  if (variant === "list") {
    const isCart = mode === "cart"

    return (
      <ul
        className={cn(
          isCart
            ? "space-y-4 overflow-visible"
            : "space-y-2.5 border border-border/70 bg-card/40 p-3 sm:p-3.5",
          !isCart && serviceListShellRadius,
        )}
      >
        {services.map((svc) => (
          <li key={svc.id} className={isCart ? "overflow-visible px-1 pt-1.5" : undefined}>
            <ServicePickerItem
              service={svc}
              selected={selectedIds.includes(svc.id)}
              expanded={
                mode === "cart" ||
                expandedId === svc.id ||
                selectedIds.includes(svc.id)
              }
              onToggle={() => onToggle(svc.id)}
              onToggleDetails={() => toggleExpanded(svc.id)}
              variant="list"
              mode={mode}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={cn("grid gap-3", mode === "cart" && "overflow-visible pt-1.5 pr-1.5")}>
      {services.map((svc) => (
        <ServicePickerItem
          key={svc.id}
          service={svc}
          selected={selectedIds.includes(svc.id)}
          expanded={mode === "cart" || selectedIds.includes(svc.id)}
          onToggle={() => onToggle(svc.id)}
          onToggleDetails={() => {}}
          variant="cards"
          mode={mode}
        />
      ))}
    </div>
  )
}

function ServiceIncludes({ includes }: { includes: string[] }) {
  return (
    <div
      className={cn(
        "border-t border-border/50 bg-muted/20 py-4 sm:py-4",
        serviceCardPadX
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
        What&apos;s included
      </p>
      <ul className="mt-2.5 grid gap-1.5">
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

function ServiceThumbnail({ service }: { service: SalonService }) {
  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30 sm:size-16">
      <Image
        src={service.imageUrl}
        alt=""
        fill
        className="object-cover"
        sizes="64px"
      />
    </div>
  )
}

function ServicePickerItem({
  service,
  selected,
  expanded,
  onToggle,
  onToggleDetails,
  variant,
  mode = "select",
}: {
  service: SalonService
  selected: boolean
  expanded: boolean
  onToggle: () => void
  onToggleDetails: () => void
  variant: "list" | "cards"
  mode?: "select" | "cart"
}) {
  const isList = variant === "list"
  const isCart = mode === "cart"
  const hasIncludes = service.includes.length > 0
  const showIncludes = hasIncludes && expanded
  const showSelectedStyle = isCart || selected

  return (
    <div
      className={cn(
        "border transition-[border-color,background-color,box-shadow]",
        serviceCardRadius,
        isCart ? "relative overflow-visible" : "overflow-hidden",
        showSelectedStyle
          ? "border-primary bg-primary/[0.07] shadow-sm shadow-primary/10"
          : isList
            ? "border-transparent hover:border-primary/15 hover:bg-accent/20"
            : "border-border/70 hover:border-primary/25 hover:bg-accent/40"
      )}
    >
      {isCart ? (
        <>
          <RemoveServiceButton
            serviceName={service.name}
            onClick={onToggle}
            position="corner"
          />
          <div
            className={cn(
              "flex items-start gap-3",
              serviceCardPadX,
              isList ? "py-4 sm:py-5" : "py-4",
            )}
          >
            <ServiceThumbnail service={service} />
            <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">{service.name}</p>
                <p className="mt-1 text-sm text-foreground/60">
                  {service.category} · {service.durationMin} min
                </p>
              </div>
              <span className="shrink-0 font-heading text-lg font-semibold tabular-nums leading-none">
                ₹{service.price}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div
          className={cn(
            "flex items-center justify-between gap-4",
            serviceCardPadX,
            isList ? "py-4 sm:py-5" : "py-4"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ServiceThumbnail service={service} />
            <div className="min-w-0">
              <p className="font-medium">{service.name}</p>
              <p className="mt-0.5 text-sm text-foreground/60">
                {service.category} · {service.durationMin} min
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <span className="font-heading text-lg font-semibold tabular-nums">
              ₹{service.price}
            </span>
            {!selected ? (
              <Button
                type="button"
                size="xs"
                variant="default"
                className="min-w-[4.25rem] rounded-full"
                onClick={onToggle}
              >
                Add
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {!isCart && isList && hasIncludes && !expanded ? (
        <div className={cn(serviceCardPadX, "pb-4")}>
          <button
            type="button"
            onClick={onToggleDetails}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary/80 transition-colors hover:text-primary cursor-pointer"
          >
            What&apos;s included
            <ChevronDownIcon className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}

      {showIncludes ? <ServiceIncludes includes={service.includes} /> : null}

      {!isCart && isList && hasIncludes && expanded && !selected ? (
        <div className={cn("border-t border-border/40 py-2.5", serviceCardPadX)}>
          <button
            type="button"
            onClick={onToggleDetails}
            className="text-xs font-medium text-foreground/45 transition-colors hover:text-foreground cursor-pointer"
          >
            Hide details
          </button>
        </div>
      ) : null}
    </div>
  )
}
