"use client"

import { useEffect } from "react"

import { clearBookingCart } from "@/lib/bookings/cart"

/** Clears persisted cart after a successful booking. */
export function ClearBookingCart() {
  useEffect(() => {
    clearBookingCart()
  }, [])
  return null
}
