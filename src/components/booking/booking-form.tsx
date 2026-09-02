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
  serializeServiceQuantities,
  serializeServicePriceOptions,
} from "@/lib/bookings/utils"
import {
  formatSlotLabel,
  findFirstAvailableDate,
  getAvailableSlotsForDate,
  getTimeSlotOptionsForDate,
  hasEligibleStaffForServices,
  isStaffEligibleForServices,
  servicesWithoutEligibleStaff,
  staffedServiceIdsForBooking,
  formatUnstaffedServicesMessage,
  slotStatusHint,
} from "@/lib/bookings/crm/availability"
import { BOOKING_ENGINE_CONFIG, getMaxBookableDateKey } from "@/lib/bookings/crm/booking-confirmation-engine"
import {
  buildPackageServiceIds,
  formatInr,
  getExtraServiceIds,
  packageServiceIdsIncluded,
  removePackageServiceIds,
  resolveServiceOptionPrice,
  serviceIdsMatchPackage,
} from "@/lib/salons/catalog-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"
import type { SalonBookingContext } from "@/lib/bookings/crm/types"
import type { Salon } from "@/types/salon"
import type { ServiceGenderAudience } from "@/lib/salons/gender-audience"
import { BookingFormCard } from "@/components/booking/booking-form-card"
import { BookingFormSubmitButtons } from "@/components/booking/booking-form-submit"
import { BookingSummary } from "@/components/booking/booking-summary"
import { calculateGstAmount, resolveSalonTaxInfo } from "@/lib/salons/tax-utils"
import { computeBookingSubtotal } from "@/lib/salons/offer-utils"
import { quantityForService } from "@/lib/salons/pricing-unit"
import { PromoCodeField, type CashbackClaim } from "@/components/booking/promo-code-field"
import { WalletLoyaltyFields } from "@/components/booking/wallet-loyalty-fields"
import { computeWalletRedeemPaise, pickLoyaltyDiscountLine } from "@/lib/wallet/wallet-math"
import { ServicePicker } from "@/components/booking/service-picker"
import { StaffPicker } from "@/components/booking/staff-picker"
import { TimeSlotPicker } from "@/components/booking/time-slot-picker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}

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
  initialQuantities = {},
  initialPriceOptionIds = {},
  unavailableSlots = [],
  bookingContext = null,
  defaultCustomerName = "",
  defaultCustomerPhone = "",
  defaultCustomerEmail = "",
  initialPromoCode = "",
  walletBalanceRupees = 0,
  freeServiceCredits = 0,
  initialGenderAudience = null,
}: {
  salon: Salon
  initialServiceIds?: string[]
  initialPackageId?: string | null
  initialQuantities?: Record<string, number>
  initialPriceOptionIds?: Record<string, string>
  unavailableSlots?: UnavailableSlot[]
  bookingContext?: SalonBookingContext | null
  defaultCustomerName?: string
  defaultCustomerPhone?: string
  defaultCustomerEmail?: string
  initialPromoCode?: string
  walletBalanceRupees?: number
  freeServiceCredits?: number
  initialGenderAudience?: ServiceGenderAudience | null
}) {
  const validInitial = initialServiceIds.filter((id) =>
    salon.services.some((s) => s.id === id),
  )
  const validPackageId =
    initialPackageId &&
    salon.packages.some((pkg) => pkg.id === initialPackageId)
      ? initialPackageId
      : null

  const [
    selectedIds,
    setSelectedIds,
    packageId,
    setPackageId,
    quantities,
    setServiceQuantity,
    priceOptionIds,
    setServicePriceOption,
  ] =
    useSalonCartSelection(
    salon.id,
    salon.name,
    salon.services,
    {
      serviceIds: validInitial,
      packageId: validPackageId,
      quantities: initialQuantities,
      priceOptionIds: initialPriceOptionIds,
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
  const [customerPhone] = useState(defaultCustomerPhone)
  const [marketingOptIn, setMarketingOptIn] = useState(true)
  const [appliedOffer, setAppliedOffer] = useState<AppliedOfferDiscount | null>(null)
  const [cashbackClaim, setCashbackClaim] = useState<CashbackClaim | null>(null)
  const [useWallet, setUseWallet] = useState(walletBalanceRupees > 0)
  const [useFreeService, setUseFreeService] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [touched, setTouched] = useState({
    customerName: false,
    customerEmail: false,
    customerPhone: false,
    date: false,
    time: false,
  })

  const markTouched = (field: keyof typeof touched) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
  }

  useEffect(() => {
    setAppliedOffer(null)
    setCashbackClaim(null)
  }, [selectedIds, packageId])

  useEffect(() => {
    if (walletBalanceRupees <= 0) setUseWallet(false)
  }, [walletBalanceRupees])

  useEffect(() => {
    if (freeServiceCredits <= 0) setUseFreeService(false)
  }, [freeServiceCredits])

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
      return sumServiceDuration(selectedServices, quantities)
    }

    const packageDuration =
      selectedPackage.totalDurationMin ||
      sumServiceDuration(
        resolveServices(salon.services, buildPackageServiceIds(selectedPackage)),
      )

    return packageDuration + sumServiceDuration(extraServices, quantities)
  }, [extraServices, quantities, selectedPackage, selectedServices, salon.services])
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

  const unstaffedIds = useMemo(() => {
    if (!bookingContext || selectedIds.length === 0) return []
    return servicesWithoutEligibleStaff(bookingContext, selectedIds)
  }, [bookingContext, selectedIds])

  const staffedIds = useMemo(() => {
    if (!bookingContext) return selectedIds
    return staffedServiceIdsForBooking(bookingContext, selectedIds)
  }, [bookingContext, selectedIds])

  const unstaffedServices = useMemo(
    () => resolveServices(salon.services, unstaffedIds),
    [salon.services, unstaffedIds],
  )

  const availabilityServiceIds = staffedIds.length > 0 ? staffedIds : selectedIds
  const availabilityDuration = useMemo(() => {
    if (staffedIds.length === 0 || staffedIds.length === selectedIds.length) {
      return totalDuration
    }
    return sumServiceDuration(resolveServices(salon.services, staffedIds), quantities)
  }, [quantities, salon.services, selectedIds.length, staffedIds, totalDuration])

  const bookableStaff = useMemo(() => {
    if (bookingContext) {
      return bookingContext.staffMembers.filter((member) =>
        isStaffEligibleForServices(
          bookingContext,
          member.id,
          availabilityServiceIds,
        ),
      )
    }

    return salon.team.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      imageUrl: member.imageUrl,
    }))
  }, [availabilityServiceIds, bookingContext, salon.team])

  const multiServiceNoSingleStaff = useMemo(() => {
    if (!bookingContext || packageMode || staffedIds.length < 2) return false
    if (unstaffedIds.length > 0) return false
    return !hasEligibleStaffForServices(bookingContext, staffedIds)
  }, [bookingContext, packageMode, staffedIds, unstaffedIds.length])

  const noEligibleStaff = Boolean(
    !packageMode &&
      selectedIds.length > 0 &&
      bookingContext &&
      staffedIds.length === 0,
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

    const duration = availabilityDuration || 30

    setDate((current) => {
      if (!current) {
        return (
          findFirstAvailableDate(
            bookingContext,
            availabilityServiceIds,
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
        availabilityServiceIds,
        preferredStaffId,
        availabilityOptions,
      )

      if (!currentResult.closed && currentResult.slots.length > 0) {
        return current
      }

      return (
        findFirstAvailableDate(
          bookingContext,
          availabilityServiceIds,
          duration,
          preferredStaffId,
          BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays,
          availabilityOptions,
        ) ?? current
      )
    })
  }, [availabilityDuration, availabilityOptions, availabilityServiceIds, bookingContext, preferredStaffId, selectedIds.length, useCrmSlots])

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
      availabilityDuration || 30,
      availabilityServiceIds,
      preferredStaffId,
      availabilityOptions,
    )

    const selected = result.slots.find((slot) => slot.slot === time)
    if (!selected || selected.status !== "available") {
      setTime("")
    }
  }, [
    availabilityDuration,
    availabilityOptions,
    availabilityServiceIds,
    bookingContext,
    date,
    preferredStaffId,
    selectedIds.length,
    time,
    useCrmSlots,
  ])

  const crmSlotResult = useMemo(() => {
    if (!bookingContext || !date || selectedIds.length === 0) {
      return null
    }

    return getTimeSlotOptionsForDate(
      bookingContext,
      date,
      availabilityDuration || 30,
      availabilityServiceIds,
      preferredStaffId,
      availabilityOptions,
    )
  }, [
    availabilityDuration,
    availabilityOptions,
    availabilityServiceIds,
    bookingContext,
    date,
    preferredStaffId,
    selectedIds.length,
  ])

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

    const demoSlotTaken = (slot: string) =>
      unavailableSlots.some((s) => s.date === date && s.time === slot)

    return DEMO_TIME_SLOTS.map((slot) => ({
      value: slot,
      label: slot,
      disabled: demoSlotTaken(slot),
      hint: demoSlotTaken(slot) ? "Already booked" : undefined,
    }))
  }, [crmSlotResult?.slots, date, unavailableSlots, useCrmSlots])

  const phoneDigits = customerPhone.replace(/\D/g, "")
  const canSubmit = Boolean(
    selectedServices.length > 0 &&
      date &&
      time &&
      customerName.trim().length >= 2 &&
      EMAIL_RE.test(customerEmail.trim()) &&
      phoneDigits.length >= 10 &&
      (!useCrmSlots ||
        Boolean(
          crmSlotResult?.slots.some(
            (entry) => entry.slot === time && entry.status === "available",
          ),
        )) &&
      (!staffId || packageMode || bookableStaff.some((member) => member.id === staffId)) &&
      unstaffedIds.length === 0 &&
      !(multiServiceNoSingleStaff && !staffId),
  )

  const fieldErrors = useMemo(() => {
    const name = customerName.trim()
    const email = customerEmail.trim()
    const phone = customerPhone.trim()
    const phoneDigits = phone.replace(/\D/g, "")

    return {
      customerName:
        name.length === 0 ? "Enter your name." : name.length < 2 ? "Enter your full name." : undefined,
      customerEmail:
        email.length === 0
          ? "Enter your email."
          : EMAIL_RE.test(email)
            ? undefined
            : "Enter a valid email (e.g. you@example.com).",
      customerPhone:
        phone.length === 0
          ? "Enter your mobile number."
          : phoneDigits.length < 10
            ? "Enter a valid 10-digit mobile number."
            : undefined,
      date: date ? undefined : "Select a date.",
      time: time ? undefined : "Select a time.",
      services:
        selectedServices.length === 0
          ? "Add at least one service."
          : unstaffedIds.length > 0
            ? formatUnstaffedServicesMessage(unstaffedServices.map((service) => service.name))
            : undefined,
      staff:
        multiServiceNoSingleStaff && !staffId
          ? "Adjust services or pick a team member who can do all of them."
          : undefined,
      slot:
        useCrmSlots &&
        time &&
        !crmSlotResult?.slots.some((entry) => entry.slot === time && entry.status === "available")
          ? "That time is no longer available. Pick another slot."
          : undefined,
    }
  }, [
    crmSlotResult?.slots,
    customerEmail,
    customerName,
    customerPhone,
    date,
    multiServiceNoSingleStaff,
    selectedServices.length,
    staffId,
    time,
    unstaffedIds.length,
    unstaffedServices,
    useCrmSlots,
  ])

  const blockingReasons = useMemo(() => {
    const reasons: string[] = []
    if (fieldErrors.services) reasons.push(fieldErrors.services)
    if (fieldErrors.customerName) reasons.push(fieldErrors.customerName)
    if (fieldErrors.customerEmail) reasons.push(fieldErrors.customerEmail)
    if (fieldErrors.customerPhone) reasons.push(fieldErrors.customerPhone)
    if (fieldErrors.date) reasons.push(fieldErrors.date)
    if (fieldErrors.time) reasons.push(fieldErrors.time)
    if (fieldErrors.staff) reasons.push(fieldErrors.staff)
    if (fieldErrors.slot) reasons.push(fieldErrors.slot)
    return reasons
  }, [fieldErrors])

  const showFieldError = (field: keyof typeof touched) =>
    Boolean((showValidation || touched[field]) && fieldErrors[field])

  const scrollToFirstError = () => {
    const order = [
      fieldErrors.services ? "booking-services" : null,
      fieldErrors.customerName ? "customerName" : null,
      fieldErrors.customerEmail ? "customerEmail" : null,
      fieldErrors.customerPhone ? "customerPhone" : null,
      fieldErrors.date ? "date" : null,
      fieldErrors.time ? "time" : null,
    ].filter(Boolean) as string[]

    const targetId = order[0]
    if (!targetId) return
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const payableTotal = useMemo(
    () =>
      appliedOffer?.finalTotal ??
      computeBookingSubtotal({
        services: salon.services,
        selectedServiceIds: selectedIds,
        selectedPackage,
        quantities,
        priceOptionIds,
      }),
    [appliedOffer, priceOptionIds, quantities, salon.services, selectedIds, selectedPackage],
  )

  const loyaltyPick = useMemo(
    () =>
      pickLoyaltyDiscountLine(
        selectedServices.map((s) => ({
          id: s.id,
          price: resolveServiceOptionPrice(s, priceOptionIds[s.id]) * quantityForService(s, quantities),
        })),
        useFreeService && !selectedPackage,
      ),
    [priceOptionIds, quantities, selectedPackage, selectedServices, useFreeService],
  )

  const afterLoyaltyTotal = Math.max(0, payableTotal - loyaltyPick.discountRupees)
  const salonTax = resolveSalonTaxInfo(salon.tax)
  const gstAmount = salonTax
    ? calculateGstAmount(afterLoyaltyTotal, salonTax.ratePercent)
    : 0
  const amountBeforeWallet = Math.round((afterLoyaltyTotal + gstAmount) * 100) / 100
  const walletAppliedRupees =
    computeWalletRedeemPaise({
      payablePaise: Math.round(amountBeforeWallet * 100),
      walletBalancePaise: Math.round(walletBalanceRupees * 100),
      useWallet,
    }) / 100
  const payAtSalonRupees = Math.max(
    0,
    Math.round((amountBeforeWallet - walletAppliedRupees) * 100) / 100,
  )

  const submitLabel =
    selectedServices.length > 0
      ? `Book · pay at salon ${formatInr(payAtSalonRupees)}`
      : packageMode
        ? "Book package appointment"
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
    <form
      action={createBookingAction}
      noValidate
      className="space-y-4 pb-24 md:space-y-5 md:pb-6"
      onSubmit={(event) => {
        if (canSubmit) return
        event.preventDefault()
        setShowValidation(true)
        setTouched({
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          date: true,
          time: true,
        })
        window.setTimeout(scrollToFirstError, 50)
      }}
    >
      <input type="hidden" name="salonId" value={salon.id} />
      <input type="hidden" name="serviceIds" value={selectedIds.join(",")} />
      {serializeServiceQuantities(quantities) ? (
        <input
          type="hidden"
          name="serviceQuantities"
          value={serializeServiceQuantities(quantities)}
        />
      ) : null}
      {serializeServicePriceOptions(priceOptionIds) ? (
        <input
          type="hidden"
          name="servicePriceOptions"
          value={serializeServicePriceOptions(priceOptionIds)}
        />
      ) : null}
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
          <div
            id="booking-services"
            className={
              showValidation && fieldErrors.services
                ? "rounded-xl border border-dashed border-destructive/40 bg-destructive/[0.04] px-4 py-8 text-center"
                : "rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center"
            }
          >
            <p className="text-sm font-medium text-foreground">
              {packageMode ? "No package in your cart" : "No services selected"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {packageMode
                ? "Add a package from the salon page."
                : "Add at least one service to continue."}
            </p>
            {showValidation && fieldErrors.services ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {fieldErrors.services}
              </p>
            ) : null}
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
            quantities={quantities}
            priceOptionIds={priceOptionIds}
            genderAudience={initialGenderAudience}
            onToggle={handleToggle}
            onQuantityChange={setServiceQuantity}
            variant="list"
            mode="cart"
            unstaffedIds={unstaffedIds}
          />
            ) : null}
          </>
        ) : (
          <ServicePicker
            services={selectedServices}
            selectedIds={selectedIds}
            quantities={quantities}
            priceOptionIds={priceOptionIds}
            genderAudience={initialGenderAudience}
            onToggle={handleToggle}
            onQuantityChange={setServiceQuantity}
            variant="list"
            mode="cart"
            unstaffedIds={unstaffedIds}
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
          <DialogContent className="flex max-h-[min(92dvh,720px)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:rounded-b-none">
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
                quantities={quantities}
                priceOptionIds={priceOptionIds}
                onToggle={handleToggle}
                onQuantityChange={setServiceQuantity}
                onPriceOptionChange={setServicePriceOption}
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
              onBlur={() => markTouched("customerName")}
              placeholder="Full name"
              autoComplete="name"
              aria-invalid={showFieldError("customerName") || undefined}
              aria-describedby={showFieldError("customerName") ? "customerName-error" : undefined}
              className={
                showFieldError("customerName")
                  ? "h-10 border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                  : "h-10"
              }
            />
            <FieldError
              id="customerName-error"
              message={showFieldError("customerName") ? fieldErrors.customerName : undefined}
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
              onBlur={() => markTouched("customerEmail")}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={showFieldError("customerEmail") || undefined}
              aria-describedby={showFieldError("customerEmail") ? "customerEmail-error" : undefined}
              className={
                showFieldError("customerEmail")
                  ? "h-10 border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                  : "h-10"
              }
            />
            <FieldError
              id="customerEmail-error"
              message={showFieldError("customerEmail") ? fieldErrors.customerEmail : undefined}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="customerPhone" className="text-xs text-muted-foreground">
              Mobile number
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              readOnly
              value={customerPhone}
              placeholder="10-digit mobile"
              autoComplete="tel"
              inputMode="numeric"
              aria-invalid={showFieldError("customerPhone") || undefined}
              aria-describedby={
                showFieldError("customerPhone") ? "customerPhone-error" : "customerPhone-hint"
              }
              className={
                showFieldError("customerPhone")
                  ? "h-10 cursor-default border-destructive bg-muted/40 focus-visible:border-destructive focus-visible:ring-destructive/20"
                  : "h-10 cursor-default bg-muted/40"
              }
            />
            <p id="customerPhone-hint" className="text-xs text-muted-foreground">
              Bookings use the mobile number you signed in with.
            </p>
            <FieldError
              id="customerPhone-error"
              message={showFieldError("customerPhone") ? fieldErrors.customerPhone : undefined}
            />
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-3 sm:col-span-2">
            <Checkbox
              id="marketingOptIn"
              checked={marketingOptIn}
              onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor="marketingOptIn" className="text-sm font-medium leading-snug">
                Send me offers and updates from {salon.name} on WhatsApp
              </Label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Promotional messages only. Booking confirmations and reminders are always sent
                when you book.
              </p>
            </div>
            <input type="hidden" name="marketingOptIn" value={marketingOptIn ? "true" : "false"} />
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
              <p
                className={
                  showValidation
                    ? "text-sm leading-relaxed text-destructive"
                    : "text-xs leading-relaxed text-foreground/55"
                }
                role={showValidation ? "alert" : undefined}
              >
                {showValidation && fieldErrors.staff
                  ? fieldErrors.staff
                  : "No team member is assigned to every selected service category. Adjust your service selection to continue."}
              </p>
            ) : null}
          </div>
        ) : null}

        {unstaffedIds.length > 0 ? (
          <p className="text-sm leading-relaxed text-destructive" role="alert">
            {formatUnstaffedServicesMessage(unstaffedServices.map((service) => service.name))}
          </p>
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
              disabled={selectedServices.length === 0 || noEligibleStaff}
              onChange={(next) => {
                setDate(next)
                setTime("")
                markTouched("date")
              }}
              placeholder={DATE_INPUT_PLACEHOLDER}
            />
            <FieldError
              id="date-error"
              message={showFieldError("date") ? fieldErrors.date : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time" className="text-xs text-muted-foreground">
              Time
            </Label>
            <TimeSlotPicker
              id="time"
              value={time}
              onChange={(next) => {
                setTime(next)
                markTouched("time")
              }}
              hasDate={Boolean(date) && !noEligibleStaff}
              disabled={noEligibleStaff}
              closed={useCrmSlots ? Boolean(crmSlotResult?.closed) || noEligibleStaff : noEligibleStaff}
              closedMessage={
                noEligibleStaff
                  ? formatUnstaffedServicesMessage(
                      unstaffedServices.map((service) => service.name),
                    )
                  : crmSlotResult?.closedMessage
              }
              emptyMessage="No time slots for this day."
              slots={noEligibleStaff ? [] : timeSlotOptions}
              placeholder="Select time"
            />
            <input type="hidden" name="time" value={time} required />
            <FieldError
              id="time-error"
              message={
                showFieldError("time")
                  ? fieldErrors.time
                  : showValidation
                    ? fieldErrors.slot
                    : undefined
              }
            />
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
          serviceQuantities={quantities}
          value={appliedOffer}
          onChange={setAppliedOffer}
          onCashbackChange={setCashbackClaim}
          initialCode={initialPromoCode}
          hideLabel
        />
      </BookingFormCard>

      <BookingFormCard
        title={walletBalanceRupees > 0 || freeServiceCredits > 0 ? "Wallet & rewards" : "Rewards"}
        contentClassName="space-y-0"
      >
        <WalletLoyaltyFields
          walletBalanceRupees={walletBalanceRupees}
          freeServiceCredits={freeServiceCredits}
          useWallet={useWallet}
          useFreeService={useFreeService && !selectedPackage}
          onUseWalletChange={setUseWallet}
          onUseFreeServiceChange={setUseFreeService}
          walletAppliedRupees={walletAppliedRupees}
          freeServiceAppliedRupees={loyaltyPick.discountRupees}
          payAtSalonRupees={payAtSalonRupees}
        />
      </BookingFormCard>

      <BookingFormCard title="Payment summary" sticky contentClassName="space-y-0">
        <BookingSummary
          services={selectedServices}
          selectedPackage={selectedPackage}
          quantities={quantities}
          appliedOffer={appliedOffer}
          cashbackClaim={cashbackClaim}
          cancellationPolicy={salon.cancellationPolicy}
          tax={salonTax}
          gstAmount={gstAmount}
          totalDurationMin={totalDuration}
          walletAppliedRupees={walletAppliedRupees}
          freeServiceAppliedRupees={loyaltyPick.discountRupees}
          payAtSalonRupees={payAtSalonRupees}
          priceOptionIds={priceOptionIds}
          genderAudience={initialGenderAudience}
        />

        <BookingFormSubmitButtons
          canSubmit={canSubmit}
          submitLabel={submitLabel}
          blockingReasons={blockingReasons}
          showValidation={showValidation}
        />
      </BookingFormCard>
    </form>
  )
}
