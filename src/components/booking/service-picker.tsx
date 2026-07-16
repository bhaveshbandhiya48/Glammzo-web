"use client"

import Image from "next/image"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckIcon, ChevronDownIcon, Trash2Icon } from "lucide-react"

import type { SalonService } from "@/types/salon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const serviceCardPadX = "px-4 sm:px-5"
const serviceCardRadius = "rounded-xl"
const serviceListShellRadius = "rounded-xl"

type ServicePickerProps = {
  services: SalonService[]
  selectedIds: string[]
  onToggle: (id: string) => void
  variant?: "list" | "cards"
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
                <CompactCartServiceRow service={svc} onRemove={() => onToggle(svc.id)} />
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
          expanded={selectedIds.includes(svc.id)}
          onToggle={() => onToggle(svc.id)}
          onToggleDetails={() => {}}
          variant="cards"
          mode={mode}
        />
      ))}
    </div>
  )
}

function CompactCartServiceRow({
  service,
  onRemove,
}: {
  service: SalonService
  onRemove: () => void
}) {
  return (
    <div className="flex h-[4.75rem] items-center gap-3 px-3 sm:px-4">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
        <Image src={service.imageUrl} alt="" fill className="object-cover" sizes="48px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {service.category} · {service.durationMin} min
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        ₹{service.price}
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
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30",
        compact ? "size-12" : "size-14 sm:size-16",
      )}
    >
      <Image
        src={service.imageUrl}
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
  const hasIncludes = service.includes.length > 0
  const showIncludes = hasIncludes && expanded

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
          <span className="font-heading text-base font-semibold tabular-nums sm:text-lg">
            ₹{service.price}
          </span>
          {!selected ? (
            <Button
              type="button"
              size="sm"
              variant="default"
              className="min-w-[4rem]"
              onClick={onToggle}
            >
              Add
            </Button>
          ) : null}
        </div>
      </div>

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
