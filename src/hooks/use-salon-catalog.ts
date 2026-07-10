"use client"

import { useEffect, useState } from "react"

import { salons as demoSalons } from "@/data/salons"
import type { Salon } from "@/types/salon"

export function useSalonCatalog() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch("/api/salons")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load salons"))))
      .then((data: Salon[]) => {
        if (!cancelled && Array.isArray(data)) {
          setSalons(data)
        }
      })
      .catch(() => {
        if (!cancelled && process.env.NODE_ENV === "development") {
          setSalons(demoSalons)
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { salons, loaded }
}
