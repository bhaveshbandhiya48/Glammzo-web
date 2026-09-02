import "server-only"

import { after } from "next/server"

import { pickStaffForSlot, uniqueServiceIds, servicesWithoutEligibleStaff, formatUnstaffedServicesMessage } from "@/lib/bookings/crm/availability"
import { validateAppointmentBusinessHours } from "@/lib/bookings/crm/business-hours"
import { fetchSalonBookingContext } from "@/lib/bookings/crm/salon-context"
import type { CreateCrmBookingInput, CreateCrmBookingResult } from "@/lib/bookings/crm/types"
import {
  addMinutesToTime,
  getSalonDateKey,
  getSalonTimeKey,
  normalizeTime,
} from "@/lib/bookings/crm/time"
import {
  normalizeCustomerPhone,
  normalizeCustomerPhoneDigits,
} from "@/lib/phone/normalize"
import { getConsumerProfile } from "@/lib/auth/consumer-profile"
import { createAdminClient } from "@/lib/supabase/admin"
import { notifySalonNewWebBooking } from "@/lib/bookings/crm/notify-salon-web-booking"
import { notifyCustomerWebBookingPending } from "@/lib/bookings/crm/notify-customer-web-booking-pending"
import { triggerCrmExpiredWebBookingsCron } from "@/lib/bookings/crm/trigger-crm-expire-cron"
import {
  fetchSalonOfferByCode,
  incrementSalonOfferRedemption,
  resolveBookingOfferDiscount,
} from "@/lib/bookings/crm/validate-salon-offer"
import { getSalonOfferEligibility } from "@/lib/bookings/salon-offer-eligibility"
import {
  isLaunchPromoCode,
  LAUNCH_CASHBACK_MIN_RUPEES,
  LAUNCH_PROMO_ACTIVE,
  LAUNCH_PROMO_CODE,
} from "@/lib/marketing/launch-promo"
import {
  getLaunchPromoEligibility,
  LAUNCH_CASHBACK_NOTE_MARKER,
} from "@/lib/marketing/launch-promo-eligibility"
import {
  buildGlammzoOfferCashbackNoteMarker,
  getGlammzoCashbackOfferByCode,
  getGlammzoOfferCashbackEligibility,
} from "@/lib/marketing/glammzo-offers"
import { normalizePromoCode } from "@/lib/salons/offer-utils"
import {
  BOOKING_ENGINE_CONFIG,
  computeManualExpiresAt,
  getAppointmentLeadMinutes,
  isAppointmentBlockedByClosures,
  isAutoConfirmMode,
  isDateBeyondMaxAdvance,
  isManualNearSlotBlocked,
  isSalonOpenAt,
  remainingConfirmationSeconds,
} from "@/lib/bookings/crm/booking-confirmation-engine"
import { resolveServicePayablePrice } from "@/lib/salons/catalog-utils"
import { calculateGstAmount } from "@/lib/salons/tax-utils"
import {
  clampPricingUnitQuantity,
  parsePricingUnit,
  pricingUnitUsesQuantity,
} from "@/lib/salons/pricing-unit"
import {
  computeWalletRedeemPaise,
  debitCustomerWallet,
  LOYALTY_DISCOUNT_CAP_PAISE,
  getCustomerLoyalty,
  getCustomerWallet,
  pickLoyaltyDiscountLine,
  redeemFreeServiceCredit,
  restoreBookingWalletLoyalty,
} from "@/lib/wallet/customer-wallet"

