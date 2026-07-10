"use client"

import { useEffect, useMemo, useState } from "react"

import { buildCartSnapshot, writeBookingCart } from "@/lib/bookings/cart"
import { PlusIcon } from "lucide-react"

import { createBookingAction } from "@/lib/bookings/actions"
import {
  formatDuration,
  resolveServices,
  toggleServiceId,
  sumServiceDuration,
} from "@/lib/bookings/utils"
import {
  formatSlotLabel,
  findFirstAvailableDate,
  getAvailableSlotsForDate,
  isStaffEligibleForServices,
} from "@/lib/bookings/crm/availability"
import type { SalonBookingContext } from "@/lib/bookings/crm/types"
import type { Salon } from "@/types/salon"
import { BookingSummary } from "@/components/booking/booking-summary"
import { ServicePicker } from "@/components/booking/service-picker"
import { StaffPicker } from "@/components/booking/staff-picker"
import { TimeSlotPicker } from "@/components/booking/time-slot-picker"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DATE_INPUT_PLACEHOLDER, formatDisplayDate, toIsoDate } from "@/lib/date-utils"

const DEMO_TIME_SLOTS = [
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
  bookingContext = null,
  defaultCustomerName = "",
  defaultCustomerPhone = "",
  defaultCustomerEmail = "",
}: {
  salon: Salon
  initialServiceIds?: string[]
  unavailableSlots?: UnavailableSlot[]
  bookingContext?: SalonBookingContext | null
  defaultCustomerName?: string
  defaultCustomerPhone?: string
  defaultCustomerEmail?: string
}) {
  const validInitial = initialServiceIds.filter((id) =>
    salon.services.some((s) => s.id === id),
  )

  const [selectedIds, setSelectedIds] = useState<string[]>(validInitial)
  const [browseOpen, setBrowseOpen] = useState(false)

  useEffect(() => {
    if (selectedIds.length === 0) {
      writeBookingCart(null)
      return
    }

    const services = resolveServices(salon.services, selectedIds)
    writeBookingCart(
      buildCartSnapshot(
        salon.id,
        salon.name,
        services.map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          durationMin: service.durationMin,
        })),
        selectedIds,
      ),
    )
  }, [salon.id, salon.name, salon.services, selectedIds])

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [staffId, setStaffId] = useState("")
  const [notes, setNotes] = useState("")
  const [customerName, setCustomerName] = useState(defaultCustomerName)
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail)
  const [customerPhone, setCustomerPhone] = useState(defaultCustomerPhone)

  const selectedServices = useMemo(
    () => resolveServices(salon.services, selectedIds),
    [salon.services, selectedIds],
  )

  const totalDuration = sumServiceDuration(selectedServices)
  const useCrmSlots = Boolean(bookingContext)
  const preferredStaffId = staffId || null

  const minDate = useMemo(() => toIsoDate(new Date()), [])

  const bookableStaff = useMemo(() => {
    if (bookingContext) {
      if (selectedIds.length === 0) {
        return bookingContext.staffMembers
      }

      return bookingContext.staffMembers.filter((member) =>
        isStaffEligibleForServices(bookingContext, member.id, selectedIds),
      )
    }

    return salon.team.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      imageUrl: member.imageUrl,
    }))
  }, [bookingContext, salon.team, selectedIds])

  const selectedStaff = useMemo(
    () => bookableStaff.find((member) => member.id === staffId) ?? null,
    [bookableStaff, staffId],
  )

  useEffect(() => {
    if (staffId && !bookableStaff.some((member) => member.id === staffId)) {
      setStaffId("")
    }
  }, [bookableStaff, staffId])

  useEffect(() => {
    if (selectedIds.length === 0) return

    if (!useCrmSlots) {
      setDate((current) => current || toIsoDate(new Date()))
      return
    }

    if (!bookingContext) return

    const duration = totalDuration || 30

    setDate((current) => {
      if (!current) {
        return (
          findFirstAvailableDate(
            bookingContext,
            selectedIds,
            duration,
            preferredStaffId,
          ) ?? ""
        )
      }

      const currentResult = getAvailableSlotsForDate(
        bookingContext,
        current,
        duration,
        selectedIds,
        preferredStaffId,
      )

      if (!currentResult.closed && currentResult.slots.length > 0) {
        return current
      }

      return (
        findFirstAvailableDate(
          bookingContext,
          selectedIds,
          duration,
          preferredStaffId,
        ) ?? current
      )
    })
  }, [bookingContext, preferredStaffId, selectedIds, totalDuration, useCrmSlots])

  useEffect(() => {
    if (!time) return

    if (!useCrmSlots) return

    if (!bookingContext || !date || selectedIds.length === 0) {
      setTime("")
      return
    }

    const result = getAvailableSlotsForDate(
      bookingContext,
      date,
      totalDuration || 30,
      selectedIds,
      preferredStaffId,
    )

    if (!result.slots.includes(time)) {
      setTime("")
    }
  }, [bookingContext, date, preferredStaffId, selectedIds, time, totalDuration, useCrmSlots])

  const crmSlotResult = useMemo(() => {
    if (!bookingContext || !date || selectedIds.length === 0) {
      return null
    }

    return getAvailableSlotsForDate(
      bookingContext,
      date,
      totalDuration || 30,
      selectedIds,
      preferredStaffId,
    )
  }, [bookingContext, date, preferredStaffId, selectedIds, totalDuration])

  const demoSlotTaken = (slot: string) =>
    unavailableSlots.some((s) => s.date === date && s.time === slot)

  const timeSlotOptions = useMemo(() => {
    if (!date) return []

    if (useCrmSlots) {
      return (crmSlotResult?.slots ?? []).map((slot) => ({
        value: slot,
        label: formatSlotLabel(slot),
      }))
    }

    return DEMO_TIME_SLOTS.map((slot) => ({
      value: slot,
      label: slot,
      disabled: demoSlotTaken(slot),
      hint: demoSlotTaken(slot) ? "Already booked" : undefined,
    }))
  }, [crmSlotResult?.slots, date, unavailableSlots, useCrmSlots])

  const canSubmit =
    selectedServices.length > 0 &&
    date &&
    time &&
    customerName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim()) &&
    customerPhone.trim().length >= 8 &&
    (!useCrmSlots || Boolean(crmSlotResult?.slots.includes(time))) &&
    (!staffId || bookableStaff.some((member) => member.id === staffId))

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => toggleServiceId(prev, id))
  }

  return (
    <form action={createBookingAction} className="space-y-8">
      <input type="hidden" name="salonId" value={salon.id} />
      <input type="hidden" name="serviceIds" value={selectedIds.join(",")} />
      <input type="hidden" name="preferredStaffId" value={staffId} />

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
                Tap Add to include a treatment in your booking. Remove services from your cart above.
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName">Your name</Label>
          <Input
            id="customerName"
            name="customerName"
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Full name"
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            required
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="customerPhone">Mobile number</Label>
          <Input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            required
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="10-digit mobile"
            autoComplete="tel"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="space-y-6">
        {bookableStaff.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="staff">Preferred team member</Label>
            <StaffPicker
              id="staff"
              value={staffId}
              onChange={(next) => {
                setStaffId(next)
                setTime("")
              }}
              members={bookableStaff}
              disabled={selectedServices.length === 0}
              placeholder={
                selectedServices.length === 0
                  ? "Add a service first"
                  : "Select team member"
              }
            />
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <DatePicker
              id="date"
              name="date"
              required
              min={minDate}
              value={date}
              disabled={selectedServices.length === 0}
              onChange={(next) => {
                setDate(next)
                setTime("")
              }}
              placeholder={DATE_INPUT_PLACEHOLDER}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <TimeSlotPicker
              id="time"
              value={time}
              onChange={setTime}
              hasDate={Boolean(date)}
              closed={useCrmSlots ? Boolean(crmSlotResult?.closed) : false}
              closedMessage={crmSlotResult?.closedMessage}
              slots={timeSlotOptions}
              placeholder="Select time"
            />
            <input type="hidden" name="time" value={time} required />
          </div>
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
          Plan for ~{formatDuration(totalDuration)} at {salon.name}
          {selectedStaff ? ` with ${selectedStaff.name}` : ""} on {formatDisplayDate(date)} at{" "}
          {useCrmSlots ? formatSlotLabel(time) : time}.
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
