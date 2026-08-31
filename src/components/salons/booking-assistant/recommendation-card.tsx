"use client"

import Image from "next/image"
import { CheckIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/bookings/utils"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

export type RecommendationCardProps = {
  service: SalonService
  added: boolean
  onAdd: () => void
  className?: string
}

export function RecommendationCard({
  service,
  added,
  onAdd,
  className,
}: RecommendationCardProps) {
  const imageSrc = service.imageUrl?.trim() || ""
  const compareAt =
    service.compareAtPrice && service.compareAtPrice > service.price
      ? service.compareAtPrice
      : null

  return (
    <section
      className={cn(
        "rounded-3xl border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.04]",
        className,
      )}
    >
      <h3 className="font-heading text-base font-semibold text-foreground">
        Recommended for you
      </h3>

      <article className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-background/70">
        <div className="flex gap-3 p-3">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={service.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{service.name}</p>
            <p className="mt-0.5 text-xs text-foreground/55">
              {formatDuration(service.durationMin)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatInr(service.price)}
              </span>
              {compareAt ? (
                <span className="text-xs tabular-nums text-foreground/40 line-through">
                  {formatInr(compareAt)}
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-foreground/50">
              Frequently booked together
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 px-3 py-2.5">
          {added ? (
            <div className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-700">
              <CheckIcon className="size-3.5" aria-hidden />
              Added ✓
            </div>
          ) : (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={onAdd}>
              <PlusIcon className="size-3.5" aria-hidden />
              Add
            </Button>
          )}
        </div>
      </article>
    </section>
  )
}
