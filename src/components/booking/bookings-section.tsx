"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import { CalendarOffIcon } from "lucide-react"
import { motion } from "framer-motion"

import { AppointmentCard } from "@/components/booking/appointment-card"
import { BookingsFilter } from "@/components/booking/bookings-filter"
import {
  filterBookings,
  getBookingFilterEmptyMessage,
  matchesBookingFilter,
  parseBookingFilter,
  type BookingFilter,
} from "@/lib/bookings/booking-filters"
import { Button } from "@/components/ui/button"
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

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center rounded-2xl border border-border/65 bg-card px-6 py-12 text-center shadow-sm shadow-black/[0.03]"
    >
      <div
        className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-foreground/45"
        aria-hidden
      >
        <CalendarOffIcon className="size-6" strokeWidth={1.6} />
      </div>
      <h2 className="mt-4 font-heading text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/60">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  )
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
      <EmptyState
        title="No appointments yet"
        description="Book your first appointment to get started."
        action={
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href="/explore">Explore Salons</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <BookingsFilter value={filter} onChange={setFilter} counts={counts} />

      {visibleBookings.length === 0 ? (
        <EmptyState
          title={getBookingFilterEmptyMessage(filter)}
          description={
            filter === "all"
              ? "Book your first appointment to get started."
              : "Try another filter to see more of your bookings."
          }
          action={
            filter !== "all" ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-5"
                onClick={() => setFilter("all")}
              >
                Show all appointments
              </Button>
            ) : (
              <Button asChild className="rounded-full px-5">
                <Link href="/explore">Explore Salons</Link>
              </Button>
            )
          }
        />
      ) : (
        <ul className="space-y-3.5">
          {visibleBookings.map((booking, index) => (
            <li key={booking.id}>
              <AppointmentCard
                booking={booking}
                authenticated={authenticated}
                index={index}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
