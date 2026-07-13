"use client"

import Image from "next/image"
import { ArrowRightIcon, CheckIcon, ClockIcon, PlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatInr, resolveServiceThumbnail, type ServiceBadge } from "@/lib/salons/catalog-utils"
import { getServiceCardSummary } from "@/lib/salons/service-detail-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServiceCardProps = {
  service: SalonService
  selected: boolean
  badge?: ServiceBadge
  onOpenDetails: () => void
  onToggle: () => void
  className?: string
}

export function ServiceCard({
  service,
  selected,
  badge,
  onOpenDetails,
  onToggle,
  className,
}: ServiceCardProps) {
  const thumbnail = resolveServiceThumbnail(service)
  const summary = getServiceCardSummary(service)

  return (
    <article
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-black/[0.06]",
        selected && "border-primary/30 bg-primary/[0.04] ring-1 ring-primary/10",
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
      <div className="relative size-[68px] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
        <Image
          src={thumbnail}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="68px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-heading text-base font-semibold leading-tight text-foreground">
            {service.name}
          </h3>
          {badge ? (
            <Badge className="rounded-full bg-primary/10 px-2 py-0 text-[10px] text-primary hover:bg-primary/10">
              <span aria-hidden>{badge.emoji}</span> {badge.label}
            </Badge>
          ) : null}
        </div>

        <p className="mt-0.5 truncate text-xs text-foreground/55">{service.category}</p>

        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-foreground/55">
          <ClockIcon className="size-3 shrink-0" />
          {service.durationMin} min
        </p>

        {summary ? (
          <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-foreground/50">
            {summary}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch py-0.5">
        <p className="font-heading text-lg font-semibold leading-none tabular-nums text-foreground">
          {formatInr(service.price)}
        </p>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="relative z-10 size-9 rounded-full border-border/80 bg-background/90"
            onClick={(event) => {
              event.stopPropagation()
              onOpenDetails()
            }}
            aria-label={`View details for ${service.name}`}
          >
            <ArrowRightIcon className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={selected ? "secondary" : "outline"}
            className={cn(
              "relative z-10 size-9 rounded-full border-border/80 bg-background/90 transition-transform duration-200 active:scale-95",
              selected && "border-primary/30 bg-primary/10 text-primary",
            )}
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
            aria-label={selected ? `${service.name} added to booking` : `Quick add ${service.name}`}
          >
            {selected ? <CheckIcon className="size-4" /> : <PlusIcon className="size-4" />}
          </Button>
        </div>
      </div>
    </article>
  )
}
