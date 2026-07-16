"use client"

import Image from "next/image"
import { ClockIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatInr, resolveServiceThumbnail, type ServiceBadge } from "@/lib/salons/catalog-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type FeaturedServiceCardProps = {
  service: SalonService
  badge?: ServiceBadge
  selected?: boolean
  onOpenDetails: () => void
  onToggle: () => void
  className?: string
}

export function FeaturedServiceCard({
  service,
  badge,
  selected = false,
  onOpenDetails,
  onToggle,
  className,
}: FeaturedServiceCardProps) {
  const thumbnail = resolveServiceThumbnail(service)

  return (
    <article
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border/70 bg-card/90 shadow-sm shadow-black/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-black/[0.05]",
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
        <Image
          src={thumbnail}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 40vw, 22vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        {badge ? (
          <Badge className="absolute top-2 left-2 z-10 rounded-full border-0 bg-background/95 px-2 py-0.5 text-[10px] font-medium text-primary shadow-sm backdrop-blur-sm hover:bg-background/95">
            <span aria-hidden>{badge.emoji}</span> {badge.label}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <h3 className="line-clamp-2 font-heading text-[15px] font-semibold leading-snug text-foreground">
          {service.name}
        </h3>

        <p className="mt-1 truncate text-xs text-foreground/55">{service.category}</p>

        <div className="mt-auto space-y-2.5 pt-2.5">
          <div className="flex items-end justify-between gap-2">
            <p className="inline-flex items-center gap-1 text-xs text-foreground/55">
              <ClockIcon className="size-3 shrink-0" />
              {service.durationMin} min
            </p>
            <p className="font-heading text-base font-semibold tabular-nums text-foreground">
              {formatInr(service.price)}
            </p>
          </div>

          <Button
            type="button"
            variant={selected ? "outline" : "default"}
            size="md"
            className={cn(
              "relative z-10 w-full",
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
        </div>
      </div>
    </article>
  )
}
