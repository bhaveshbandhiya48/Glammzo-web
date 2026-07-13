"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import {
  getDefaultDistanceOrigin,
  resolveDistanceOriginFromStored,
  type DistanceOrigin,
} from "@/lib/explore-distance"
import { LOCATION_UPDATED_EVENT, readStoredLocation } from "@/lib/location-storage"

const ExploreDistanceOriginContext = createContext<DistanceOrigin>(getDefaultDistanceOrigin())

export function ExploreDistanceOriginProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<DistanceOrigin>(getDefaultDistanceOrigin)

  useEffect(() => {
    const sync = () => {
      setOrigin(resolveDistanceOriginFromStored(readStoredLocation()?.stored ?? null))
    }

    sync()
    window.addEventListener(LOCATION_UPDATED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return (
    <ExploreDistanceOriginContext.Provider value={origin}>
      {children}
    </ExploreDistanceOriginContext.Provider>
  )
}

export function useExploreDistanceOriginContext() {
  return useContext(ExploreDistanceOriginContext)
}
