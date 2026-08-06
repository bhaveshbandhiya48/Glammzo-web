"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { CalendarDaysIcon, HeartIcon, LayoutDashboardIcon, UserRoundIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon, exact: true },
  { href: "/dashboard/profile#bookings", label: "Bookings", icon: CalendarDaysIcon },
  { href: "/dashboard/favorites", label: "Favorites", icon: HeartIcon },
  { href: "/dashboard/profile#profile", label: "Profile", icon: UserRoundIcon },
]

function isNavActive(pathname: string, hash: string, item: (typeof nav)[number]) {
  if (item.exact) return pathname === item.href

  const [path, itemHash] = item.href.split("#")
  if (item.href.includes("#")) {
    if (pathname !== path && !pathname.startsWith(`${path}/`)) return false
    const current = hash.replace(/^#/, "") || "bookings"
    return current === itemHash
  }

  return pathname.startsWith(item.href)
}

export function DashboardNav() {
  const pathname = usePathname()
  const [hash, setHash] = useState("")

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash)
    syncHash()
    window.addEventListener("hashchange", syncHash)
    return () => window.removeEventListener("hashchange", syncHash)
  }, [pathname])

  return (
    <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
      {nav.map((item) => {
        const active = isNavActive(pathname, hash, item)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-foreground text-background" : "text-foreground/65 hover:bg-accent",
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
