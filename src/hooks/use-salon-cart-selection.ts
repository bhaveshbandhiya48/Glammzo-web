"use client"

import { useEffect, useRef, useState } from "react"

import {
  readCartSelectionForSalon,
  syncBookingCartForSalon,
  type BookingCartLine,
} from "@/lib/bookings/cart"
import { getExtraServiceIds } from "@/lib/salons/catalog-utils"
import { sumServiceDuration } from "@/lib/bookings/utils"

type CartService = {
  id: string
  name: string
  price: number
  durationMin: number
}

type CartPackage = {
  id: string
  name: string
  packagePrice: number
  totalDurationMin: number
  serviceIds: string[]
}

type InitialCartSelection = {
  serviceIds?: string[]
  packageId?: string | null
}

export function useSalonCartSelection(
  salonId: string,
  salonName: string,
  services: CartService[],
  initialSelection: InitialCartSelection = {},
  packages: CartPackage[] = [],
) {
  const servicesRef = useRef(services)
  servicesRef.current = services

  const packagesRef = useRef(packages)
  packagesRef.current = packages

  const initialSelectionRef = useRef(initialSelection)
  initialSelectionRef.current = initialSelection

  // Match SSR on the first client paint, localStorage is restored after mount.
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection.serviceIds ?? [])
  const [packageId, setPackageId] = useState<string | null>(initialSelection.packageId ?? null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const availableIds = servicesRef.current.map((service) => service.id)
    const initial = initialSelectionRef.current
    const fromInitial = (initial.serviceIds ?? []).filter((id) => availableIds.includes(id))
    const fromCart = readCartSelectionForSalon(salonId, availableIds)
    const nextIds = fromInitial.length > 0 ? fromInitial : fromCart.serviceIds
    const nextPackageId =
      initial.packageId != null && initial.packageId !== ""
        ? initial.packageId
        : fromCart.packageId

    setSelectedIds(nextIds)
    setPackageId(nextPackageId)
    setHydrated(true)
  }, [salonId])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    const currentServices = servicesRef.current
    const selected = currentServices.filter((service) => selectedIds.includes(service.id))
    const serviceLines: BookingCartLine[] = selected.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      durationMin: service.durationMin,
    }))

    const activePackage = packageId
      ? packagesRef.current.find((pkg) => pkg.id === packageId) ?? null
      : null

    const packageLine: BookingCartLine | null = activePackage
      ? {
          id: activePackage.id,
          name: activePackage.name,
          price: activePackage.packagePrice,
          durationMin:
            activePackage.totalDurationMin > 0
              ? activePackage.totalDurationMin
              : sumServiceDuration(selected),
        }
      : null

    const extraIds = activePackage
      ? getExtraServiceIds(selectedIds, activePackage.serviceIds)
      : []
    const extraLines: BookingCartLine[] = extraIds
      .map((id) => selected.find((service) => service.id === id))
      .filter((service): service is CartService => Boolean(service))
      .map((service) => ({
        id: service.id,
        name: service.name,
        price: service.price,
        durationMin: service.durationMin,
      }))

    syncBookingCartForSalon(
      salonId,
      salonName,
      serviceLines,
      selectedIds,
      packageId,
      packageLine,
      extraLines,
    )
  }, [hydrated, packageId, salonId, salonName, selectedIds])

  return [selectedIds, setSelectedIds, packageId, setPackageId] as const
}
