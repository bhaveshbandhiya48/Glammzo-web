"use client"

import { cn } from "@/lib/utils"
import {
  BOOKING_FILTERS,
  getBookingFilterLabel,
  type BookingFilter,
} from "@/lib/bookings/booking-filters"

type BookingsFilterProps = {
  value: BookingFilter
  onChange: (value: BookingFilter) => void
  counts: Record<BookingFilter, number>
  className?: string
}

export function BookingsFilter({ value, onChange, counts, className }: BookingsFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter appointments"
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1 shadow-sm shadow-black/[0.03]",
        className,
      )}
    >
      {BOOKING_FILTERS.map((filter) => {
        const active = value === filter
        const count = counts[filter]

        return (
          <button
            key={filter}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-foreground/65 hover:text-foreground",
            )}
          >
            {getBookingFilterLabel(filter)}
            <span
              className={cn(
                "tabular-nums text-xs",
                active ? "text-background/75" : "text-foreground/45",
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
