"use client"

import Image from "next/image"
import { ClockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatInr,
  formatPackageDuration,
  getPackageIncludedPreview,
  getPackageSavings,
  getPackageTagline,
  resolveCategoryStockImage,
  resolvePackageCoverImage,
  type PackageBadge,
} from "@/lib/salons/catalog-utils"
import type { SalonPackage, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type PackageCatalogRowProps = {
  pkg: SalonPackage
  services: SalonService[]
  salonCoverImageUrl: string
  badge?: PackageBadge
  selected?: boolean
  onOpen: () => void
  onToggle: () => void
  className?: string
}

export function PackageCatalogRow({
  pkg,
  services,
  salonCoverImageUrl,
  badge,
  selected = false,
  onOpen,
  onToggle,
  className,
}: PackageCatalogRowProps) {
  const thumbnail =
    resolvePackageCoverImage(pkg, salonCoverImageUrl) ??
    resolveCategoryStockImage(pkg.name, "package")
  const tagline = getPackageTagline(pkg)
  const { visible, remaining } = getPackageIncludedPreview(pkg, 2)
  const includedPreview =
    visible.length > 0
      ? `${visible.join(", ")}${remaining > 0 ? ` +${remaining} more` : ""}`
      : null
  const summary = tagline || includedPreview
  const durationLabel = formatPackageDuration(pkg, services)
  const { shouldShowCompare, savings, savingsPercent } = getPackageSavings(pkg)

  return (
    <div
      data-package-id={pkg.id}
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
          <Image src={thumbnail} alt="" fill className="object-cover" sizes="44px" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[15px] font-medium text-foreground">{pkg.name}</p>
            {badge ? (
              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
                {badge.emoji} {badge.label}
              </span>
            ) : null}
          </div>
          {summary ? (
            <p className="mt-0.5 truncate text-xs text-foreground/50">{summary}</p>
          ) : null}
          {savings > 0 && pkg.showSavings ? (
            <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
              Save {formatInr(savings)}
              {savingsPercent > 0 ? ` (${savingsPercent}%)` : ""}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          {durationLabel ? (
            <p className="inline-flex items-center justify-end gap-1 text-xs text-foreground/55">
              <ClockIcon className="size-3 shrink-0" />
              {durationLabel}
            </p>
          ) : null}
          <p className="mt-0.5 font-heading text-sm font-semibold text-foreground">
            {formatInr(pkg.packagePrice)}
          </p>
          {shouldShowCompare ? (
            <p className="text-[11px] text-foreground/45 line-through tabular-nums">
              {formatInr(pkg.comparePrice)}
            </p>
          ) : null}
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
        disabled={!pkg.allowOnlineBooking && !selected}
        onClick={onToggle}
      >
        {selected ? "Remove" : "Add"}
      </Button>
    </div>
  )
}
