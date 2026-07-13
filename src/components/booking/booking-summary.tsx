"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircleIcon } from "lucide-react"

import { formatDuration } from "@/lib/bookings/utils"
import { formatInr, formatPackageDuration } from "@/lib/salons/catalog-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"
import type { SalonCancellationPolicy, SalonPackage, SalonService } from "@/types/salon"

type BookingSummaryProps = {
  services: SalonService[]
  selectedPackage?: SalonPackage | null
  appliedOffer?: AppliedOfferDiscount | null
  emptyLabel?: string
  compact?: boolean
  cancellationPolicy?: SalonCancellationPolicy | null
  totalDurationMin?: number
}

function formatServiceDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (remainder === 0) return `${hours} hr`
  return `${hours} hr ${remainder} min`
}

function BookingTrustSection({
  cancellationPolicy,
}: {
  cancellationPolicy?: SalonCancellationPolicy | null
}) {
  const hasFreeCancellation =
    cancellationPolicy?.active === true && cancellationPolicy.freeCancelHours > 0

  const trustItems = [
    "Pay directly at the salon",
    "Instant booking confirmation",
    hasFreeCancellation
      ? `Free cancellation before appointment (${cancellationPolicy!.freeCancelHours}h notice)`
      : "Easily reschedule from My Bookings",
  ]

  return (
    <ul className="space-y-2" aria-label="Booking assurances">
      {trustItems.map((item) => (
        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground sm:text-sm">
          <CheckCircleIcon
            className="mt-0.5 size-3.5 shrink-0 text-emerald-600"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function BookingSummary({
  services,
  selectedPackage = null,
  appliedOffer = null,
  emptyLabel = "Select at least one service to see your estimate.",
  compact = false,
  cancellationPolicy,
  totalDurationMin,
}: BookingSummaryProps) {
  if (services.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  const packageMode = Boolean(selectedPackage)
  const subtotal =
    appliedOffer?.subtotal ??
    (packageMode ? selectedPackage!.packagePrice : services.reduce((sum, svc) => sum + svc.price, 0))
  const total = appliedOffer?.finalTotal ?? subtotal
  const duration =
    totalDurationMin ??
    (packageMode
      ? selectedPackage!.totalDurationMin ||
        services.reduce((sum, svc) => sum + svc.durationMin, 0)
      : services.reduce((sum, svc) => sum + svc.durationMin, 0))
  const durationLabel = packageMode
    ? formatPackageDuration(selectedPackage!, services) || formatDuration(duration)
    : formatDuration(duration)
  const hasDiscount = Boolean(appliedOffer && appliedOffer.discountAmount > 0)

  if (compact) {
    return (
      <div className="space-y-1">
        <p className="font-heading text-3xl font-semibold tabular-nums sm:text-4xl">
          {formatInr(total)}
        </p>
        {appliedOffer ? (
          <p className="text-sm text-emerald-700">
            You save {formatInr(appliedOffer.discountAmount)} with {appliedOffer.code}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {packageMode ? "1 package" : `${services.length} service${services.length === 1 ? "" : "s"}`}{" "}
          · ~{durationLabel}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Total to pay</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl"
          >
            {formatInr(total)}
          </motion.p>
        </AnimatePresence>

        <AnimatePresence>
          {hasDiscount ? (
            <motion.div
              key="savings"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-1"
            >
              <p className="text-sm font-medium text-emerald-700">
                You saved {formatInr(appliedOffer!.discountAmount)} today
              </p>
              <p className="text-xs text-muted-foreground">
                Original price{" "}
                <span className="line-through tabular-nums">{formatInr(subtotal)}</span>
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="space-y-3 border-t border-border/60 pt-4">
        {packageMode ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{selectedPackage!.name}</p>
              <p className="text-xs text-muted-foreground">{durationLabel}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">{formatInr(selectedPackage!.packagePrice)}</p>
          </div>
        ) : (
          services.map((svc) => (
            <div key={svc.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{svc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatServiceDuration(svc.durationMin)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums">{formatInr(svc.price)}</p>
            </div>
          ))
        )}

        <AnimatePresence>
          {hasDiscount ? (
            <motion.div
              key={appliedOffer!.code}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Discount</p>
                <p className="text-sm font-medium text-emerald-700">{appliedOffer!.code}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-700">
                -{formatInr(appliedOffer!.discountAmount)}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <p className="text-base font-semibold text-foreground">Total</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={`total-${total}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-lg font-semibold tabular-nums text-foreground"
          >
            {formatInr(total)}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="border-t border-border/60 pt-4">
        <BookingTrustSection cancellationPolicy={cancellationPolicy} />
      </div>
    </div>
  )
}

export function getBookingPayableTotal({
  services,
  selectedPackage = null,
  appliedOffer = null,
}: Pick<BookingSummaryProps, "services" | "selectedPackage" | "appliedOffer">): number {
  if (services.length === 0) return 0

  const packageMode = Boolean(selectedPackage)
  const subtotal =
    appliedOffer?.subtotal ??
    (packageMode
      ? selectedPackage!.packagePrice
      : services.reduce((sum, svc) => sum + svc.price, 0))

  return appliedOffer?.finalTotal ?? subtotal
}
