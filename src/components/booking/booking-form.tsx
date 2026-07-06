"use client"

import { useEffect, useMemo, useState } from "react"

import { writeBookingCart } from "@/lib/bookings/cart"
import { PlusIcon } from "lucide-react"

import { createBookingAction } from "@/lib/bookings/actions"
import {
  formatDuration,
  resolveServices,
  toggleServiceId,
  sumServiceDuration,
} from "@/lib/bookings/utils"
import type { Salon } from "@/types/salon"
import { BookingSummary } from "@/components/booking/booking-summary"
import { ServicePicker } from "@/components/booking/service-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { formatDisplayDate } from "@/lib/date-utils"
import { cn } from "@/lib/utils"

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
  "5:30 PM",
  "7:00 PM",
]

type UnavailableSlot = { date: string; time: string }

export function BookingForm({
  salon,
  initialServiceIds = [],
  unavailableSlots = [],
}: {
  salon: Salon
  initialServiceIds?: string[]
  unavailableSlots?: UnavailableSlot[]
}) {
  const validInitial = initialServiceIds.filter((id) =>
    salon.services.some((s) => s.id === id)
  )

  const [selectedIds, setSelectedIds] = useState<string[]>(validInitial)
  const [browseOpen, setBrowseOpen] = useState(false)

  useEffect(() => {
    writeBookingCart(
      selectedIds.length > 0 ? { salonId: salon.id, serviceIds: selectedIds } : null
    )
  }, [salon.id, selectedIds])
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")

  const selectedServices = useMemo(
    () => resolveServices(salon.services, selectedIds),
    [salon.services, selectedIds]
  )

  const totalDuration = sumServiceDuration(selectedServices)

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const slotTaken = (slot: string) =>
    unavailableSlots.some((s) => s.date === date && s.time === slot)

  const canSubmit = selectedServices.length > 0 && date && time && !slotTaken(time)

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => toggleServiceId(prev, id))
  }

  return (
    <form action={createBookingAction} className="space-y-8">
      <input type="hidden" name="salonId" value={salon.id} />
      <input type="hidden" name="serviceIds" value={selectedIds.join(",")} />

      <fieldset className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <legend className="font-heading text-lg font-semibold">Your services</legend>
          {selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-sm font-medium text-foreground/55 underline-offset-2 hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </div>
        <p className="text-sm text-foreground/60">
          Review what you&apos;ve added. Remove any service you no longer need, or add more from the
          menu below.
        </p>

        {selectedServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 px-6 py-10 text-center">
            <p className="font-medium text-foreground">No services in your cart</p>
            <p className="mt-1 text-sm text-foreground/60">
              Add at least one treatment to continue booking.
            </p>
            <Button
              type="button"
              className="mt-5 rounded-full px-8"
              onClick={() => setBrowseOpen(true)}
            >
              Browse services
            </Button>
          </div>
        ) : (
          <>
            <ServicePicker
              services={selectedServices}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              variant="list"
              mode="cart"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              onClick={() => setBrowseOpen(true)}
            >
              <PlusIcon className="size-4" />
              Add another service
            </Button>
          </>
        )}

        <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
          <DialogContent className="flex max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
            <DialogHeader className="border-b border-border/60 px-6 py-5 text-left">
              <DialogTitle className="font-heading text-xl">Add services</DialogTitle>
              <DialogDescription>
                Select treatments for this visit. Tap a selected service again to remove it.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <ServicePicker
                services={salon.services}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                variant="list"
              />
            </div>
            <DialogFooter className="border-t border-border/60 px-6 py-4 sm:justify-between">
              <p className="text-sm text-foreground/55">
                {selectedServices.length > 0
                  ? `${selectedServices.length} in cart`
                  : "None selected yet"}
              </p>
              <Button type="button" className="rounded-full px-6" onClick={() => setBrowseOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <DatePicker
            id="date"
            name="date"
            required
            min={minDate}
            value={date}
            onChange={(next) => {
              setDate(next)
              setTime("")
            }}
            placeholder="dd MMM yyyy"
          />
        </div>
        <div className="space-y-2">
          <Label>Time</Label>
          {!date ? (
            <p className="text-sm text-foreground/55">Pick a date to see available slots.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => {
                const taken = slotTaken(slot)
                const active = time === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={taken}
                    onClick={() => setTime(slot)}
                    title={taken ? "Already booked" : undefined}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      taken && "cursor-not-allowed border-border/50 text-foreground/35 line-through",
                      !taken &&
                        (active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/30 hover:bg-accent")
                    )}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          )}
          <input type="hidden" name="time" value={time} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes for the salon (optional)</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Allergies, preferred stylist, or anything we should know before your visit."
          className="flex w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm shadow-xs outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
        />
      </div>

      <BookingSummary services={selectedServices} />

      {selectedServices.length > 0 && date && time ? (
        <p className="text-center text-sm text-foreground/55">
          Plan for ~{formatDuration(totalDuration)} at {salon.name} on{" "}
          {formatDisplayDate(date)} at {time}.
        </p>
      ) : null}

      <Button type="submit" className="h-12 w-full rounded-full" disabled={!canSubmit}>
        {selectedServices.length > 1
          ? `Confirm ${selectedServices.length} services`
          : "Confirm booking"}
      </Button>
    </form>
  )
}
