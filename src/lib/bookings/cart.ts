export const GLAMZZO_CART_KEY = "glamzzo_cart"
export const CART_UPDATED_EVENT = "glamzzo-cart-updated"

export type BookingCartLine = {
  id: string
  name: string
  price: number
  durationMin: number
}

export type BookingCart = {
  salonId: string
  salonName?: string
  serviceIds: string[]
  /** Snapshot for instant cart preview in the header. */
  lines?: BookingCartLine[]
}

export function readBookingCart(): BookingCart | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(GLAMZZO_CART_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<BookingCart>
    if (!parsed?.salonId || !Array.isArray(parsed.serviceIds)) return null
    const serviceIds = parsed.serviceIds.filter((id) => typeof id === "string" && id.length > 0)
    if (serviceIds.length === 0) return null
    return { salonId: parsed.salonId, serviceIds }
  } catch {
    return null
  }
}

export function writeBookingCart(cart: BookingCart | null): void {
  if (typeof window === "undefined") return
  try {
    if (!cart || cart.serviceIds.length === 0) {
      window.localStorage.removeItem(GLAMZZO_CART_KEY)
    } else {
      window.localStorage.setItem(GLAMZZO_CART_KEY, JSON.stringify(cart))
    }
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
}

export function clearBookingCart(): void {
  writeBookingCart(null)
}

export function getCartItemCount(cart: BookingCart | null): number {
  return cart?.serviceIds.length ?? 0
}

export function getCartLines(cart: BookingCart | null): BookingCartLine[] {
  if (!cart) return []
  if (!cart.lines?.length) return []

  const byId = new Map(cart.lines.map((line) => [line.id, line]))
  return cart.serviceIds
    .map((id) => byId.get(id))
    .filter((line): line is BookingCartLine => Boolean(line))
}

export function buildCartSnapshot(
  salonId: string,
  salonName: string,
  services: BookingCartLine[],
  serviceIds: string[],
): BookingCart {
  const byId = new Map(services.map((service) => [service.id, service]))
  const lines = serviceIds
    .map((id) => byId.get(id))
    .filter((line): line is BookingCartLine => Boolean(line))

  return { salonId, salonName, serviceIds, lines }
}

export function buildCartHref(cart: BookingCart | null): string {
  if (!cart?.salonId || cart.serviceIds.length === 0) return "/explore"
  const qs = new URLSearchParams({ services: cart.serviceIds.join(",") })
  return `/book/${cart.salonId}?${qs.toString()}`
}
