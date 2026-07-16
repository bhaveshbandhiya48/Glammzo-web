"use client"

import { CheckIcon, ClockIcon, PlusIcon, UsersIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PackageCover } from "@/components/salons/booking-catalog/package-cover"
import {
  formatInr,
  formatPackageDuration,
  getPackageIncludedPreview,
  getPackageSavings,
  getPackageServiceCount,
  getPackageTagline,
  type PackageBadge,
} from "@/lib/salons/catalog-utils"
import type { SalonPackage, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type PackageCardProps = {
  pkg: SalonPackage
  services: SalonService[]
  salonName: string
  salonCoverImageUrl: string
  badge?: PackageBadge
  selected?: boolean
  onViewDetails: () => void
  onAddPackage: () => void
}

export function PackageCard({
  pkg,
  services,
  salonName,
  salonCoverImageUrl,
  badge,
  selected,
  onViewDetails,
  onAddPackage,
}: PackageCardProps) {
  const { shouldShowCompare, savings, savingsPercent } = getPackageSavings(pkg)
  const serviceCount = getPackageServiceCount(pkg)
  const durationLabel = formatPackageDuration(pkg, services)
  const tagline = getPackageTagline(pkg)
  const { visible, remaining } = getPackageIncludedPreview(pkg)

  return (
    <article
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm shadow-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-black/[0.08]",
        selected && "border-primary",
      )}
      onClick={onViewDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onViewDetails()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${pkg.name}`}
    >
      <div className="relative">
        <PackageCover
          pkg={pkg}
          salonName={salonName}
          salonCoverImageUrl={salonCoverImageUrl}
          className="h-[210px]"
        />
        {badge ? (
          <Badge className="absolute top-3 left-3 z-10 rounded-full border-0 bg-background/95 px-2.5 py-0.5 text-[11px] font-medium text-primary shadow-sm backdrop-blur-sm hover:bg-background/95">
            <span aria-hidden>{badge.emoji}</span> {badge.label}
          </Badge>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <div className="min-h-0 flex-1">
          <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">
            {pkg.name}
          </h3>

          <p className="mt-1 line-clamp-1 text-sm text-foreground/60">{tagline}</p>

          {visible.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {visible.map((name, index) => (
                <li
                  key={`${pkg.id}-preview-${index}`}
                  className="flex items-center gap-2 text-sm text-foreground/75"
                >
                  <CheckIcon className="size-3.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
                  <span className="truncate">{name}</span>
                </li>
              ))}
              {remaining > 0 ? (
                <li className="pl-5 text-sm font-medium text-primary">+{remaining} More</li>
              ) : null}
            </ul>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/55">
            {durationLabel ? (
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="size-3.5 shrink-0 text-foreground/45" />
                {durationLabel}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <UsersIcon className="size-3.5 shrink-0 text-foreground/45" />
              {serviceCount} {serviceCount === 1 ? "Service" : "Services"}
            </span>
          </div>
        </div>

        <div className="mt-auto border-t border-border/50 pt-4">
          <p className="font-heading text-[1.75rem] font-semibold leading-none tabular-nums text-foreground">
            {formatInr(pkg.packagePrice)}
          </p>
          {shouldShowCompare ? (
            <p className="mt-1 text-sm text-foreground/45 line-through tabular-nums">
              {formatInr(pkg.comparePrice)}
            </p>
          ) : null}
          {savings > 0 && pkg.showSavings ? (
            <p className="mt-1.5 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-sm font-semibold text-emerald-700">
              Save {formatInr(savings)}
              {savingsPercent > 0 ? ` (${savingsPercent}%)` : ""}
            </p>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <Button
              type="button"
              size="md"
              className="relative z-10 flex-1"
              onClick={(event) => {
                event.stopPropagation()
                onViewDetails()
              }}
            >
              View Details
            </Button>
            <Button
              type="button"
              size="icon"
              variant={selected ? "secondary" : "outline"}
              className={cn(
                "relative z-10 shrink-0 border-border/80 bg-background transition-transform duration-200 active:scale-95",
                selected && "border-primary/30 bg-primary/10 text-primary",
              )}
              disabled={!pkg.allowOnlineBooking}
              onClick={(event) => {
                event.stopPropagation()
                onAddPackage()
              }}
              aria-label={selected ? `${pkg.name} added to booking` : `Quick add ${pkg.name}`}
            >
              {selected ? <CheckIcon className="size-4" /> : <PlusIcon className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
