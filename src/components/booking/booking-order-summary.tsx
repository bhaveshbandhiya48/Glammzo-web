"use client"

import Link from "next/link"
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TimerIcon,
  UserIcon,
} from "lucide-react"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { BookingPriceBreakdownCard } from "@/components/booking/booking-price-breakdown"
import { CancelBookingButton } from "@/components/booking/cancel-booking-button"
import { LeaveReviewDialog } from "@/components/reviews/leave-review-dialog"
import { Button } from "@/components/ui/button"
import {
  canConsumerCancelBooking,
  canConsumerRebookBooking,
  canConsumerRescheduleBooking,
} from "@/lib/bookings/booking-status"
import {
  buildBookHref,
  formatBookingDate,
  formatBookingNotesForDisplay,
  formatDuration,
  hasPayAtSalonNote,
  parseBookingPriceBreakdown,
} from "@/lib/bookings/utils"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { Booking } from "@/types/booking"
import { cn } from "@/lib/utils"

type BookingOrderSummaryProps = {
  booking: Booking
  authenticated: boolean
  className?: string
}

/**
 * E-commerce style order / booking summary receipt.
 */
export function BookingOrderSummary({
  booking,
  authenticated,
  className,
}: BookingOrderSummaryProps) {
  const serviceIds = booking.services.map((svc) => svc.id)
  const rebookHref = buildBookHref(booking.salonId, serviceIds, authenticated)
  const bookingReference = booking.id.slice(0, 8).toUpperCase()
  const rescheduleAppointmentId = booking.crmAppointmentId ?? booking.id
  const canReschedule = canConsumerRescheduleBooking(booking.status)
  const canCancel = canConsumerCancelBooking(booking.status)
  const canRebook = canConsumerRebookBooking(booking.status)
  const canLeaveReview =
    booking.status === "completed" &&
    booking.isCrmCompleted &&
    Boolean(booking.crmAppointmentId) &&
    !booking.hasVerifiedReview
  const isCompleted =
    Boolean(booking.isCrmCompleted) || booking.status === "completed"
  const displayNotes = formatBookingNotesForDisplay(booking.notes)
  const breakdown = parseBookingPriceBreakdown(booking)
  const showSalonPaymentLabel =
    hasPayAtSalonNote(booking.notes) || isCompleted || breakdown.hasAdjustments
  const salonPaymentLabel = isCompleted ? "Paid at salon" : "Pay at salon"
  const hasActions = canReschedule || canCancel || canRebook || canLeaveReview

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-background", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {/* Order header */}
        <div className="border-b border-border/60 px-5 py-5 pr-14">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Order summary
              </p>
              <p className="mt-1 font-heading text-xl font-semibold tracking-tight">
                #{bookingReference}
              </p>
              <p className="mt-1 text-sm text-foreground/55">
                Placed{" "}
                {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        {/* Merchant / salon */}
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            Salon
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-heading text-lg font-semibold tracking-tight">
                {booking.salonName}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground/55">
                <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
                {booking.salonArea}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
              <Link href={`/salons/${booking.salonId}`}>View</Link>
            </Button>
          </div>
        </div>

        {/* Fulfillment / appointment slot */}
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            Appointment
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 ring-1 ring-border/50">
              <dt className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-foreground/40 uppercase">
                <CalendarIcon className="size-3" aria-hidden />
                Date
              </dt>
              <dd className="mt-1 text-sm font-medium">{formatBookingDate(booking.date)}</dd>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 ring-1 ring-border/50">
              <dt className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-foreground/40 uppercase">
                <ClockIcon className="size-3" aria-hidden />
                Time
              </dt>
              <dd className="mt-1 text-sm font-medium">{booking.time}</dd>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 ring-1 ring-border/50">
              <dt className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-foreground/40 uppercase">
                <TimerIcon className="size-3" aria-hidden />
                Duration
              </dt>
              <dd className="mt-1 text-sm font-medium">
                ~{formatDuration(booking.durationMin)}
              </dd>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 ring-1 ring-border/50">
              <dt className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-foreground/40 uppercase">
                <UserIcon className="size-3" aria-hidden />
                Stylist
              </dt>
              <dd className="mt-1 truncate text-sm font-medium">
                {booking.staffName || "Any available"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Line items */}
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            Items ({booking.services.length})
          </p>
          <ul className="mt-3 divide-y divide-border/50">
            {booking.services.map((service) => (
              <li key={service.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{service.name}</p>
                  <p className="mt-0.5 text-xs text-foreground/45">Qty 1 · {service.durationMin} min</p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm tabular-nums",
                    breakdown.hasAdjustments
                      ? "font-medium text-foreground/50"
                      : "font-semibold text-foreground",
                  )}
                >
                  {formatInr(service.price)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {(booking.declineReason || displayNotes) && (
          <div className="space-y-2 border-b border-border/60 px-5 py-4">
            {booking.declineReason ? (
              <p className="rounded-lg bg-destructive/5 px-3 py-2.5 text-sm text-destructive/90">
                Salon note: {booking.declineReason}
              </p>
            ) : null}
            {displayNotes ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2.5 text-sm whitespace-pre-line text-foreground/65">
                Note: {displayNotes}
              </p>
            ) : null}
          </div>
        )}

        {/* Totals — e-commerce order box */}
        <div className="px-5 py-5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            Price details
          </p>
          <div className="mt-3 rounded-xl bg-muted/30 p-4 ring-1 ring-border/60">
            <BookingPriceBreakdownCard
              breakdown={breakdown}
              payableLabel={showSalonPaymentLabel ? salonPaymentLabel : undefined}
              className="w-full border-0 bg-transparent p-0"
            />
          </div>
        </div>
      </div>

      {hasActions ? (
        <div className="shrink-0 border-t border-border/70 bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-wrap gap-2">
            {canReschedule ? (
              <Button asChild variant="outline" className="min-w-0 flex-1 rounded-full">
                <Link href={`/dashboard/bookings/${rescheduleAppointmentId}/reschedule`}>
                  Reschedule
                </Link>
              </Button>
            ) : null}
            {canCancel ? (
              <CancelBookingButton bookingId={booking.crmAppointmentId ?? booking.id} />
            ) : null}
            {canRebook ? (
              <Button asChild className="min-w-0 flex-1 rounded-full">
                <Link href={rebookHref}>Book again</Link>
              </Button>
            ) : null}
            {canLeaveReview && booking.crmAppointmentId ? (
              <LeaveReviewDialog
                appointmentId={booking.crmAppointmentId}
                salonName={booking.salonName}
                staffName={booking.staffName}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
