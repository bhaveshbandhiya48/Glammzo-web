"use client"

import { useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import type { SalonService } from "@/types/salon"
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
    return (
      <ul
        className={cn(
          "space-y-2.5 border border-border/70 bg-card/40 p-3 sm:p-3.5",
          serviceListShellRadius
        )}
      >
        {services.map((svc) => (
          <li key={svc.id}>
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
    <div className="grid gap-3">
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
        "overflow-hidden border transition-[border-color,background-color,box-shadow]",
        serviceCardRadius,
        showSelectedStyle
          ? "border-primary bg-primary/[0.07] shadow-sm shadow-primary/10"
          : isList
            ? "border-transparent hover:border-primary/15 hover:bg-accent/20"
            : "border-border/70 hover:border-primary/25 hover:bg-accent/40"
      )}
    >
      {isCart ? (
        <div
          className={cn(
            "flex items-start justify-between gap-6",
            serviceCardPadX,
            isList ? "py-4 sm:py-5" : "py-4"
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-snug">{service.name}</p>
            <p className="mt-1 text-sm text-foreground/60">
              {service.category} · {service.durationMin} min
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="font-heading text-lg font-semibold tabular-nums leading-none">
              ₹{service.price}
            </span>
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "cursor-pointer text-xs font-medium text-primary underline-offset-2 transition-colors",
                "hover:text-primary/80 hover:underline",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2"
              )}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          aria-expanded={showIncludes}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-4 text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2",
            serviceCardPadX,
            isList ? "py-4 sm:py-5" : "py-4"
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/80 bg-background"
              )}
              aria-hidden
            >
              {selected ? <CheckIcon className="size-3" strokeWidth={3} /> : null}
            </span>
            <div className="min-w-0">
              <p className="font-medium">{service.name}</p>
              <p className="mt-0.5 text-sm text-foreground/60">
                {service.category} · {service.durationMin} min
              </p>
            </div>
          </div>
          <span className="shrink-0 font-heading text-lg font-semibold tabular-nums">
            ₹{service.price}
          </span>
        </button>
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
