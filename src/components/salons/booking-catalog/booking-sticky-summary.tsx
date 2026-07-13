"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ClockIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  buildPackageServiceIds,
  formatInr,
  formatPackageDuration,
  getPackageSavings,
} from "@/lib/salons/catalog-utils"
import {
  formatDuration,
  sumServiceDuration,
  sumServicePrice,
} from "@/lib/bookings/utils"
import type { SalonPackage, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type BookingStickySummaryProps = {
  selectedServices: SalonService[]
  extraServices: SalonService[]
  selectedPackage: SalonPackage | null
  recommendedPackage: SalonPackage | null
  allServices: SalonService[]
  salonId: string
  authenticated: boolean
  bookHref: string
  onRemoveService: (id: string) => void
  onClearPackage: () => void
  onClearAll: () => void
  onAddRecommendedPackage?: (pkg: SalonPackage) => void
  onViewRecommendedPackage?: (pkg: SalonPackage) => void
  className?: string
}

export function BookingStickySummary({
  selectedServices,
  extraServices,
  selectedPackage,
  recommendedPackage,
  allServices,
  bookHref,
  onRemoveService,
  onClearPackage,
  onClearAll,
  onAddRecommendedPackage,
  onViewRecommendedPackage,
  className,
}: BookingStickySummaryProps) {
  const hasSelection = selectedServices.length > 0
  const hasPackage = Boolean(selectedPackage)
  const hasExtras = extraServices.length > 0
  const servicesOnly = !hasPackage && hasSelection

  const packageSavings = selectedPackage ? getPackageSavings(selectedPackage) : null
  const packageDuration = selectedPackage
    ? formatPackageDuration(selectedPackage, allServices)
    : null
  const packageDurationMin = selectedPackage
    ? selectedPackage.totalDurationMin ||
      sumServiceDuration(
        selectedServices.filter((service) =>
          buildPackageServiceIds(selectedPackage).includes(service.id),
        ),
      )
    : 0

  const extraSubtotal = sumServicePrice(extraServices)
  const extraDuration = sumServiceDuration(extraServices)
  const totalSubtotal = (selectedPackage?.packagePrice ?? 0) + extraSubtotal
  const totalDuration = packageDurationMin + extraDuration

  const recommendedSavings = recommendedPackage
    ? getPackageSavings(recommendedPackage)
    : null

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border/70 bg-card/95 p-5 shadow-lg shadow-black/[0.04] backdrop-blur-sm sm:p-6 lg:sticky lg:top-[5.75rem] lg:self-start",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
          Your booking
        </p>
        {hasSelection ? (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-foreground/50 underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {!hasSelection ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-4"
          >
            <p className="text-sm leading-relaxed text-foreground/60">
              Start by choosing a package or individual service.
            </p>

            {recommendedPackage ? (
              <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-3.5">
                <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
                  Recommended
                </p>
                <p className="mt-1.5 font-heading text-base font-semibold leading-snug text-foreground">
                  {recommendedPackage.name}
                </p>
                {recommendedSavings && recommendedSavings.savings > 0 ? (
                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    Save {formatInr(recommendedSavings.savings)}
                    {recommendedSavings.savingsPercent > 0
                      ? ` (${recommendedSavings.savingsPercent}%)`
                      : ""}
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={() => onViewRecommendedPackage?.(recommendedPackage)}
                  >
                    View Details
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={() => onAddRecommendedPackage?.(recommendedPackage)}
                  >
                    Quick Add
                  </Button>
                </div>
              </div>
            ) : null}

            <Button className="w-full rounded-full" disabled>
              Continue
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-4"
          >
            {hasPackage && selectedPackage ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-primary">Package</p>
                    <p className="mt-1 font-heading text-lg font-semibold leading-snug">
                      {selectedPackage.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClearPackage}
                    className="rounded-full p-1 text-foreground/45 transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Remove package"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/70 p-3.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground/60">Package price</span>
                    <span className="font-heading text-lg font-semibold tabular-nums">
                      {formatInr(selectedPackage.packagePrice)}
                    </span>
                  </div>
                  {packageSavings && packageSavings.savings > 0 ? (
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-foreground/60">Savings</span>
                      <span className="font-medium text-emerald-700">
                        {formatInr(packageSavings.savings)}
                      </span>
                    </div>
                  ) : null}
                  {packageDuration ? (
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-foreground/60">Duration</span>
                      <span className="inline-flex items-center gap-1 text-foreground/70">
                        <ClockIcon className="size-3.5" />
                        ~{packageDuration}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                    Included services
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground/70">
                    {selectedPackage.items.map((item) => (
                      <li key={`${selectedPackage.id}-${item.serviceId}`}>
                        {item.quantity}× {item.serviceName}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {servicesOnly ? (
              <ul className="space-y-2.5">
                {extraServices.map((service) => (
                  <li
                    key={service.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{service.name}</p>
                      <p className="mt-0.5 text-xs text-foreground/55">
                        {service.durationMin} min · {formatInr(service.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveService(service.id)}
                      className="rounded-full p-1 text-foreground/45 transition-colors hover:bg-accent hover:text-foreground"
                      aria-label={`Remove ${service.name}`}
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {hasPackage && hasExtras ? (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                  Additional services
                </p>
                <ul className="space-y-2.5">
                  {extraServices.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{service.name}</p>
                        <p className="mt-0.5 text-xs text-foreground/55">
                          {service.durationMin} min · {formatInr(service.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveService(service.id)}
                        className="rounded-full p-1 text-foreground/45 transition-colors hover:bg-accent hover:text-foreground"
                        aria-label={`Remove ${service.name}`}
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-xl border border-border/60 bg-background/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground/60">Subtotal</span>
                <span className="font-heading text-xl font-semibold tabular-nums">
                  {formatInr(hasPackage ? totalSubtotal : extraSubtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground/60">Duration</span>
                <span className="text-foreground/70">
                  ~{formatDuration(hasPackage ? totalDuration : extraDuration)}
                </span>
              </div>
            </div>

            <Button asChild className="w-full rounded-full" size="lg">
              <Link href={bookHref}>Continue</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}

type MobileBookingBarProps = {
  selectedServices: SalonService[]
  extraServices: SalonService[]
  selectedPackage: SalonPackage | null
  bookHref: string
  salonId: string
  authenticated: boolean
}

export function MobileBookingBar({
  extraServices,
  selectedPackage,
  bookHref,
}: MobileBookingBarProps) {
  const hasSelection = Boolean(selectedPackage) || extraServices.length > 0
  if (!hasSelection) return null

  const extraSubtotal = sumServicePrice(extraServices)
  const total = selectedPackage ? selectedPackage.packagePrice + extraSubtotal : extraSubtotal

  const summaryLabel = selectedPackage
    ? extraServices.length > 0
      ? `1 package + ${extraServices.length} service${extraServices.length === 1 ? "" : "s"}`
      : selectedPackage.name
    : `${extraServices.length} service${extraServices.length === 1 ? "" : "s"}`

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/98 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
      <div className="mx-auto max-w-lg px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.12em] text-foreground/60 uppercase">
              Your booking
            </p>
            <p className="mt-0.5 truncate font-heading text-xl font-semibold tabular-nums text-foreground">
              {formatInr(total)}
            </p>
          </div>
          <p className="max-w-[45%] truncate text-right text-sm font-medium text-foreground/75">
            {summaryLabel}
          </p>
        </div>
        <Button asChild className="h-12 w-full rounded-full text-base font-semibold shadow-sm" size="lg">
          <Link href={bookHref}>Continue</Link>
        </Button>
      </div>
    </div>
  )
}
