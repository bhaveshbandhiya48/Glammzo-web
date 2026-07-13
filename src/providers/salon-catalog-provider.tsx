"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { salons as demoSalons } from "@/data/salons"
import type { Salon } from "@/types/salon"

type SalonCatalogContextValue = {
  salons: Salon[]
  loaded: boolean
}

const SalonCatalogContext = createContext<SalonCatalogContextValue>({
  salons: [],
  loaded: false,
})

let catalogRequest: Promise<Salon[]> | null = null

function loadSalonCatalog(): Promise<Salon[]> {
  if (!catalogRequest) {
    catalogRequest = fetch("/api/salons")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Failed to load salons")),
      )
      .then((data: Salon[]) => (Array.isArray(data) ? data : []))
      .catch(() => (process.env.NODE_ENV === "development" ? demoSalons : []))
  }

  return catalogRequest
}

export function SalonCatalogProvider({ children }: { children: ReactNode }) {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadSalonCatalog().then((data) => {
      if (!cancelled) {
        setSalons(data)
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
