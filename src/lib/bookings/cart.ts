export const GLAMZZO_CART_KEY = "glamzzo_cart"
export const CART_UPDATED_EVENT = "glamzzo-cart-updated"

export type BookingCart = {
  salonId: string
  serviceIds: string[]
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

export function buildCartHref(cart: BookingCart | null): string {
  if (!cart?.salonId || cart.serviceIds.length === 0) return "/explore"
  const qs = new URLSearchParams({ services: cart.serviceIds.join(",") })
  return `/book/${cart.salonId}?${qs.toString()}`
}
