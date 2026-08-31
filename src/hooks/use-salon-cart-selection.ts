"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  readCartSelectionForSalon,
  syncBookingCartForSalon,
  type BookingCartLine,
} from "@/lib/bookings/cart"
import { getExtraServiceIds } from "@/lib/salons/catalog-utils"
import {
  clampPricingUnitQuantity,
  parsePricingUnit,
  pricingUnitUsesQuantity,
  quantityForService,
} from "@/lib/salons/pricing-unit"
import { sumServiceDuration } from "@/lib/bookings/utils"

type CartService = {
  id: string
  name: string
  price: number
  durationMin: number
  pricingUnit?: string | null
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
  quantities?: Record<string, number>
}

function pruneQuantities(
  serviceIds: string[],
  services: CartService[],
  quantities: Record<string, number>,
) {
  const selected = new Set(serviceIds)
  const byId = new Map(services.map((service) => [service.id, service]))
  const next: Record<string, number> = {}
  for (const id of Object.keys(quantities)) {
    if (!selected.has(id)) continue
    const service = byId.get(id)
    const unit = parsePricingUnit(service?.pricingUnit)
    if (!pricingUnitUsesQuantity(unit)) continue
    next[id] = clampPricingUnitQuantity(unit, quantities[id] ?? 1)
  }
  return next
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
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => pruneQuantities(initialSelection.serviceIds ?? [], services, initialSelection.quantities ?? {}),
  )
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
    const mergedQuantities = {
      ...fromCart.quantities,
      ...(initial.quantities ?? {}),
    }

    setSelectedIds(nextIds)
    setPackageId(nextPackageId)
    setQuantities(pruneQuantities(nextIds, servicesRef.current, mergedQuantities))
    setHydrated(true)
  }, [salonId])

  useEffect(() => {
    setQuantities((prev) => {
      const next = pruneQuantities(selectedIds, servicesRef.current, prev)
      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(next)
      if (
        prevKeys.length === nextKeys.length &&
        nextKeys.every((id) => prev[id] === next[id])
      ) {
        return prev
      }
      return next
    })
  }, [selectedIds])

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
      quantity: quantityForService(service, quantities),
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
              : sumServiceDuration(selected, quantities),
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
        quantity: quantityForService(service, quantities),
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
  }, [hydrated, packageId, quantities, salonId, salonName, selectedIds])

  const setServiceQuantity = useCallback((serviceId: string, quantity: number) => {
    const service = servicesRef.current.find((entry) => entry.id === serviceId)
    const unit = parsePricingUnit(service?.pricingUnit)
    if (!pricingUnitUsesQuantity(unit)) {
      return
    }
    if (quantity < 1) {
      setSelectedIds((prev) => prev.filter((id) => id !== serviceId))
      setQuantities((prev) => {
        const next = { ...prev }
        delete next[serviceId]
        return next
      })
      return
    }

    const clamped = clampPricingUnitQuantity(unit, quantity)
    setSelectedIds((prev) => (prev.includes(serviceId) ? prev : [...prev, serviceId]))
    setQuantities((prev) => ({ ...prev, [serviceId]: clamped }))
  }, [])

  return [selectedIds, setSelectedIds, packageId, setPackageId, quantities, setServiceQuantity] as const
}
