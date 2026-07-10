"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { buildCartSnapshot, writeBookingCart } from "@/lib/bookings/cart"

import { BookingSummary } from "@/components/booking/booking-summary"
import { SelectedServicesList } from "@/components/booking/selected-services-list"
import { ServicePicker } from "@/components/booking/service-picker"
import {
  buildBookHref,
  resolveServices,
  toggleServiceId,
} from "@/lib/bookings/utils"
import type { SalonService } from "@/types/salon"
import { Button } from "@/components/ui/button"

type SalonServicesSectionProps = {
  services: SalonService[]
  priceFrom: number
  salonId: string
  salonName: string
  authenticated: boolean
}

export function SalonServicesSection({
  services,
  priceFrom,
  salonId,
  salonName,
  authenticated,
}: SalonServicesSectionProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (selectedIds.length === 0) {
      writeBookingCart(null)
      return
    }

    const selected = resolveServices(services, selectedIds)
    writeBookingCart(
      buildCartSnapshot(
        salonId,
        salonName,
        selected.map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          durationMin: service.durationMin,
        })),
        selectedIds,
      ),
    )
  }, [salonId, salonName, services, selectedIds])

  const selectedServices = useMemo(
    () => resolveServices(services, selectedIds),
    [services, selectedIds]
  )

  const bookHref = buildBookHref(salonId, selectedIds, authenticated)

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,340px)] lg:gap-10">
      <div>
        <ServicePicker
          services={services}
          selectedIds={selectedIds}
          onToggle={(id) => setSelectedIds((prev) => toggleServiceId(prev, id))}
          variant="list"
        />
      </div>

      <aside className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm shadow-black/[0.03] sm:p-7 lg:sticky lg:top-[5.75rem] lg:self-start">
        {selectedServices.length > 0 ? (
          <>
            <p className="section-eyebrow">Your selection</p>
            <div className="mt-2">
              <BookingSummary services={selectedServices} compact />
            </div>
            <SelectedServicesList
              className="mt-4 border-t border-border/60 pt-4"
              services={selectedServices}
              onRemove={(id) => setSelectedIds((prev) => prev.filter((serviceId) => serviceId !== id))}
            />
          </>
        ) : (
          <>
            <p className="section-eyebrow">From</p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums sm:text-4xl">
              ₹{priceFrom}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/60">
              Select one or more services to see your estimated total and duration.
            </p>
          </>
        )}
        {selectedServices.length > 0 ? (
          <Button asChild className="mt-6 w-full rounded-full">
            <Link href={bookHref}>
              {selectedServices.length > 1
                ? `Continue with ${selectedServices.length} services`
                : "Continue with this service"}
            </Link>
          </Button>
        ) : (
          <Button className="mt-6 w-full rounded-full" disabled>
            Select a service to continue
          </Button>
        )}
      </aside>
    </div>
  )
}
