"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRightIcon, ShoppingBagIcon } from "lucide-react"

import { useBookingCart } from "@/hooks/use-booking-cart"
import { useSalonCatalog } from "@/hooks/use-salon-catalog"
import { getCartLines, type BookingCartLine } from "@/lib/bookings/cart"
import { formatDuration, resolveServices, sumServiceDuration } from "@/lib/bookings/utils"
import { serviceIdsMatchPackage } from "@/lib/salons/catalog-utils"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

type CartNavButtonProps = {
  className?: string
}

function toCartLines(
  services: Array<{ id: string; name: string; price: number; durationMin: number }>,
): BookingCartLine[] {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    price: service.price,
    durationMin: service.durationMin,
  }))
}

export function CartNavButton({ className }: CartNavButtonProps) {
  const { cart, count, href } = useBookingCart()
  const { salons } = useSalonCatalog()
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const catalogSalon = useMemo(
    () => (cart ? salons.find((salon) => salon.id === cart.salonId) : null),
    [cart, salons],
  )

  const matchedPackage = useMemo(() => {
    if (!cart || !catalogSalon) return null
    if (cart.packageId) {
      return catalogSalon.packages.find((pkg) => pkg.id === cart.packageId) ?? null
    }
    return (
      catalogSalon.packages.find((pkg) => serviceIdsMatchPackage(cart.serviceIds, pkg)) ?? null
    )
  }, [cart, catalogSalon])

  const lines = useMemo(() => {
    const fromCart = getCartLines(cart)
    if (fromCart.length > 0) return fromCart
    if (!cart || !catalogSalon) return []
    return toCartLines(resolveServices(catalogSalon.services, cart.serviceIds))
  }, [cart, catalogSalon])

  const salonName = cart?.salonName ?? catalogSalon?.name
  const salonArea = catalogSalon?.area
  const extraLineCount = matchedPackage
    ? lines.filter((line) => line.id !== matchedPackage.id).length
    : 0
  const totalDuration = sumServiceDuration(
    lines.map((line) => ({
      id: line.id,
      name: line.name,
      price: line.price,
      durationMin: line.durationMin,
      category: "",
      imageUrl: "",
      includes: [],
    })),
  )

  const displayCount = matchedPackage ? 1 + extraLineCount : count

  const label =
    displayCount > 0
      ? matchedPackage
        ? extraLineCount > 0
          ? `Cart, 1 package + ${extraLineCount} service${extraLineCount === 1 ? "" : "s"}`
          : "Cart, 1 package"
        : `Cart, ${displayCount} service${displayCount === 1 ? "" : "s"}`
      : "Cart, empty"

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openPreview = () => {
    clearCloseTimer()
    setOpen(true)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => clearCloseTimer(), [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className="relative"
        onMouseEnter={openPreview}
        onMouseLeave={scheduleClose}
      >
        <PopoverTrigger asChild>
          <Link
            href={href}
            aria-label={label}
            className={cn(
              "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full",
              "text-foreground/75 transition-colors",
              "hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              className,
            )}
          >
            <ShoppingBagIcon className="size-5 shrink-0" strokeWidth={2} aria-hidden />
            {displayCount > 0 ? (
              <span
                className="pointer-events-none absolute right-0 top-0 flex size-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background"
                aria-hidden
              >
                {displayCount > 9 ? "9+" : displayCount}
              </span>
            ) : null}
          </Link>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-[min(20rem,calc(100vw-2rem))] p-0"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/45">
              Your cart
            </p>
            {salonName ? (
              <p className="mt-1 truncate font-heading text-base font-semibold text-foreground">
                {salonName}
                {salonArea ? (
                  <span className="font-normal text-foreground/55"> · {salonArea}</span>
                ) : null}
              </p>
            ) : (
              <p className="mt-1 text-sm text-foreground/60">No salon selected yet</p>
            )}
          </div>

          {lines.length > 0 ? (
            <>
              <ul className="max-h-56 space-y-0 overflow-y-auto px-2 py-2">
                {lines.map((line) => (
                  <li
                    key={line.id}
                    className="flex items-start justify-between gap-3 rounded-xl px-2 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      {matchedPackage && line.id === matchedPackage.id ? (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                          Package
                        </p>
                      ) : matchedPackage ? (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                          Add-on
                        </p>
                      ) : null}
                      <span className="font-medium leading-snug text-foreground/85">
                        {line.name}
                      </span>
                    </div>
                    <span className="shrink-0 text-right text-foreground/55 tabular-nums">
                      {line.price > 0 ? `₹${line.price}` : "—"}
                      {line.durationMin > 0 ? (
                        <span className="block text-xs">{formatDuration(line.durationMin)}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border/60 px-4 py-3">
                <p className="text-sm text-foreground/60">
                  {matchedPackage
                    ? extraLineCount > 0
                      ? `1 package + ${extraLineCount} service${extraLineCount === 1 ? "" : "s"}`
                      : "1 package"
                    : `${lines.length} service${lines.length === 1 ? "" : "s"}`}
                  {totalDuration > 0 ? ` · ~${formatDuration(totalDuration)}` : null}
                </p>
                <Button asChild size="sm" className="mt-3 h-9 w-full rounded-full">
                  <Link href={href}>
                    Continue booking
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="px-4 py-5">
              <p className="text-sm text-foreground/65">No services added yet.</p>
              <Button asChild variant="outline" size="sm" className="mt-4 h-9 w-full rounded-full">
                <Link href="/explore">Browse salons</Link>
              </Button>
            </div>
          )}
        </PopoverContent>
      </div>
    </Popover>
  )
}