export async function createCrmWebBooking(
  input: CreateCrmBookingInput,
): Promise<CreateCrmBookingResult> {
  const context = await fetchSalonBookingContext(input.crmSalonId)

  if (!context) {
    return {
      success: false,
      error: "This salon is not available for online booking.",
      code: "not_ready",
    }
  }

  if (context.staffIds.length === 0) {
    return {
      success: false,
      error: "This salon is not accepting online bookings yet.",
      code: "not_ready",
    }
  }

  const customerName = input.customerName.trim()
  const customerPhone = input.customerPhone.trim()

  if (!customerName || customerPhone.length < 8) {
    return {
      success: false,
      error: "Please enter your name and a valid phone number.",
      code: "invalid",
    }
  }

  if (input.serviceIds.length === 0) {
    return {
      success: false,
      error: "Select at least one service.",
      code: "invalid",
    }
  }

  const supabase = createAdminClient()
  const uniqueIds = uniqueServiceIds(input.serviceIds)

  type ServiceRow = {
    id: string
    name: string
    duration_minutes: number
    price: string | number
    offer_price?: string | number | null
    is_active: boolean
    pricing_unit?: string | null
  }

  const SERVICE_SELECTS = [
    "id, name, duration_minutes, price, offer_price, is_active, pricing_unit",
    "id, name, duration_minutes, price, offer_price, is_active",
    "id, name, duration_minutes, price, is_active",
  ]

  let serviceRows: ServiceRow[] | null = null
  let serviceError: { message: string } | null = null

  for (const columns of SERVICE_SELECTS) {
    const result = await supabase
      .from("services")
      .select(columns)
      .eq("salon_id", input.crmSalonId)
      .in("id", uniqueIds)
      .is("deleted_at", null)

    serviceRows = (result.data ?? []) as unknown as ServiceRow[]
    serviceError = result.error
    if (!serviceError) break
  }

  if (serviceError) {
    console.error("[bookings] services fetch failed:", serviceError.message)
    return {
      success: false,
      error: "Could not load selected services. Please try again.",
      code: "invalid",
    }
  }

  const services = (serviceRows ?? []).map((service) => {
    const { price } = resolveServicePayablePrice(service.price, service.offer_price)
    return {
      id: service.id,
      name: service.name,
      duration_minutes: service.duration_minutes,
      price,
      is_active: service.is_active,
      pricing_unit: parsePricingUnit(service.pricing_unit),
      priceOptionId: null as string | null,
      priceOptionName: null as string | null,
    }
  })

  const requestedOptionIds = Object.values(input.servicePriceOptionIds ?? {}).filter(Boolean)
  if (requestedOptionIds.length > 0) {
    const { data: optionRows } = await supabase
      .from("service_price_options")
      .select("id, service_id, name, price")
      .eq("salon_id", input.crmSalonId)
      .in("id", requestedOptionIds)

    const optionById = new Map(
      ((optionRows ?? []) as Array<{
        id: string
        service_id: string
        name: string
        price: string | number
      }>).map((row) => [row.id, row]),
    )

    for (const service of services) {
      const optionId = input.servicePriceOptionIds?.[service.id]
      const option = optionId ? optionById.get(optionId) : null
      if (option && option.service_id === service.id) {
        service.price = Number.parseFloat(String(option.price)) || service.price
        service.priceOptionId = option.id
        service.priceOptionName = option.name
      }
    }
  }

  if (services.length !== uniqueIds.length) {
    return {
      success: false,
      error: "One or more selected services are no longer available.",
      code: "invalid",
    }
  }

  if (services.some((service) => !service.is_active)) {
    return {
      success: false,
      error: "One or more selected services are inactive.",
      code: "invalid",
    }
  }

  const unstaffedIds = servicesWithoutEligibleStaff(context, uniqueIds)
  if (unstaffedIds.length > 0) {
    const names = unstaffedIds
      .map((serviceId) => services.find((service) => service.id === serviceId)?.name)
      .filter((name): name is string => Boolean(name))
    return {
      success: false,
      error: formatUnstaffedServicesMessage(names),
      code: "invalid",
    }
  }

  const serviceById = new Map(services.map((service) => [service.id, service]))

  const selectedPackage = input.packageId
    ? (
        await supabase
          .from("salon_packages")
          .select(
            "id, package_price, salon_package_items(service_id, quantity, services(name, price, duration_minutes))",
          )
          .eq("id", input.packageId)
          .eq("salon_id", input.crmSalonId)
          .is("deleted_at", null)
          .maybeSingle()
      ).data
    : null

  const mappedPackage =
    selectedPackage && input.packageBooking
      ? {
          id: (selectedPackage as { id: string }).id,
          name: "",
          description: "",
          shortDescription: "",
          detailedDescription: "",
          imageUrl: "",
          packagePrice:
            Number.parseFloat(
              String((selectedPackage as { package_price: string | number }).package_price),
            ) || 0,
          comparePrice: 0,
          amountSaved: 0,
          discountPercent: 0,
          totalDurationMin: 0,
          showComparePrice: false,
          showSavings: false,
          allowOnlineBooking: true,
          servicePreviewCount: 3,
          badge: null,
          isFeatured: false,
          sortOrder: 0,
          items: (
            (selectedPackage as {
              salon_package_items?: Array<{ service_id: string; quantity: number }>
            }).salon_package_items ?? []
          ).map((item) => ({
            serviceId: item.service_id,
            serviceName: "",
            quantity: item.quantity,
          })),
        }
      : null

  const packageIncludedIds = new Set(
    mappedPackage?.items.map((item) => item.serviceId) ?? [],
  )

  function quantityForId(serviceId: string) {
    if (input.packageBooking && packageIncludedIds.has(serviceId)) return 1
    const unit = serviceById.get(serviceId)?.pricing_unit ?? null
    if (!pricingUnitUsesQuantity(unit)) return 1
    return clampPricingUnitQuantity(unit, input.serviceQuantities?.[serviceId] ?? 1)
  }

  const durationMinutes = uniqueIds.reduce(
    (total, serviceId) =>
      total + (serviceById.get(serviceId)?.duration_minutes ?? 0) * quantityForId(serviceId),
    0,
  )

  const webServices = services.map((service) => ({
    id: service.id,
    name: service.name,
    durationMin: service.duration_minutes,
    price: service.price,
    category: "",
    imageUrl: "",
    includes: [] as string[],
    pricingUnit: service.pricing_unit ?? undefined,
  }))

  const offerResult = await resolveBookingOfferDiscount({
    salonId: input.crmSalonId,
    promoCode: input.promoCode,
    services: webServices,
    selectedServiceIds: uniqueIds,
    selectedPackage: mappedPackage,
    quantities: input.serviceQuantities,
  })

  if (!offerResult.ok) {
    return {
      success: false,
      error: offerResult.error,
      code: "invalid",
    }
  }

  const appliedOffer = offerResult.discount

  if (appliedOffer) {
    const offerForEligibility = await fetchSalonOfferByCode(
      input.crmSalonId,
      appliedOffer.code,
    )
    const eligibility = await getSalonOfferEligibility({
      phone: customerPhone,
      offerId: appliedOffer.offerId,
      code: appliedOffer.code,
      salonId: input.crmSalonId,
      customerEligibility: offerForEligibility?.customerEligibility ?? "all_customers",
    })
    if (!eligibility.ok) {
      return {
        success: false,
        error: eligibility.message,
        code: "invalid",
      }
    }
  }

  const startTime = normalizeTime(input.startTime)
  const endTime = addMinutesToTime(startTime, durationMinutes)

  const today = getSalonDateKey(new Date(), context.timezone)

  if (input.appointmentDate < today) {
    return {
      success: false,
      error: "Appointments cannot be scheduled in the past.",
      code: "invalid",
    }
  }

  if (input.appointmentDate === today) {
    const nowTime = getSalonTimeKey(new Date(), context.timezone)
    if (startTime.slice(0, 5) < nowTime.slice(0, 5)) {
      return {
        success: false,
        error: "Start time cannot be in the past.",
        code: "invalid",
      }
    }
  }

  if (isDateBeyondMaxAdvance(input.appointmentDate, context.timezone)) {
    return {
      success: false,
      error: `Appointments can only be booked up to ${BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays} days in advance.`,
      code: "invalid",
    }
  }

  if (
    isAppointmentBlockedByClosures(
      input.appointmentDate,
      startTime,
      endTime,
      context.businessClosures,
    )
  ) {
    return {
      success: false,
      error: "This salon is closed for the selected date and time.",
      code: "invalid",
    }
  }

  const hoursCheck = validateAppointmentBusinessHours(
    context.businessHours,
    input.appointmentDate,
    startTime,
    endTime,
  )

  if (!hoursCheck.valid) {
    return { success: false, error: hoursCheck.error, code: "invalid" }
  }

  const staffId = pickStaffForSlot(
    context,
    uniqueIds,
    input.appointmentDate,
    startTime,
    endTime,
    input.preferredStaffId,
    { packageBooking: input.packageBooking },
  )

  if (!staffId) {
    if (input.preferredStaffId) {
      return {
        success: false,
        error:
          "That professional isn’t free at this time. Choose another time, or leave staff as “Any available”.",
        code: "slot_taken",
      }
    }

    return {
      success: false,
      error: "That time slot was just taken. Please choose another.",
      code: "slot_taken",
    }
  }

  const customerId = await resolveCustomerId(
    supabase,
    input.crmSalonId,
    customerName,
    customerPhone,
    input.customerEmail,
    input.marketingOptIn ?? true,
  )

  if (!customerId) {
    return {
      success: false,
      error: "Could not save your contact details. Please try again.",
      code: "invalid",
    }
  }

  const serviceNames = uniqueIds
    .map((serviceId) => serviceById.get(serviceId)?.name)
    .filter((name): name is string => Boolean(name))
    .join(", ")
  const noteParts = [`Web booking: ${serviceNames}`]
  if (appliedOffer) {
    noteParts.push(
      `Promo ${appliedOffer.code} applied (estimated savings ${appliedOffer.discountAmount})`,
    )
  }
  if (input.notes?.trim()) {
    noteParts.push(input.notes.trim())
  }

  const payableBeforeWallet =
    appliedOffer?.finalTotal ??
    (input.packageBooking && mappedPackage
      ? mappedPackage.packagePrice +
        uniqueIds
          .filter((serviceId) => !packageIncludedIds.has(serviceId))
          .reduce(
            (sum, serviceId) =>
              sum + (serviceById.get(serviceId)?.price ?? 0) * quantityForId(serviceId),
            0,
          )
      : uniqueIds.reduce(
          (sum, serviceId) =>
            sum + (serviceById.get(serviceId)?.price ?? 0) * quantityForId(serviceId),
          0,
        ))

  if (
    LAUNCH_PROMO_ACTIVE &&
    input.promoCode?.trim() &&
    isLaunchPromoCode(input.promoCode)
  ) {
    if (payableBeforeWallet < LAUNCH_CASHBACK_MIN_RUPEES) {
      return {
        success: false,
        error: `${LAUNCH_PROMO_CODE} needs a booking of ₹${LAUNCH_CASHBACK_MIN_RUPEES} or more.`,
        code: "invalid",
      }
    }

    const eligibility = await getLaunchPromoEligibility(customerPhone)
    if (!eligibility.ok) {
      return {
        success: false,
        error: eligibility.message,
        code: "invalid",
      }
    }
  }

  const glammzoCashbackOffer =
    input.promoCode?.trim() &&
    !(LAUNCH_PROMO_ACTIVE && isLaunchPromoCode(input.promoCode)) &&
    !appliedOffer
      ? await getGlammzoCashbackOfferByCode(input.promoCode)
      : null

  if (glammzoCashbackOffer) {
    if (
      glammzoCashbackOffer.maxClaims != null &&
      glammzoCashbackOffer.claimsCount >= glammzoCashbackOffer.maxClaims
    ) {
      return {
        success: false,
        error: `${glammzoCashbackOffer.promoCode} has reached its maximum number of users.`,
        code: "invalid",
      }
    }

    if (payableBeforeWallet < glammzoCashbackOffer.minOrderRupees) {
      return {
        success: false,
        error: `${glammzoCashbackOffer.promoCode} needs a booking of ₹${glammzoCashbackOffer.minOrderRupees} or more.`,
        code: "invalid",
      }
    }

    const eligibility = await getGlammzoOfferCashbackEligibility({
      phone: customerPhone,
      offerId: glammzoCashbackOffer.id,
      code:
        glammzoCashbackOffer.promoCode ??
        normalizePromoCode(input.promoCode ?? "") ??
        "",
    })
    if (!eligibility.ok) {
      return {
        success: false,
        error: eligibility.message,
        code: "invalid",
      }
    }
  }

  const lineServices = uniqueIds.map((serviceId) => {
    const service = serviceById.get(serviceId)
    const quantity = quantityForId(serviceId)
    return {
      id: serviceId,
      price: (service?.price ?? 0) * quantity,
      duration_minutes: (service?.duration_minutes ?? 0) * quantity,
    }
  })

  const wantsLoyalty = Boolean(input.useFreeService)
  const loyaltyPick = pickLoyaltyDiscountLine(lineServices, wantsLoyalty)
  if (wantsLoyalty && !loyaltyPick.service) {
    return {
      success: false,
      error: "Add a service to use your ₹999 loyalty credit.",
      code: "invalid",
    }
  }

  if (wantsLoyalty) {
    const loyalty = await getCustomerLoyalty(customerPhone)
    if (!loyalty || loyalty.freeServiceCredits < 1) {
      return {
        success: false,
        error: "You do not have a loyalty credit available.",
        code: "invalid",
      }
    }
  }

  const afterLoyaltyPayable = Math.max(
    0,
    Math.round((payableBeforeWallet - loyaltyPick.discountRupees) * 100) / 100,
  )

  const gstAmount = context.tax
    ? calculateGstAmount(afterLoyaltyPayable, context.tax.ratePercent)
    : 0
  const amountBeforeWallet = Math.round((afterLoyaltyPayable + gstAmount) * 100) / 100

  const wallet = await getCustomerWallet(customerPhone)
  const walletPaise = computeWalletRedeemPaise({
    payablePaise: Math.round(amountBeforeWallet * 100),
    walletBalancePaise: wallet?.balancePaise ?? 0,
    useWallet: Boolean(input.useWallet),
    requestedPaise: input.walletAmountPaise,
  })
  const walletRupees = walletPaise / 100
  const payAtSalon = Math.max(0, Math.round((amountBeforeWallet - walletRupees) * 100) / 100)

  if (loyaltyPick.service) {
    noteParts.push(
      `Loyalty credit: ₹${loyaltyPick.discountRupees.toFixed(0)} off (up to ₹${LOYALTY_DISCOUNT_CAP_PAISE / 100})`,
    )
  }
  if (gstAmount > 0 && context.tax) {
    noteParts.push(`GST (${context.tax.ratePercent}%): ₹${gstAmount.toFixed(2)}`)
  }
  if (walletPaise > 0) {
    noteParts.push(`Glammzo wallet used: ₹${walletRupees.toFixed(0)}`)
  }
  noteParts.push(`Pay at salon: ₹${payAtSalon.toFixed(0)}`)

  let internalNotes = "source:glamzzo_web"
  if (appliedOffer) {
    internalNotes += `|promo:${appliedOffer.code}|offer_id:${appliedOffer.offerId}|discount:${appliedOffer.discountAmount}`
  } else if (
    LAUNCH_PROMO_ACTIVE &&
    input.promoCode?.trim() &&
    isLaunchPromoCode(input.promoCode)
  ) {
    internalNotes += `|${LAUNCH_CASHBACK_NOTE_MARKER}${normalizePromoCode(input.promoCode)}`
  } else if (glammzoCashbackOffer) {
    internalNotes += `|${buildGlammzoOfferCashbackNoteMarker(
      glammzoCashbackOffer.id,
      glammzoCashbackOffer.promoCode ?? input.promoCode ?? "",
    )}`
  }
  if (gstAmount > 0) {
    internalNotes += `|tax_rupees:${gstAmount}`
  }
  if (walletPaise > 0) {
    internalNotes += `|wallet_paise:${walletPaise}`
  }
  if (loyaltyPick.service) {
    internalNotes += `|loyalty_service_id:${loyaltyPick.service.id}|loyalty_discount_paise:${loyaltyPick.discountPaise}`
  }
  internalNotes += `|pay_at_salon:${payAtSalon}`

  const bookedAt = new Date()
  const confirmationMode = context.webBooking.confirmationMode
  const autoConfirm = isAutoConfirmMode(confirmationMode)
  const createdDuringClosedHours = !isSalonOpenAt(
    context.businessHours,
    context.timezone,
    bookedAt,
  )

  if (!autoConfirm) {
    const leadMinutes = getAppointmentLeadMinutes(
      input.appointmentDate,
      startTime,
      context.timezone,
      bookedAt,
    )
    if (isManualNearSlotBlocked(leadMinutes)) {
      return {
        success: false,
        error: "That time slot was just taken. Please choose another.",
        code: "slot_taken",
      }
    }
  }

  const expiresAt = autoConfirm
    ? null
    : computeManualExpiresAt({
        appointmentDate: input.appointmentDate,
        startTime,
        timezone: context.timezone,
        now: bookedAt,
      })

  const appointmentStatus = autoConfirm ? "confirmed" : "pending"

  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      salon_id: input.crmSalonId,
      customer_id: customerId,
      staff_id: staffId,
      service_id: input.serviceIds[0],
      appointment_date: input.appointmentDate,
      start_time: startTime,
      end_time: endTime,
      status: appointmentStatus,
      confirmed_at: autoConfirm ? bookedAt.toISOString() : null,
      notes: noteParts.join("\n"),
      internal_notes: internalNotes,
      booking_source: "glamzzo_web",
      duration_minutes: durationMinutes,
      expires_at: expiresAt,
      response_deadline: expiresAt,
      slot_reserved: !autoConfirm,
      created_during_closed_hours: createdDuringClosedHours,
    })
    .select("id")
    .single()

  if (insertError || !appointment) {
    console.error("[bookings] CRM insert failed:", insertError?.message)

    const overlapViolation =
      insertError?.code === "23P01" ||
      insertError?.message?.toLowerCase().includes("appointments_staff_time_no_overlap")

    if (overlapViolation) {
      return {
        success: false,
        error: "That time slot was just taken. Please choose another.",
        code: "slot_taken",
      }
    }

    return {
      success: false,
      error: "Could not create your booking. Please try again.",
      code: "invalid",
    }
  }

  const appointmentId = (appointment as { id: string }).id

  const appointmentServices = uniqueIds.map((serviceId, index) => {
    const service = serviceById.get(serviceId)
    const quantity = quantityForId(serviceId)
    const unitPrice = service?.price ?? 0
    const lineTotal = unitPrice * quantity
    const isLoyaltyLine = loyaltyPick.service?.id === serviceId
    const payableLine = isLoyaltyLine
      ? Math.max(0, Math.round((lineTotal - loyaltyPick.discountRupees) * 100) / 100)
      : lineTotal
    const price =
      quantity > 0 ? Math.round((payableLine / quantity) * 100) / 100 : unitPrice
    return {
      appointment_id: appointmentId,
      service_id: serviceId,
      sort_order: index,
      price,
      duration_minutes: (service?.duration_minutes ?? 0) * quantity,
      quantity,
      price_option_id: service?.priceOptionId ?? null,
      price_option_name: service?.priceOptionName ?? null,
    }
  })

  let { error: servicesError } = await supabase
    .from("appointment_services")
    .insert(appointmentServices)

  if (
    servicesError?.message.toLowerCase().includes("price_option") ||
    servicesError?.message.toLowerCase().includes("service_price_options")
  ) {
    const withoutOptions = appointmentServices.map(
      ({ price_option_id: _id, price_option_name: _name, ...row }) => row,
    )
    ;({ error: servicesError } = await supabase
      .from("appointment_services")
      .insert(withoutOptions))
  }

  if (servicesError?.message.toLowerCase().includes("quantity")) {
    const withoutQuantity = appointmentServices.map(
      ({
        quantity: _quantity,
        price_option_id: _id,
        price_option_name: _name,
        ...row
      }) => row,
    )
    ;({ error: servicesError } = await supabase
      .from("appointment_services")
      .insert(withoutQuantity))
  }

  if (servicesError) {
    console.error("[bookings] appointment_services insert failed:", servicesError.message)
    await supabase.from("appointments").delete().eq("id", appointmentId)
    return {
      success: false,
      error: "Could not create your booking. Please try again.",
      code: "invalid",
    }
  }

  if (loyaltyPick.service) {
    const freeResult = await redeemFreeServiceCredit({
      phone: customerPhone,
      appointmentId,
      salonId: input.crmSalonId,
      valuePaise: loyaltyPick.discountPaise,
    })
    if (!freeResult.ok) {
      await supabase.from("appointments").delete().eq("id", appointmentId)
      return { success: false, error: freeResult.error, code: "invalid" }
    }
  }

  if (walletPaise > 0) {
    const debit = await debitCustomerWallet({
      phone: customerPhone,
      amountPaise: walletPaise,
      appointmentId,
      salonId: input.crmSalonId,
    })
    if (!debit.ok) {
      await restoreBookingWalletLoyalty(appointmentId)
      await supabase.from("appointments").delete().eq("id", appointmentId)
      return { success: false, error: debit.error, code: "invalid" }
    }
  }

  if (appliedOffer) {
    await incrementSalonOfferRedemption(appliedOffer.offerId)
  }

  // Notifications / WhatsApp must not delay the confirmation redirect.
  // In-app + message_logs stubs run here; real Meta WhatsApp is sent by glamzzo-crm
  // (processAutoConfirmed / pending owner notifies) via the expire cron endpoint.
  after(() =>
    Promise.all([
      notifySalonNewWebBooking({
        salonId: input.crmSalonId,
        appointmentId,
        customerId,
        customerName,
        serviceNames,
        appointmentDate: input.appointmentDate,
        startTime,
        variant: autoConfirm ? "confirmed" : "pending",
      }),
      notifyCustomerWebBookingPending({
        salonId: input.crmSalonId,
        appointmentId,
        customerId,
        customerName,
        customerPhone,
        serviceNames,
        appointmentDate: input.appointmentDate,
        startTime,
        salonName: context.salonName,
        pendingConfirmation: !autoConfirm,
        nearResponseMinutes: autoConfirm
          ? undefined
          : BOOKING_ENGINE_CONFIG.nearResponseMinutes,
        expiresAt,
      }),
      triggerCrmExpiredWebBookingsCron(),
    ]).catch((error) => {
      console.error("[bookings] salon notify failed:", error)
    }),
  )

  return {
    success: true,
    appointmentId,
    staffId,
    endTime,
    bookingMode: confirmationMode,
    appointmentStatus,
    confirmationRequired: !autoConfirm,
    confirmationDeadline: expiresAt,
    remainingConfirmationTime: remainingConfirmationSeconds(expiresAt, bookedAt),
    payAtSalonRupees: payAtSalon,
    subtotalRupees: payableBeforeWallet,
  }
}

