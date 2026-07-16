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
        "inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-border/70 bg-card/90 p-1 shadow-sm shadow-black/[0.03]",
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
              "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-foreground/60 hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {getBookingFilterLabel(filter)}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums transition-colors duration-200",
                active ? "bg-background/15 text-background/85" : "bg-muted text-foreground/45",
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
