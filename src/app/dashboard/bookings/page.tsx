import Link from "next/link"

import { cancelBookingAction } from "@/lib/bookings/actions"
import { getBookings } from "@/lib/bookings/store"
import { formatBookingDate, formatDuration } from "@/lib/bookings/utils"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function BookingsPage() {
  const bookings = await getBookings()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Bookings"
        title="Your appointments"
        subtitle="View upcoming visits and past history."
      />

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
          {bookings.map((b) => (
            <li key={b.id}>
              <Card className="rounded-2xl">
                <CardContent className="flex flex-wrap items-start justify-between gap-4 px-6 py-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-lg font-semibold">{b.salonName}</p>
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {b.status}
                      </Badge>
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
                    {b.notes ? (
                      <p className="mt-2 text-sm text-foreground/55">
                        Note: {b.notes}
                      </p>
                    ) : null}
                  </div>
                  {b.status === "confirmed" || b.status === "upcoming" ? (
                    <form action={cancelBookingAction}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <Button type="submit" variant="outline" size="sm" className="rounded-full">
                        Cancel
                      </Button>
                    </form>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
