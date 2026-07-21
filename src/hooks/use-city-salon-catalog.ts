"use client"

import { useMemo } from "react"

import { useSalonCatalog } from "@/hooks/use-salon-catalog"
import { useUserLocation } from "@/hooks/use-user-location"
import { filterSalonsByCityPreferExact } from "@/lib/salons/city-filter"

export function useCitySalonCatalog() {
  const catalog = useSalonCatalog()
  const { browseCity } = useUserLocation()

  const { salons, usedFallback } = useMemo(
    () => filterSalonsByCityPreferExact(catalog.salons, browseCity),
    [catalog.salons, browseCity],
  )

  return {
    ...catalog,
    salons,
    browseCity,
    cityFallback: usedFallback,
  }
}
