import Link from "next/link"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { cancelBookingAction } from "@/lib/bookings/actions"
import {
  canConsumerCancelBooking,
  canConsumerRebookBooking,
  canConsumerRescheduleBooking,
} from "@/lib/bookings/booking-status"
import { getCustomerBookings } from "@/lib/bookings/customer-bookings"
import { buildBookHref, formatBookingDate, formatDuration } from "@/lib/bookings/utils"
import { PageHeader } from "@/components/layout/page-header"
import { LeaveReviewDialog } from "@/components/reviews/leave-review-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getSession } from "@/lib/auth/session"

type SearchParams = Promise<{
  error?: string
  rescheduled?: string
}>

export default async function BookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const error = params.error
  const rescheduled = params.rescheduled === "1"
  const session = await getSession()

  const bookings = await getCustomerBookings()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your account"
        title="Your appointments"
        subtitle="Track pending requests, confirmed visits, and past bookings."
      />

      {rescheduled ? (
        <Card className="rounded-2xl border-primary/30 bg-primary/5">
          <CardContent className="px-6 py-4">
            <p className="text-sm text-foreground/80">
              Your appointment was rescheduled. The salon will see your new time.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {error === "cancel" ? (
        <Card className="rounded-2xl">
          <CardContent className="px-6 py-4">
            <p className="text-sm text-destructive/90">
              We couldn&apos;t cancel this booking. Please try again or contact the salon.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {error === "reschedule" ? (
        <Card className="rounded-2xl">
          <CardContent className="px-6 py-4">
            <p className="text-sm text-destructive/90">
              We couldn&apos;t reschedule this booking. Please try again or contact the salon.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {bookings.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="px-6 py-10 text-center">
            <p className="text-foreground/65">You haven&apos;t booked anything yet.</p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/explore">Explore salons</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => {
            const serviceIds = b.services.map((svc) => svc.id)
            const rebookHref = buildBookHref(b.salonId, serviceIds, Boolean(session))

            return (
              <li key={b.id}>
                <Card className="rounded-2xl">
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 px-6 py-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-lg font-semibold">{b.salonName}</p>
                        <BookingStatusBadge status={b.status} />
                      </div>
                      <p className="mt-1 text-sm text-foreground/60">{b.salonArea}</p>
                      <ul className="mt-3 space-y-1 text-sm text-foreground/75">
                        {b.services.map((svc) => (
                          <li key={svc.id}>
                            {svc.name}
                            <span className="text-foreground/50"> · ₹{svc.price}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm text-foreground/60">
                        {formatBookingDate(b.date)} · {b.time} · ~{formatDuration(b.durationMin)}
                      </p>
                      <p className="mt-2 font-medium tabular-nums">₹{b.price} total</p>
                      {b.declineReason ? (
                        <p className="mt-2 text-sm text-destructive/90">
                          Salon note: {b.declineReason}
                        </p>
                      ) : null}
                      {b.notes ? (
                        <p className="mt-2 text-sm text-foreground/55">Note: {b.notes}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-stretch gap-2 sm:items-end">
                      {canConsumerRescheduleBooking(b.status) ? (
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <Link href={`/dashboard/bookings/${b.id}/reschedule`}>Reschedule</Link>
                        </Button>
                      ) : null}

                      {canConsumerCancelBooking(b.status) ? (
                        <form action={cancelBookingAction}>
                          <input type="hidden" name="bookingId" value={b.id} />
                          <Button type="submit" variant="outline" size="sm" className="rounded-full">
                            Cancel
                          </Button>
                        </form>
                      ) : null}

                      {canConsumerRebookBooking(b.status) ? (
                        <Button asChild size="sm" className="rounded-full">
                          <Link href={rebookHref}>Book again</Link>
                        </Button>
                      ) : null}

                      {b.status === "completed" &&
                      b.isCrmCompleted &&
                      b.crmAppointmentId &&
                      !b.hasVerifiedReview ? (
                        <LeaveReviewDialog
                          appointmentId={b.crmAppointmentId}
                          salonName={b.salonName}
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