type AdminClient = ReturnType<typeof createAdminClient>

async function resolveCustomerId(
  supabase: AdminClient,
  salonId: string,
  fullName: string,
  phone: string,
  email?: string,
  marketingOptIn = true,
) {
  const normalizedPhone = normalizeCustomerPhone(phone)
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  const profile = await getConsumerProfile(phone)

  const customerFields = {
    full_name: fullName,
    first_name: fullName.split(" ")[0] ?? fullName,
    last_name: fullName.split(" ").slice(1).join(" ") || null,
    email: email?.trim() || profile?.email?.trim() || null,
    gender: profile?.gender ?? null,
    date_of_birth: profile?.dateOfBirth ?? null,
    address: profile?.address ?? null,
    marketing_opt_in: marketingOptIn,
  }

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("salon_id", salonId)
    .eq("phone_normalized", phoneDigits)
    .is("deleted_at", null)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("customers")
      .update(customerFields)
      .eq("id", (existing as { id: string }).id)

    return (existing as { id: string }).id
  }

  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      salon_id: salonId,
      ...customerFields,
      phone: normalizedPhone,
      total_spent: 0,
      lifetime_spend: 0,
      total_visits: 0,
    })
    .select("id")
    .single()

  if (error || !created) {
    console.error("[bookings] Customer insert failed:", error?.message)
    return null
  }

  return (created as { id: string }).id
}
