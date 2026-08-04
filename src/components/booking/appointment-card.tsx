"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  CalendarIcon,
  ClockIcon,
  HashIcon,
  MapPinIcon,
  SparklesIcon,
  StarIcon,
  TimerIcon,
  UserIcon,
} from "lucide-react"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { BookingPriceBreakdownCard } from "@/components/booking/booking-price-breakdown"
import { CancelBookingButton } from "@/components/booking/cancel-booking-button"
import { LeaveReviewDialog } from "@/components/reviews/leave-review-dialog"
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
import { Button } from "@/components/ui/button"
import type { Booking } from "@/types/booking"
import { cn } from "@/lib/utils"

type AppointmentCardProps = {
  booking: Booking
  authenticated: boolean
  index?: number
}

const easeOut = [0.22, 1, 0.36, 1] as const

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarIcon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5">
      <p className="inline-flex items-center gap-1 text-[0.65rem] font-semibold tracking-[0.1em] text-foreground/40 uppercase">
        <Icon className="size-3 shrink-0" aria-hidden />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-3.5",
            i < rating
              ? "fill-primary text-primary"
              : "fill-muted text-muted-foreground/25",
          )}
          aria-hidden
        />
      ))}
    </span>
  )
}

export function AppointmentCard({ booking, authenticated, index = 0 }: AppointmentCardProps) {
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
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.16), ease: easeOut }}
      className={cn(
        "overflow-hidden rounded-2xl border border-border/65 bg-card shadow-sm shadow-black/[0.03]",
        "transition-[box-shadow,border-color,transform] duration-200 ease-out",
        "hover:border-border hover:shadow-md hover:shadow-black/[0.05]",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/55 px-4 py-3.5 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <h3 className="min-w-0 font-heading text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
              {booking.salonName}
            </h3>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-foreground/55">
            <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
            {booking.salonArea}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 border-b border-border/55 px-4 py-3 sm:grid-cols-4 sm:px-5">
        <MetaChip icon={CalendarIcon} label="Date" value={formatBookingDate(booking.date)} />
        <MetaChip icon={ClockIcon} label="Time" value={booking.time} />
        <MetaChip
          icon={TimerIcon}
          label="Duration"
          value={`~${formatDuration(booking.durationMin)}`}
        />
        {booking.staffName ? (
          <MetaChip icon={UserIcon} label="Stylist" value={booking.staffName} />
        ) : (
          <div className="hidden min-w-0 rounded-xl border border-dashed border-border/50 bg-muted/20 px-3 py-2.5 sm:block" />
        )}
      </div>

      <div className="border-b border-border/55 px-4 py-3.5 sm:px-5">
        <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
          <SparklesIcon className="size-3" aria-hidden />
          Service{booking.services.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-2 divide-y divide-border/45">
          {booking.services.map((service) => (
            <li
              key={service.id}
              className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
                <p className="mt-0.5 text-xs text-foreground/45">{service.durationMin} min</p>
              </div>
              <p
                className={cn(
                  "shrink-0 text-sm tabular-nums",
                  breakdown.hasAdjustments
                    ? "font-medium text-foreground/45"
                    : "font-medium text-foreground/80",
                )}
              >
                {formatInr(service.price)}
              </p>
            </li>
          ))}
        </ul>
        {breakdown.hasAdjustments ? (
          <p className="mt-2 text-xs text-foreground/45">
            Service prices are before promo and wallet. See payment summary for what you pay.
          </p>
        ) : null}
      </div>

      {(booking.declineReason || displayNotes) && (
        <div className="space-y-2 border-b border-border/55 px-4 py-3 sm:px-5">
          {booking.declineReason ? (
            <p className="rounded-xl bg-destructive/5 px-3 py-2 text-sm text-destructive/90">
              Salon note: {booking.declineReason}
            </p>
          ) : null}
          {displayNotes ? (
            <p className="rounded-xl bg-muted/40 px-3 py-2 text-sm whitespace-pre-line text-foreground/60">
              Note: {displayNotes}
            </p>
          ) : null}
        </div>
      )}

      {booking.review ? (
        <div className="border-b border-border/55 px-4 py-3.5 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
              <StarIcon className="size-3" aria-hidden />
              Your review
            </p>
            <ReviewStars rating={booking.review.rating} />
          </div>
          <p className="mt-1.5 text-xs font-medium text-foreground/55">
            {booking.review.reviewType}
          </p>
          {booking.review.comment ? (
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              {booking.review.comment}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="border-b border-border/55 px-4 py-3.5 sm:px-5">
        <p className="mb-2 text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
          Payment summary
        </p>
        <BookingPriceBreakdownCard
          breakdown={breakdown}
          payableLabel={showSalonPaymentLabel ? salonPaymentLabel : undefined}
          compact
          className="w-full"
        />
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/45 pt-3">
          <p className="inline-flex items-center gap-1 text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
            <HashIcon className="size-3" aria-hidden />
            Reference
          </p>
          <p className="text-sm font-semibold tracking-wide text-foreground/70">
            #{bookingReference}
          </p>
        </div>
      </div>

      {hasActions ? (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
          {canReschedule ? (
            <Button asChild variant="outline" size="sm" className="h-9 rounded-full px-4">
              <Link href={`/dashboard/bookings/${rescheduleAppointmentId}/reschedule`}>
                Reschedule
              </Link>
            </Button>
          ) : null}

          {canCancel ? (
            <CancelBookingButton bookingId={booking.crmAppointmentId ?? booking.id} />
          ) : null}

          {canRebook ? (
            <Button asChild size="sm" className="h-9 rounded-full px-4">
              <Link href={rebookHref}>Book Again</Link>
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
      ) : null}
    </motion.article>
  )
}
