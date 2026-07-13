import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { BookingConfirmationContent } from "@/components/booking/booking-confirmation-content"
import { ClearBookingCart } from "@/components/booking/clear-booking-cart"
import { SitePageShell } from "@/components/layout/site-page-shell"
import { getCustomerBookingById } from "@/lib/bookings/customer-bookings"
import { getSession } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Booking request sent",
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
  if (!id) redirect("/dashboard/bookings")

  const booking = await getCustomerBookingById(id)
  if (!booking) notFound()

  return (
    <>
      <ClearBookingCart />
      <SitePageShell>
        <BookingConfirmationContent booking={booking} />
      </SitePageShell>
    </>
  )
}
