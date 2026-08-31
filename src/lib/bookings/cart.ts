export const GLAMZZO_CART_KEY = "glamzzo_cart"
export const CART_UPDATED_EVENT = "glamzzo-cart-updated"

export type BookingCartLine = {
  id: string
  name: string
  price: number
  durationMin: number
  /** Per-finger / per-hand count. Always 1 for flat-priced services. */
  quantity?: number
}

export type BookingCart = {
  salonId: string
  salonName?: string
  serviceIds: string[]
  /** When set, cart represents a package booking (display as one line item). */
  packageId?: string
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

    const lines = Array.isArray(parsed.lines)
      ? parsed.lines.flatMap((line): BookingCartLine[] => {
          if (
            !line ||
            typeof line.id !== "string" ||
            typeof line.name !== "string" ||
            typeof line.price !== "number" ||
            typeof line.durationMin !== "number"
          ) {
            return []
          }
          const quantity =
            typeof line.quantity === "number" && Number.isFinite(line.quantity)
              ? Math.max(1, Math.floor(line.quantity))
              : undefined
          return [{ ...line, quantity }]
        })
      : undefined

    return {
      salonId: parsed.salonId,
      salonName: typeof parsed.salonName === "string" ? parsed.salonName : undefined,
      serviceIds,
      packageId: typeof parsed.packageId === "string" ? parsed.packageId : undefined,
      lines,
    }
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
  if (!cart) return 0
  if (cart.packageId) {
    const extraCount = (cart.lines ?? []).filter((line) => line.id !== cart.packageId).length
    return 1 + extraCount
  }
  return cart.serviceIds.length
}

/** Drop one cart line. Clearing the last item returns null. */
export function removeLineFromCart(cart: BookingCart, lineId: string): BookingCart | null {
  if (cart.packageId && lineId === cart.packageId) {
    const extraLines = (cart.lines ?? []).filter((line) => line.id !== cart.packageId)
    const extraIds = extraLines.map((line) => line.id)
    if (extraIds.length === 0) return null
    return {
      salonId: cart.salonId,
      salonName: cart.salonName,
      serviceIds: extraIds,
      lines: extraLines,
    }
  }

  const serviceIds = cart.serviceIds.filter((id) => id !== lineId)
  if (serviceIds.length === 0) return null

  const lines = (cart.lines ?? []).filter((line) => line.id !== lineId)
  return {
    ...cart,
    serviceIds,
    lines: lines.length > 0 ? lines : undefined,
  }
}

export function getCartLines(cart: BookingCart | null): BookingCartLine[] {
  if (!cart) return []

  if (cart.packageId && cart.lines?.length) {
    const packageLine = cart.lines.find((line) => line.id === cart.packageId)
    const extraLines = cart.lines.filter((line) => line.id !== cart.packageId)
    if (packageLine) {
      return [packageLine, ...extraLines]
    }
  }

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
  packageId?: string | null,
  packageLine?: BookingCartLine | null,
  extraLines: BookingCartLine[] = [],
): BookingCart {
  if (packageId && packageLine) {
    return {
      salonId,
      salonName,
      serviceIds,
      packageId,
      lines: [packageLine, ...extraLines],
    }
  }

  const byId = new Map(services.map((service) => [service.id, service]))
  const lines = serviceIds
    .map((id) => byId.get(id))
    .filter((line): line is BookingCartLine => Boolean(line))

  return {
    salonId,
    salonName,
    serviceIds,
    packageId: packageId ?? undefined,
    lines,
  }
}

export function quantitiesFromCartLines(lines: BookingCartLine[] | undefined): Record<string, number> {
  const quantities: Record<string, number> = {}
  for (const line of lines ?? []) {
    if (line.quantity != null && line.quantity > 1) {
      quantities[line.id] = line.quantity
    }
  }
  return quantities
}

export function buildCartHref(cart: BookingCart | null): string {
  if (!cart?.salonId || cart.serviceIds.length === 0) return "/explore"
  const qs = new URLSearchParams({ services: cart.serviceIds.join(",") })
  if (cart.packageId) {
    qs.set("package", cart.packageId)
  }
  const qty = Object.entries(quantitiesFromCartLines(cart.lines))
    .map(([id, quantity]) => `${id}:${quantity}`)
    .join(",")
  if (qty) qs.set("qty", qty)
  return `/book/${cart.salonId}?${qs.toString()}`
}

/** Restore persisted cart selections when reopening the same salon page. */
export function readCartSelectionForSalon(
  salonId: string,
  availableServiceIds: Iterable<string>,
): { serviceIds: string[]; packageId: string | null; quantities: Record<string, number> } {
  const cart = readBookingCart()
  if (!cart || cart.salonId !== salonId) {
    return { serviceIds: [], packageId: null, quantities: {} }
  }

  const available = new Set(availableServiceIds)
  const serviceIds = cart.serviceIds.filter((id) => available.has(id))
  const quantities: Record<string, number> = {}
  for (const [id, quantity] of Object.entries(quantitiesFromCartLines(cart.lines))) {
    if (available.has(id) && serviceIds.includes(id)) {
      quantities[id] = quantity
    }
  }
  return {
    serviceIds,
    packageId: cart.packageId ?? null,
    quantities,
  }
}

/** @deprecated Use readCartSelectionForSalon */
export function readCartServiceIdsForSalon(
  salonId: string,
  availableServiceIds: Iterable<string>,
): string[] {
  return readCartSelectionForSalon(salonId, availableServiceIds).serviceIds
}

/** Persist cart for the active salon without clearing another salon's saved cart. */
export function syncBookingCartForSalon(
  salonId: string,
  salonName: string,
  services: BookingCartLine[],
  selectedIds: string[],
  packageId?: string | null,
  packageLine?: BookingCartLine | null,
  extraLines: BookingCartLine[] = [],
): void {
  if (selectedIds.length === 0) {
    const cart = readBookingCart()
    if (cart?.salonId === salonId) {
      writeBookingCart(null)
    }
    return
  }

  writeBookingCart(
    buildCartSnapshot(
      salonId,
      salonName,
      services,
      selectedIds,
      packageId,
      packageLine,
      extraLines,
    ),
  )
}
