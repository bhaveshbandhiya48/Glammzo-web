"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import type { Salon } from "@/types/salon"

type SalonCatalogContextValue = {
  salons: Salon[]
  loaded: boolean
}

const SalonCatalogContext = createContext<SalonCatalogContextValue>({
  salons: [],
  loaded: false,
})

type SalonCatalogProviderProps = {
  children: ReactNode
  initialSalons?: Salon[]
}

export function SalonCatalogProvider({
  children,
  initialSalons = [],
}: SalonCatalogProviderProps) {
  const [salons, setSalons] = useState<Salon[]>(initialSalons)
  const [loaded, setLoaded] = useState(initialSalons.length > 0)

  useEffect(() => {
    let cancelled = false

    fetch("/api/salons")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Failed to load salons")),
      )
      .then((data: Salon[]) => {
        if (!cancelled && Array.isArray(data)) {
          setSalons(data)
        }
      })
      .catch((error) => {
        console.warn("[salon-catalog] Failed to refresh catalog:", error)
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SalonCatalogContext.Provider value={{ salons, loaded }}>
      {children}
    </SalonCatalogContext.Provider>
  )
}

export function useSalonCatalogContext() {
  return useContext(SalonCatalogContext)
}
