"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDaysIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon, exact: true },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDaysIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-foreground text-background" : "text-foreground/65 hover:bg-accent"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
