"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircleIcon } from "lucide-react"

import { formatDuration } from "@/lib/bookings/utils"
import { ServicePriceText } from "@/components/salons/booking-catalog/service-price-text"
import { formatInr, formatPackageDuration } from "@/lib/salons/catalog-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"
import type { SalonCancellationPolicy, SalonPackage, SalonService } from "@/types/salon"

type BookingSummaryProps = {
  services: SalonService[]
  selectedPackage?: SalonPackage | null
  appliedOffer?: AppliedOfferDiscount | null
  cashbackClaim?: { code: string; cashbackRupees: number } | null
  emptyLabel?: string
  compact?: boolean
  cancellationPolicy?: SalonCancellationPolicy | null
  totalDurationMin?: number
  walletAppliedRupees?: number
  freeServiceAppliedRupees?: number
  payAtSalonRupees?: number
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
  const hasFreeCancellation = cancellationPolicy?.active === true
  const noticeHours = cancellationPolicy?.freeCancelHours ?? 0

  const trustItems = [
    "Pay directly at the salon",
    "Instant booking confirmation",
    hasFreeCancellation
      ? noticeHours > 0
        ? `Free cancellation until ${noticeHours} hours before your appointment`
        : "Free cancellation until your appointment starts"
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
  cashbackClaim = null,
  emptyLabel = "Select at least one service to see your estimate.",
  compact = false,
  cancellationPolicy,
  totalDurationMin,
  walletAppliedRupees = 0,
  freeServiceAppliedRupees = 0,
  payAtSalonRupees,
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
  const payAtSalon = payAtSalonRupees ?? Math.max(0, total - walletAppliedRupees - freeServiceAppliedRupees)

  if (compact) {
    return (
      <div className="space-y-1">
        <p className="font-heading text-3xl font-semibold tabular-nums sm:text-4xl">
          {formatInr(payAtSalon)}
        </p>
        <p className="text-sm text-muted-foreground">Pay at salon</p>
        {appliedOffer ? (
          <p className="text-sm text-emerald-700">
            You save {formatInr(appliedOffer.discountAmount)} with {appliedOffer.code}
          </p>
        ) : cashbackClaim ? (
          <p className="text-sm text-emerald-700">
            {cashbackClaim.code}: {formatInr(cashbackClaim.cashbackRupees)} cashback after visit
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {packageMode ? "1 package" : `${services.length} service${services.length === 1 ? "" : "s"}`}{" "}
          · ~{formatDuration(duration)}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Pay at salon</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={payAtSalon}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl"
          >
            {formatInr(payAtSalon)}
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
            </motion.div>
          ) : cashbackClaim ? (
            <motion.div
              key="cashback-note"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-lg border border-emerald-200/70 bg-emerald-50/80 px-3 py-2"
            >
              <p className="text-sm font-medium text-emerald-800">
                {cashbackClaim.code}: {formatInr(cashbackClaim.cashbackRupees)} cashback after visit
              </p>
              <p className="mt-0.5 text-xs text-emerald-800/75">
                Pay the full amount at the salon today. Cashback is added to your wallet after this
                visit is completed.
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
            <p className="shrink-0 text-sm font-semibold tabular-nums">
              {formatInr(selectedPackage!.packagePrice)}
            </p>
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
              <p className="shrink-0 text-sm font-semibold">
                <ServicePriceText service={svc} />
              </p>
            </div>
          ))
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="text-sm font-medium tabular-nums text-foreground">{formatInr(subtotal)}</p>
        </div>

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
                −{formatInr(appliedOffer!.discountAmount)}
              </p>
            </motion.div>
          ) : cashbackClaim ? (
            <motion.div
              key={`cashback-line-${cashbackClaim.code}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Wallet cashback</p>
                <p className="text-sm font-medium text-emerald-700">{cashbackClaim.code}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-700">
                +{formatInr(cashbackClaim.cashbackRupees)} later
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {freeServiceAppliedRupees > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-emerald-700">Loyalty credit</p>
            <p className="text-sm font-semibold tabular-nums text-emerald-700">
              −{formatInr(freeServiceAppliedRupees)}
            </p>
          </div>
        ) : null}

        {walletAppliedRupees > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-emerald-700">Wallet</p>
            <p className="text-sm font-semibold tabular-nums text-emerald-700">
              −{formatInr(walletAppliedRupees)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <div>
          <p className="text-base font-semibold text-foreground">Total payable</p>
          <p className="text-xs text-muted-foreground">Pay at salon</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={`total-${payAtSalon}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-lg font-semibold tabular-nums text-foreground"
          >
            {formatInr(payAtSalon)}
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
