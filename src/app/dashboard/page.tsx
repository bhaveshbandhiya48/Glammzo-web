import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { getSession } from "@/lib/auth/session"
import { getBookings } from "@/lib/bookings/store"
import { formatBookingDate, formatDuration } from "@/lib/bookings/utils"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await getSession()
  const bookings = await getBookings()
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "upcoming"
  )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back${session?.name ? `, ${session.name}` : ""}`}
        subtitle="Manage appointments, explore new salons, and update your profile."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl">
          <CardContent className="px-5 py-6">
            <p className="text-sm text-foreground/60">Upcoming</p>
            <p className="mt-1 font-heading text-3xl font-semibold">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="px-5 py-6">
            <p className="text-sm text-foreground/60">Total bookings</p>
            <p className="mt-1 font-heading text-3xl font-semibold">{bookings.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl sm:col-span-1">
          <CardContent className="flex h-full flex-col justify-between px-5 py-6">
            <p className="text-sm text-foreground/60">Quick action</p>
            <Button asChild className="mt-3 rounded-full">
              <Link href="/explore">
                Find a salon
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-semibold">Next appointment</h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium underline underline-offset-4"
          >
            All bookings
          </Link>
        </div>
        {upcoming[0] ? (
          <Card className="mt-4 rounded-2xl">
            <CardContent className="px-6 py-6">
              <p className="font-heading text-lg font-semibold">{upcoming[0].salonName}</p>
              <p className="mt-1 text-sm text-foreground/65">
                {upcoming[0].services.map((s) => s.name).join(", ")} ·{" "}
                {formatBookingDate(upcoming[0].date)} at {upcoming[0].time}
              </p>
              <p className="mt-2 text-sm font-medium tabular-nums">
                ₹{upcoming[0].price} · ~{formatDuration(upcoming[0].durationMin)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4 rounded-2xl">
            <CardContent className="px-6 py-8 text-sm text-foreground/65">
              No upcoming appointments.{" "}
              <Link href="/explore" className="font-medium text-foreground underline">
                Browse salons
              </Link>{" "}
              to book your first visit.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
