"use client"

import { useMemo } from "react"

import { useSalonCatalog } from "@/hooks/use-salon-catalog"
import { useUserLocation } from "@/hooks/use-user-location"
import { filterSalonsByCity } from "@/lib/salons/city-filter"

export function useCitySalonCatalog() {
  const catalog = useSalonCatalog()
  const { browseCity } = useUserLocation()

  const salons = useMemo(
    () => filterSalonsByCity(catalog.salons, browseCity),
    [catalog.salons, browseCity],
  )

  return {
    ...catalog,
    salons,
    browseCity,
  }
}
