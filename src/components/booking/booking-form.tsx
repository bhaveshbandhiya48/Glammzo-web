"use client"

import { useEffect, useMemo, useState } from "react"

import { useSalonCartSelection } from "@/hooks/use-salon-cart-selection"
import { PlusIcon } from "lucide-react"

import { PackageCartItem } from "@/components/booking/package-cart-item"
import { createBookingAction } from "@/lib/bookings/actions"
import {
  resolveServices,
  toggleServiceId,
  sumServiceDuration,
} from "@/lib/bookings/utils"
import {
  formatSlotLabel,
  findFirstAvailableDate,
  getAvailableSlotsForDate,
  getTimeSlotOptionsForDate,
  hasEligibleStaffForServices,
  isStaffEligibleForServices,
  slotStatusHint,
} from "@/lib/bookings/crm/availability"
import { BOOKING_ENGINE_CONFIG, getMaxBookableDateKey } from "@/lib/bookings/crm/booking-confirmation-engine"
import {
  buildPackageServiceIds,
  getExtraServiceIds,
  packageServiceIdsIncluded,
  removePackageServiceIds,
  serviceIdsMatchPackage,
} from "@/lib/salons/catalog-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"
import type { SalonBookingContext } from "@/lib/bookings/crm/types"
import type { Salon } from "@/types/salon"
import { BookingFormCard } from "@/components/booking/booking-form-card"
import { BookingFormSubmitButtons } from "@/components/booking/booking-form-submit"
import { BookingSummary, getBookingPayableTotal } from "@/components/booking/booking-summary"
import { PromoCodeField } from "@/components/booking/promo-code-field"
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
import { DATE_INPUT_PLACEHOLDER, toIsoDate } from "@/lib/date-utils"
import { formatInr } from "@/lib/salons/catalog-utils"

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
  initialPackageId = null,
  unavailableSlots = [],
  bookingContext = null,
  defaultCustomerName = "",
  defaultCustomerPhone = "",
  defaultCustomerEmail = "",
  initialPromoCode = "",
}: {
  salon: Salon
  initialServiceIds?: string[]
  initialPackageId?: string | null
  unavailableSlots?: UnavailableSlot[]
  bookingContext?: SalonBookingContext | null
  defaultCustomerName?: string
  defaultCustomerPhone?: string
  defaultCustomerEmail?: string
  initialPromoCode?: string
}) {
  const validInitial = initialServiceIds.filter((id) =>
    salon.services.some((s) => s.id === id),
  )
  const validPackageId =
    initialPackageId &&
    salon.packages.some((pkg) => pkg.id === initialPackageId)
      ? initialPackageId
      : null

  const [selectedIds, setSelectedIds, packageId, setPackageId] = useSalonCartSelection(
    salon.id,
    salon.name,
    salon.services,
    {
      serviceIds: validInitial,
      packageId: validPackageId,
    },
    salon.packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      packagePrice: pkg.packagePrice,
      totalDurationMin: pkg.totalDurationMin,
      serviceIds: buildPackageServiceIds(pkg),
    })),
  )
  const [browseOpen, setBrowseOpen] = useState(false)

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [staffId, setStaffId] = useState("")
  const [notes, setNotes] = useState("")
  const [customerName, setCustomerName] = useState(defaultCustomerName)
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail)
  const [customerPhone, setCustomerPhone] = useState(defaultCustomerPhone)
  const [appliedOffer, setAppliedOffer] = useState<AppliedOfferDiscount | null>(null)

  useEffect(() => {
    setAppliedOffer(null)
  }, [selectedIds, packageId])

  const selectedServices = useMemo(
    () => resolveServices(salon.services, selectedIds),
    [salon.services, selectedIds],
  )

  const selectedPackage = useMemo(() => {
    if (packageId) {
      return salon.packages.find((pkg) => pkg.id === packageId) ?? null
    }
    return salon.packages.find((pkg) => serviceIdsMatchPackage(selectedIds, pkg)) ?? null
  }, [packageId, salon.packages, selectedIds])

  const extraServices = useMemo(() => {
    if (!selectedPackage) return selectedServices
    const extraIds = getExtraServiceIds(selectedIds, buildPackageServiceIds(selectedPackage))
    return resolveServices(salon.services, extraIds)
  }, [selectedPackage, selectedIds, selectedServices, salon.services])

  const packageMode = Boolean(selectedPackage)
  const totalDuration = useMemo(() => {
    if (!selectedPackage) {
      return sumServiceDuration(selectedServices)
    }

    const packageDuration =
      selectedPackage.totalDurationMin ||
      sumServiceDuration(
        resolveServices(salon.services, buildPackageServiceIds(selectedPackage)),
      )

    return packageDuration + sumServiceDuration(extraServices)
  }, [extraServices, selectedPackage, selectedServices, salon.services])
  const useCrmSlots = Boolean(bookingContext)
  const preferredStaffId = packageMode ? null : staffId || null
  const availabilityOptions = useMemo(
    () => ({ packageBooking: packageMode }),
    [packageMode],
  )

  useEffect(() => {
    if (packageMode) {
      setStaffId("")
    }
  }, [packageMode])

  useEffect(() => {
    if (!packageId) return
    const pkg = salon.packages.find((entry) => entry.id === packageId)
    if (!pkg) {
      setPackageId(null)
      return
    }
    if (!packageServiceIdsIncluded(selectedIds, buildPackageServiceIds(pkg))) {
      setPackageId(null)
    }
  }, [packageId, salon.packages, selectedIds, setPackageId])

  const minDate = useMemo(() => toIsoDate(new Date()), [])
  const maxDate = useMemo(
    () =>
      bookingContext
        ? getMaxBookableDateKey(bookingContext.timezone)
        : toIsoDate(new Date(Date.now() + BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays * 86_400_000)),
    [bookingContext],
  )

  const bookableStaff = useMemo(() => {
    if (bookingContext) {
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

  const multiServiceNoSingleStaff = useMemo(() => {
    if (!bookingContext || packageMode || selectedIds.length < 2) return false
    return !hasEligibleStaffForServices(bookingContext, selectedIds)
  }, [bookingContext, packageMode, selectedIds])

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
            BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays,
            availabilityOptions,
          ) ?? ""
        )
      }

      const currentResult = getAvailableSlotsForDate(
        bookingContext,
        current,
        duration,
        selectedIds,
        preferredStaffId,
        availabilityOptions,
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
          BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays,
          availabilityOptions,
        ) ?? current
      )
    })
  }, [availabilityOptions, bookingContext, preferredStaffId, selectedIds, totalDuration, useCrmSlots])

  useEffect(() => {
    if (!time) return

    if (!useCrmSlots) return

    if (!bookingContext || !date || selectedIds.length === 0) {
      setTime("")
      return
    }

    const result = getTimeSlotOptionsForDate(
      bookingContext,
      date,
      totalDuration || 30,
      selectedIds,
      preferredStaffId,
      availabilityOptions,
    )

    const selected = result.slots.find((slot) => slot.slot === time)
    if (!selected || selected.status !== "available") {
      setTime("")
    }
  }, [
    availabilityOptions,
    bookingContext,
    date,
    preferredStaffId,
    selectedIds,
    time,
    totalDuration,
    useCrmSlots,
  ])

  const crmSlotResult = useMemo(() => {
    if (!bookingContext || !date || selectedIds.length === 0) {
      return null
    }

    return getTimeSlotOptionsForDate(
      bookingContext,
      date,
      totalDuration || 30,
      selectedIds,
      preferredStaffId,
      availabilityOptions,
    )
  }, [availabilityOptions, bookingContext, date, preferredStaffId, selectedIds, totalDuration])

  const demoSlotTaken = (slot: string) =>
    unavailableSlots.some((s) => s.date === date && s.time === slot)

  const timeSlotOptions = useMemo(() => {
    if (!date) return []

    if (useCrmSlots) {
      return (crmSlotResult?.slots ?? []).map((entry) => ({
        value: entry.slot,
        label: formatSlotLabel(entry.slot),
        disabled: entry.status !== "available",
        hint: slotStatusHint(entry.status),
      }))
    }

    return DEMO_TIME_SLOTS.map((slot) => ({
      value: slot,
      label: slot,
      disabled: demoSlotTaken(slot),
      hint: demoSlotTaken(slot) ? "Already booked" : undefined,
    }))
  }, [crmSlotResult?.slots, date, unavailableSlots, useCrmSlots])

  const canSubmit = Boolean(
    selectedServices.length > 0 &&
      date &&
      time &&
      customerName.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim()) &&
      customerPhone.trim().length >= 8 &&
      (!useCrmSlots ||
        Boolean(
          crmSlotResult?.slots.some(
            (entry) => entry.slot === time && entry.status === "available",
          ),
        )) &&
      (!staffId || packageMode || bookableStaff.some((member) => member.id === staffId)),
  )

  const payableTotal = useMemo(
    () =>
      getBookingPayableTotal({
        services: selectedServices,
        selectedPackage,
        appliedOffer,
      }),
    [appliedOffer, selectedPackage, selectedServices],
  )

  const submitLabel =
    payableTotal > 0
      ? `Book appointment · ${formatInr(payableTotal)}`
      : packageMode
        ? "Book package appointment"
        : selectedServices.length > 1
          ? `Book ${selectedServices.length} services`
          : "Book appointment"

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => toggleServiceId(prev, id))
  }

  function handleClearPackage() {
    if (!selectedPackage) {
      setPackageId(null)
      setSelectedIds([])
      return
    }

    setSelectedIds(removePackageServiceIds(selectedIds, buildPackageServiceIds(selectedPackage)))
    setPackageId(null)
  }

  return (
    <form action={createBookingAction} className="space-y-4 pb-24 md:space-y-5 md:pb-6">
      <input type="hidden" name="salonId" value={salon.id} />
      <input type="hidden" name="serviceIds" value={selectedIds.join(",")} />
      {selectedPackage ? <input type="hidden" name="packageId" value={selectedPackage.id} /> : null}
      {!packageMode ? <input type="hidden" name="preferredStaffId" value={staffId} /> : null}

      <BookingFormCard
        title={packageMode ? "Your package" : "Services"}
        description={
          packageMode
            ? "Review your package or add extra services."
            : "What you're booking today."
        }
        action={
          selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={handleClearPackage}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          ) : null
        }
        contentClassName="space-y-3"
      >
        {selectedServices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              {packageMode ? "No package in your cart" : "No services selected"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {packageMode
                ? "Add a package from the salon page."
                : "Add at least one service to continue."}
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4 px-6"
              onClick={() => setBrowseOpen(true)}
            >
              {packageMode ? "Browse packages" : "Browse services"}
            </Button>
          </div>
        ) : packageMode && selectedPackage ? (
          <>
            <PackageCartItem
              pkg={selectedPackage}
              services={salon.services}
              onRemove={handleClearPackage}
            />
            {extraServices.length > 0 ? (
              <ServicePicker
                services={extraServices}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                variant="list"
                mode="cart"
              />
            ) : null}
          </>
        ) : (
          <ServicePicker
            services={selectedServices}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            variant="list"
            mode="cart"
          />
        )}

        {selectedServices.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setBrowseOpen(true)}
          >
            <PlusIcon className="size-4" />
            Add another service
          </Button>
        ) : null}

        <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
          <DialogContent className="flex max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
            <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
              <DialogTitle className="font-heading text-lg">Add services</DialogTitle>
              <DialogDescription className="text-sm">
                Tap Add to include a treatment in your booking.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
              <ServicePicker
                services={salon.services}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                variant="list"
              />
            </div>
            <DialogFooter className="border-t border-border/60 px-5 py-3 sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {selectedServices.length > 0
                  ? `${selectedServices.length} in cart`
                  : "None selected yet"}
              </p>
              <Button type="button" size="sm" className="px-5" onClick={() => setBrowseOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BookingFormCard>

      <BookingFormCard
        title="Customer information"
        description="We'll send your confirmation here."
        contentClassName="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="customerName" className="text-xs text-muted-foreground">
              Your name
            </Label>
            <Input
              id="customerName"
              name="customerName"
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Full name"
              autoComplete="name"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerEmail" className="text-xs text-muted-foreground">
              Email
            </Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              required
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="customerPhone" className="text-xs text-muted-foreground">
              Mobile number
            </Label>
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
              className="h-10"
            />
          </div>
        </div>
      </BookingFormCard>

      <BookingFormCard
        title="Appointment"
        description="Pick a date and time that works for you."
        contentClassName="space-y-3"
      >
        {bookableStaff.length > 0 && !packageMode ? (
          <div className="space-y-1.5">
            <Label htmlFor="staff" className="text-xs text-muted-foreground">
              Preferred team member{" "}
              <span className="font-normal text-foreground/45">(optional)</span>
            </Label>
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
                  : "Any available professional"
              }
            />
            {multiServiceNoSingleStaff && !staffId ? (
              <p className="text-xs leading-relaxed text-foreground/55">
                No team member is assigned to every selected service category. Adjust your service
                selection to continue.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs text-muted-foreground">
              Date
            </Label>
            <DatePicker
              id="date"
              name="date"
              required
              min={minDate}
              max={maxDate}
              value={date}
              disabled={selectedServices.length === 0}
              onChange={(next) => {
                setDate(next)
                setTime("")
              }}
              placeholder={DATE_INPUT_PLACEHOLDER}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time" className="text-xs text-muted-foreground">
              Time
            </Label>
            <TimeSlotPicker
              id="time"
              value={time}
              onChange={setTime}
              hasDate={Boolean(date)}
              closed={useCrmSlots ? Boolean(crmSlotResult?.closed) : false}
              closedMessage={crmSlotResult?.closedMessage}
              emptyMessage="No time slots for this day."
              slots={timeSlotOptions}
              placeholder="Select time"
            />
            <input type="hidden" name="time" value={time} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-xs text-muted-foreground">
            Notes (optional)
          </Label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, preferred stylist, or anything the salon should know."
            className="max-h-20 min-h-[4.5rem] w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
          />
        </div>
      </BookingFormCard>

      <BookingFormCard title="Promo code" contentClassName="space-y-0">
        <PromoCodeField
          salonId={salon.id}
          serviceIds={selectedIds}
          packageId={packageId}
          value={appliedOffer}
          onChange={setAppliedOffer}
          initialCode={initialPromoCode}
          hideLabel
        />
      </BookingFormCard>

      <BookingFormCard title="Payment summary" sticky contentClassName="space-y-0">
        <BookingSummary
          services={selectedServices}
          selectedPackage={selectedPackage}
          appliedOffer={appliedOffer}
          cancellationPolicy={salon.cancellationPolicy}
          totalDurationMin={totalDuration}
        />

        <BookingFormSubmitButtons canSubmit={canSubmit} submitLabel={submitLabel} />
      </BookingFormCard>
    </form>
  )
}
