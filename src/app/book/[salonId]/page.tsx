import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { getSalonById } from "@/data/salons"
import { getBookings } from "@/lib/bookings/store"
import { parseServiceIds } from "@/lib/bookings/utils"
import { getSession } from "@/lib/auth/session"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { BookingForm } from "@/components/booking/booking-form"

type Props = {
  params: Promise<{ salonId: string }>
  searchParams: Promise<{ services?: string; serviceId?: string; error?: string }>
}

export const metadata: Metadata = {
  title: "Book appointment",
  robots: { index: false },
}

export default async function BookPage({ params, searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { salonId } = await params
  const { services, serviceId, error } = await searchParams
  const salon = getSalonById(salonId)
  if (!salon) notFound()

  const initialServiceIds = parseServiceIds(services ?? serviceId ?? "")

  const bookings = await getBookings()
  const unavailableSlots = bookings
    .filter((b) => b.salonId === salonId && b.status !== "cancelled")
    .map((b) => ({ date: b.date, time: b.time }))

  return (
    <>
      <Navbar />
      <main className="page-main section-y">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="section-eyebrow">Booking</p>
            <h1 className="display-section mt-3">Reserve your visit</h1>
            <p className="mt-3 text-foreground/65">
              Review your selected services, pick a date and time, and get instant confirmation in
              your dashboard.
            </p>
            {error === "slot" ? (
              <p className="mt-4 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 text-sm text-foreground/80">
                That time slot was just taken. Please choose another.
              </p>
            ) : null}
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-border/70 p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={salon.imageUrl} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div>
                <p className="font-heading font-semibold">{salon.name}</p>
                <p className="text-sm text-foreground/60">{salon.area}</p>
              </div>
            </div>
            <Link
              href={`/salons/${salon.id}`}
              className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
            >
              View salon details
            </Link>
          </div>
          <div className="rounded-3xl border border-border/70 bg-white/50 p-6 sm:p-8">
            <BookingForm
              salon={salon}
              initialServiceIds={initialServiceIds}
              unavailableSlots={unavailableSlots}
            />
          </div>
        </Container>
      </main>
    </>
  )
}
