"use client"

import { useCallback, useEffect, useState } from "react"

import {
  type BookingCart,
  CART_UPDATED_EVENT,
  buildCartHref,
  getCartItemCount,
  readBookingCart,
  writeBookingCart,
} from "@/lib/bookings/cart"

export function useBookingCart() {
  const [cart, setCart] = useState<BookingCart | null>(null)

  const refresh = useCallback(() => {
    setCart(readBookingCart())
  }, [])

  useEffect(() => {
    refresh()
    const onUpdate = () => refresh()
    window.addEventListener(CART_UPDATED_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [refresh])

  const count = getCartItemCount(cart)
  const href = buildCartHref(cart)

  const updateCart = useCallback((next: BookingCart | null) => {
    writeBookingCart(next)
    setCart(readBookingCart())
  }, [])

  return { cart, count, href, updateCart, refresh }
}
