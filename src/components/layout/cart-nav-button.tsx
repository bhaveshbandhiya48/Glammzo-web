"use client"

import Link from "next/link"
import { ShoppingBagIcon } from "lucide-react"

import { useBookingCart } from "@/hooks/use-booking-cart"
import { cn } from "@/lib/utils"

type CartNavButtonProps = {
  className?: string
}

export function CartNavButton({ className }: CartNavButtonProps) {
  const { count, href } = useBookingCart()

  const label =
    count > 0 ? `Cart, ${count} service${count === 1 ? "" : "s"}` : "Cart, empty"

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full",
        "text-foreground/75 transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <ShoppingBagIcon className="size-5 shrink-0" strokeWidth={2} aria-hidden />
      {count > 0 ? (
        <span
          className="pointer-events-none absolute right-0 top-0 flex size-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background"
          aria-hidden
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  )
}
