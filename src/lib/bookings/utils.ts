import type { SalonService } from "@/types/salon"

export function parseServiceIds(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}

export function resolveServices(
  allServices: SalonService[],
  ids: string[]
): SalonService[] {
  return ids
    .map((id) => allServices.find((s) => s.id === id))
    .filter((s): s is SalonService => Boolean(s))
}

export function toggleServiceId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

export function removeOneServiceId(ids: string[], id: string): string[] {
  const index = ids.indexOf(id)
  if (index === -1) return ids
  return [...ids.slice(0, index), ...ids.slice(index + 1)]
}

export function sumServicePrice(services: Pick<SalonService, "price">[]): number {
  return services.reduce((sum, s) => sum + s.price, 0)
}

export function sumServiceDuration(services: Pick<SalonService, "durationMin">[]): number {
  return services.reduce((sum, s) => sum + s.durationMin, 0)
}

export function formatDuration(totalMin: number): string {
  if (totalMin < 60) return `${totalMin} min`
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

export function buildBookHref(
  salonId: string,
  serviceIds: string[],
  authenticated: boolean,
  packageId?: string | null,
  promoCode?: string | null,
): string {
  const params = new URLSearchParams()
  if (serviceIds.length > 0) {
    params.set("services", serviceIds.join(","))
  }
  if (packageId) {
    params.set("package", packageId)
  }
  if (promoCode?.trim()) {
    params.set("promo", promoCode.trim().toUpperCase())
  }

  const qs = params.toString()
  const base = qs ? `/book/${salonId}?${qs}` : `/book/${salonId}`
  return authenticated ? base : `/login?next=${encodeURIComponent(base)}`
}

export function formatBookingDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const PAY_AT_SALON_NOTE = /^pay at salon:\s*₹?\s*([\d,]+(?:\.\d+)?)$/i
const PAID_AT_SALON_NOTE = /^paid at salon$/i
const PAY_AT_SALON_INTERNAL = /(?:^|\|)pay_at_salon:([\d.]+)/i
const PROMO_NOTE =
  /^promo\s+(\S+)\s+applied\s*\(estimated savings\s*([\d,]+(?:\.\d+)?)\)/i
const WALLET_NOTE = /^glammzo wallet used:\s*₹?\s*([\d,]+(?:\.\d+)?)$/i
const LOYALTY_NOTE =
  /^loyalty credit:\s*₹?\s*([\d,]+(?:\.\d+)?)\s*off/i

function isPayAtSalonNoteLine(line: string) {
  const trimmed = line.trim()
  return PAY_AT_SALON_NOTE.test(trimmed) || PAID_AT_SALON_NOTE.test(trimmed)
}

function isPricingSystemNoteLine(line: string) {
  const trimmed = line.trim()
  if (!trimmed) return false
  return (
    isPayAtSalonNoteLine(trimmed) ||
    PROMO_NOTE.test(trimmed) ||
    WALLET_NOTE.test(trimmed) ||
    LOYALTY_NOTE.test(trimmed)
  )
}

function parseAmountToken(raw: string): number | null {
  const value = Number(raw.replace(/,/g, ""))
  return Number.isFinite(value) && value >= 0 ? value : null
}

/**
 * Prefer the payable amount stored at booking time (after promo / wallet / loyalty).
 * Falls back to null when the booking has no pay-at-salon metadata.
 */
export function parsePayAtSalonAmount(
  notes?: string | null,
  internalNotes?: string | null,
): number | null {
  if (internalNotes?.trim()) {
    const match = internalNotes.match(PAY_AT_SALON_INTERNAL)
    if (match?.[1]) {
      const amount = parseAmountToken(match[1])
      if (amount != null) return amount
    }
  }

  if (notes?.trim()) {
    for (const line of notes.split("\n")) {
      const match = line.trim().match(PAY_AT_SALON_NOTE)
      if (match?.[1]) {
        const amount = parseAmountToken(match[1])
        if (amount != null) return amount
      }
    }
  }

  return null
}

export type BookingPriceBreakdown = {
  /** Catalog / package total before promo, loyalty, and wallet. */
  subtotal: number
  promoCode: string | null
  promoDiscount: number
  loyaltyDiscount: number
  walletUsed: number
  /** Amount due at the salon. */
  payable: number
  hasAdjustments: boolean
}

/**
 * Rebuild a clear price breakup from service lines + booking notes written at create time.
 */
export function parseBookingPriceBreakdown(booking: {
  price: number
  notes?: string | null
  services: Array<{ price: number }>
}): BookingPriceBreakdown {
  const serviceSubtotal = booking.services.reduce((sum, service) => sum + service.price, 0)
  let promoCode: string | null = null
  let promoDiscount = 0
  let loyaltyDiscount = 0
  let walletUsed = 0

  for (const rawLine of (booking.notes ?? "").split("\n")) {
    const line = rawLine.trim()
    if (!line) continue

    const promoMatch = line.match(PROMO_NOTE)
    if (promoMatch) {
      promoCode = promoMatch[1]?.toUpperCase() ?? null
      promoDiscount = parseAmountToken(promoMatch[2] ?? "") ?? 0
      continue
    }

    const walletMatch = line.match(WALLET_NOTE)
    if (walletMatch) {
      walletUsed = parseAmountToken(walletMatch[1] ?? "") ?? 0
      continue
    }

    const loyaltyMatch = line.match(LOYALTY_NOTE)
    if (loyaltyMatch) {
      loyaltyDiscount = parseAmountToken(loyaltyMatch[1] ?? "") ?? 0
    }
  }

  const payable = parsePayAtSalonAmount(booking.notes) ?? booking.price
  const inferredSubtotal =
    serviceSubtotal > 0
      ? serviceSubtotal
      : Math.max(0, payable + promoDiscount + loyaltyDiscount + walletUsed)

  return {
    subtotal: inferredSubtotal,
    promoCode,
    promoDiscount,
    loyaltyDiscount,
    walletUsed,
    payable,
    hasAdjustments: promoDiscount > 0 || loyaltyDiscount > 0 || walletUsed > 0,
  }
}

/** Consumer-facing payable total: pay-at-salon when known, otherwise stored price. */
export function resolveBookingPayableTotal(booking: {
  price: number
  notes?: string | null
  services?: Array<{ price: number }>
}): number {
  if (booking.services) {
    return parseBookingPriceBreakdown({
      price: booking.price,
      notes: booking.notes,
      services: booking.services,
    }).payable
  }
  return parsePayAtSalonAmount(booking.notes) ?? booking.price
}

/** True when booking notes include a pay-/paid-at-salon line. */
export function hasPayAtSalonNote(notes: string | null | undefined): boolean {
  if (!notes?.trim()) return false
  return notes.split("\n").some(isPayAtSalonNoteLine)
}

/**
 * Consumer-facing booking notes with pricing system lines removed
 * (promo / wallet / loyalty / pay-at-salon are shown in the price breakup).
 */
export function formatBookingNotesForDisplay(
  notes: string | null | undefined,
): string {
  const raw = notes?.trim()
  if (!raw) return ""

  return raw
    .split("\n")
    .filter((line) => !isPricingSystemNoteLine(line))
    .join("\n")
    .trim()
}
