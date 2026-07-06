import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CalendarCheckIcon } from "lucide-react"

import { getBookingById } from "@/lib/bookings/store"
import { formatBookingDate, formatDuration } from "@/lib/bookings/utils"
import { getSession } from "@/lib/auth/session"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { ClearBookingCart } from "@/components/booking/clear-booking-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false },
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { id } = await searchParams
  if (!id) redirect("/dashboard")

  const booking = await getBookingById(id)
  if (!booking) notFound()

  return (
    <>
      <Navbar />
      <ClearBookingCart />
      <main className="page-main section-y">
        <Container className="max-w-lg">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CalendarCheckIcon className="size-7" />
          </div>
          <h1 className="display-section mt-6">You&apos;re booked</h1>
          <p className="mt-3 text-foreground/65">
            Your appointment is confirmed. We&apos;ve saved the details to your account.
          </p>

          <Card className="mt-8 rounded-3xl">
            <CardContent className="space-y-4 px-6 py-8">
              <div>
                <p className="text-sm text-foreground/60">Salon</p>
                <p className="font-heading text-lg font-semibold">{booking.salonName}</p>
                <p className="text-sm text-foreground/60">{booking.salonArea}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">
                  Service{booking.services.length === 1 ? "" : "s"}
                </p>
                <ul className="mt-2 space-y-2">
                  {booking.services.map((svc) => (
                    <li key={svc.id} className="flex justify-between gap-3 text-sm">
                      <span className="font-medium">{svc.name}</span>
                      <span className="shrink-0 text-foreground/60 tabular-nums">
                        ₹{svc.price} · {svc.durationMin} min
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground/60">Date</p>
                  <p className="font-medium">{formatBookingDate(booking.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Time</p>
                  <p className="font-medium">{booking.time}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Visit length</p>
                <p className="font-medium">~{formatDuration(booking.durationMin)}</p>
              </div>
              {booking.notes ? (
                <div>
                  <p className="text-sm text-foreground/60">Your notes</p>
                  <p className="text-sm leading-relaxed text-foreground/75">{booking.notes}</p>
                </div>
              ) : null}
              <div>
                <p className="text-sm text-foreground/60">Total</p>
                <p className="font-heading text-xl font-semibold tabular-nums">₹{booking.price}</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/bookings">View bookings</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/explore">Book another</Link>
            </Button>
          </div>
        </Container>
      </main>
    </>
  )
}
