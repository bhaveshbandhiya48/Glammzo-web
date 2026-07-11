"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { BookingsFilter } from "@/components/booking/bookings-filter"
import { LeaveReviewDialog } from "@/components/reviews/leave-review-dialog"
import { cancelBookingAction } from "@/lib/bookings/actions"
import {
  canConsumerCancelBooking,
  canConsumerRebookBooking,
  canConsumerRescheduleBooking,
} from "@/lib/bookings/booking-status"
import {
  filterBookings,
  getBookingFilterEmptyMessage,
  matchesBookingFilter,
  parseBookingFilter,
  type BookingFilter,
} from "@/lib/bookings/booking-filters"
import { buildBookHref, formatBookingDate, formatDuration } from "@/lib/bookings/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Booking } from "@/types/booking"

type BookingsSectionProps = {
  bookings: Booking[]
  authenticated: boolean
  initialFilter?: string
}

function buildFilterCounts(bookings: Booking[]): Record<BookingFilter, number> {
  return {
    all: bookings.length,
    upcoming: bookings.filter((booking) => matchesBookingFilter(booking, "upcoming")).length,
    completed: bookings.filter((booking) => matchesBookingFilter(booking, "completed")).length,
    cancelled: bookings.filter((booking) => matchesBookingFilter(booking, "cancelled")).length,
  }
}

export function BookingsSection({
  bookings,
  authenticated,
  initialFilter,
}: BookingsSectionProps) {
  const [filter, setFilter] = useState<BookingFilter>(() => parseBookingFilter(initialFilter))

  const counts = useMemo(() => buildFilterCounts(bookings), [bookings])
  const visibleBookings = useMemo(() => filterBookings(bookings, filter), [bookings, filter])

  if (bookings.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="px-6 py-10 text-center">
          <p className="text-foreground/65">{getBookingFilterEmptyMessage("all")}</p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/explore">Explore salons</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <BookingsFilter value={filter} onChange={setFilter} counts={counts} />

      {visibleBookings.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="px-6 py-10 text-center">
            <p className="text-foreground/65">{getBookingFilterEmptyMessage(filter)}</p>
            {filter !== "all" ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => setFilter("all")}
              >
                Show all appointments
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {visibleBookings.map((booking) => {
            const serviceIds = booking.services.map((svc) => svc.id)
            const rebookHref = buildBookHref(booking.salonId, serviceIds, authenticated)

            return (
              <li key={booking.id}>
                <Card className="rounded-2xl">
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 px-6 py-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-lg font-semibold">{booking.salonName}</p>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <p className="mt-1 text-sm text-foreground/60">{booking.salonArea}</p>
                      <ul className="mt-3 space-y-1 text-sm text-foreground/75">
                        {booking.services.map((svc) => (
                          <li key={svc.id}>
                            {svc.name}
                            <span className="text-foreground/50"> · ₹{svc.price}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm text-foreground/60">
                        {formatBookingDate(booking.date)} · {booking.time} · ~
                        {formatDuration(booking.durationMin)}
                      </p>
                      <p className="mt-2 font-medium tabular-nums">₹{booking.price} total</p>
                      {booking.declineReason ? (
                        <p className="mt-2 text-sm text-destructive/90">
                          Salon note: {booking.declineReason}
                        </p>
                      ) : null}
                      {booking.notes ? (
                        <p className="mt-2 text-sm text-foreground/55">Note: {booking.notes}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-stretch gap-2 sm:items-end">
                      {canConsumerRescheduleBooking(booking.status) ? (
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <Link href={`/dashboard/bookings/${booking.id}/reschedule`}>
                            Reschedule
                          </Link>
                        </Button>
                      ) : null}

                      {canConsumerCancelBooking(booking.status) ? (
                        <form action={cancelBookingAction}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <Button type="submit" variant="outline" size="sm" className="rounded-full">
                            Cancel
                          </Button>
                        </form>
                      ) : null}

                      {canConsumerRebookBooking(booking.status) ? (
                        <Button asChild size="sm" className="rounded-full">
                          <Link href={rebookHref}>Book again</Link>
                        </Button>
                      ) : null}

                      {booking.status === "completed" &&
                      booking.isCrmCompleted &&
                      booking.crmAppointmentId &&
                      !booking.hasVerifiedReview ? (
                        <LeaveReviewDialog
                          appointmentId={booking.crmAppointmentId}
                          salonName={booking.salonName}
                          staffName={booking.staffName}
                        />
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
