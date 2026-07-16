"use client"

import Image from "next/image"
import { ClockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatInr, resolveServiceThumbnail } from "@/lib/salons/catalog-utils"
import { getServiceCardSummary } from "@/lib/salons/service-detail-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServiceCatalogRowProps = {
  service: SalonService
  selected?: boolean
  onOpen: () => void
  onToggle: () => void
  className?: string
}

export function ServiceCatalogRow({
  service,
  selected = false,
  onOpen,
  onToggle,
  className,
}: ServiceCatalogRowProps) {
  const thumbnail = resolveServiceThumbnail(service)
  const summary = getServiceCardSummary(service)

  return (
    <div
      className={cn(
        "flex min-h-[76px] w-full items-center gap-2 border-b border-border/50 last:border-b-0",
        className,
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
      >
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/20 sm:size-11">
          <Image
            src={thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="44px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-foreground">{service.name}</p>
          {summary ? (
            <p className="mt-0.5 truncate text-xs text-foreground/50">{summary}</p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="inline-flex items-center justify-end gap-1 text-xs text-foreground/55">
            <ClockIcon className="size-3 shrink-0" />
            {service.durationMin} min
          </p>
          <p className="mt-0.5 font-heading text-sm font-semibold tabular-nums text-foreground">
            {formatInr(service.price)}
          </p>
        </div>
      </button>

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
    </div>
  )
}
