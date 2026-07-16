"use client"

import { useMemo, useState } from "react"

import { rescheduleBookingAction } from "@/lib/bookings/actions"
import {
  findFirstAvailableDate,
  formatSlotLabel,
  getTimeSlotOptionsForDate,
  slotStatusHint,
} from "@/lib/bookings/crm/availability"
import type { SalonBookingContext } from "@/lib/bookings/crm/types"
import { DATE_INPUT_PLACEHOLDER } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { TimeSlotPicker } from "@/components/booking/time-slot-picker"

type RescheduleBookingFormProps = {
  appointmentId: string
  salonName: string
  serviceIds: string[]
  durationMin: number
  bookingContext: SalonBookingContext
  currentDate: string
}

export function RescheduleBookingForm({
  appointmentId,
  salonName,
  serviceIds,
  durationMin,
  bookingContext,
  currentDate,
}: RescheduleBookingFormProps) {
  const firstDate = useMemo(
    () =>
      findFirstAvailableDate(bookingContext, serviceIds, durationMin) ?? currentDate,
    [bookingContext, serviceIds, durationMin, currentDate],
  )

  const [date, setDate] = useState(firstDate)
  const [time, setTime] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const slotResult = useMemo(
    () => getTimeSlotOptionsForDate(bookingContext, date, durationMin, serviceIds),
    [bookingContext, date, durationMin, serviceIds],
  )

  const timeSlotOptions = useMemo(
    () =>
      (slotResult.slots ?? []).map((entry) => ({
        value: entry.slot,
        label: formatSlotLabel(entry.slot),
        disabled: entry.status !== "available",
        hint: slotStatusHint(entry.status),
      })),
    [slotResult.slots],
  )

  return (
    <form
      className="space-y-6"
      action={async (formData) => {
        setSubmitting(true)
        try {
          await rescheduleBookingAction(formData)
        } finally {
          setSubmitting(false)
        }
      }}
    >
      <input type="hidden" name="appointmentId" value={appointmentId} />

      <div className="rounded-xl border border-border/60 bg-muted/25 px-4 py-3.5 text-sm leading-relaxed text-foreground/70">
        Rescheduling your visit at <span className="font-medium text-foreground">{salonName}</span>.
        Your services stay the same. Pick a new date and time.
      </div>

      <div className="space-y-2">
        <Label htmlFor="reschedule-date">Date</Label>
        <DatePicker
          id="reschedule-date"
          name="date"
          required
          value={date}
          placeholder={DATE_INPUT_PLACEHOLDER}
          onChange={(next) => {
            setDate(next)
            setTime("")
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reschedule-time">Time</Label>
        <TimeSlotPicker
          id="reschedule-time"
          value={time}
          onChange={setTime}
          hasDate={Boolean(date)}
          closed={slotResult.closed}
          closedMessage={slotResult.closedMessage}
          emptyMessage="No time slots for this day."
          slots={timeSlotOptions}
          placeholder="Select time"
        />
        <input type="hidden" name="time" value={time} required />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full"
        disabled={!date || !time || submitting}
      >
        {submitting ? "Saving..." : "Confirm new time"}
      </Button>
    </form>
  )
}
