"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  CalendarIcon,
  ClockIcon,
  HashIcon,
  MapPinIcon,
  ScissorsIcon,
  TimerIcon,
  UserIcon,
} from "lucide-react"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { CancelBookingButton } from "@/components/booking/cancel-booking-button"
import { LeaveReviewDialog } from "@/components/reviews/leave-review-dialog"
import {
  canConsumerCancelBooking,
  canConsumerRebookBooking,
  canConsumerRescheduleBooking,
} from "@/lib/bookings/booking-status"
import { buildBookHref, formatBookingDate, formatDuration } from "@/lib/bookings/utils"
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
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-heading text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
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
          <ScissorsIcon className="size-3" aria-hidden />
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
              <p className="shrink-0 text-sm font-medium tabular-nums text-foreground/80">
                {formatInr(service.price)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {(booking.declineReason || booking.notes) && (
        <div className="space-y-2 border-b border-border/55 px-4 py-3 sm:px-5">
          {booking.declineReason ? (
            <p className="rounded-xl bg-destructive/5 px-3 py-2 text-sm text-destructive/90">
              Salon note: {booking.declineReason}
            </p>
          ) : null}
          {booking.notes ? (
            <p className="rounded-xl bg-muted/40 px-3 py-2 text-sm text-foreground/60">
              Note: {booking.notes}
            </p>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/55 px-4 py-3.5 sm:px-5">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
            Estimated Total
          </p>
          <p className="mt-1 font-heading text-xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatInr(booking.price)}
          </p>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1 text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
            <HashIcon className="size-3" aria-hidden />
            Reference
          </p>
          <p className="mt-1 text-sm font-semibold tracking-wide text-foreground/70">
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
