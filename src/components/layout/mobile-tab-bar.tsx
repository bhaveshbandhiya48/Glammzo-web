"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CalendarDaysIcon,
  CompassIcon,
  HomeIcon,
  UserRoundIcon,
} from "lucide-react"

import { useSessionStatus } from "@/hooks/use-session-status"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "home", label: "Home", href: "/", icon: HomeIcon },
  { id: "explore", label: "Explore", href: "/explore", icon: CompassIcon },
  {
    id: "bookings",
    label: "Bookings",
    href: "/dashboard/profile#bookings",
    icon: CalendarDaysIcon,
    requiresAuth: true,
  },
  {
    id: "account",
    label: "Account",
    href: "/dashboard/profile#wallet",
    icon: UserRoundIcon,
    requiresAuth: true,
  },
] as const

function shouldHideTabBar(pathname: string) {
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return true
  if (pathname.startsWith("/forgot-password") || pathname.startsWith("/partner-signup")) {
    return true
  }
  if (pathname.startsWith("/for-salons/start") || pathname.startsWith("/for-salons/welcome")) {
    return true
  }
  // Sticky booking CTAs own the bottom edge on these flows.
  if (pathname.startsWith("/salons/") || pathname.startsWith("/book")) return true
  return false
}

function splitHref(href: string) {
  const [path, hash] = href.split("#")
  return { path, hash: hash ?? "" }
}

function isTabActive(pathname: string, hash: string, href: string) {
  if (href === "/") return pathname === "/"

  const target = splitHref(href)
  const pathMatches =
    pathname === target.path || pathname.startsWith(`${target.path}/`)

  if (!pathMatches) return false
  if (!target.hash) return true

  // On profile, Bookings vs Account are distinguished by hash.
  if (target.path === "/dashboard/profile") {
    const current = hash.replace(/^#/, "") || "bookings"
    return current === target.hash
  }

  return true
}

/**
 * Native-style bottom tab bar for Glammzo-web mobile (< md).
 * Desktop is unchanged.
 */
export function MobileTabBar() {
  const pathname = usePathname()
  const { authenticated } = useSessionStatus()
  const hidden = shouldHideTabBar(pathname)
  const [hash, setHash] = useState("")

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash)
    syncHash()
    window.addEventListener("hashchange", syncHash)
    return () => window.removeEventListener("hashchange", syncHash)
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement
    if (hidden) {
      root.classList.remove("has-mobile-tabs")
      return
    }
    root.classList.add("has-mobile-tabs")
    return () => {
      root.classList.remove("has-mobile-tabs")
    }
  }, [hidden])

  if (hidden) return null

  return (
    <nav
      aria-label="App"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/92 backdrop-blur-xl md:hidden",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="mx-auto flex h-[3.65rem] max-w-lg items-stretch justify-between px-2">
        {TABS.map((tab) => {
          const href =
            "requiresAuth" in tab &&
            tab.requiresAuth &&
            authenticated === false
              ? `/login?next=${encodeURIComponent(tab.href)}`
              : tab.href
          const active = isTabActive(pathname, hash, tab.href)
          const Icon = tab.icon

          return (
            <li key={tab.id} className="flex min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  active ? "text-primary" : "text-foreground/45 hover:text-foreground/75",
                )}
              >
                <Icon
                  className={cn("size-5 stroke-[1.75]", active && "stroke-[2.25]")}
                  aria-hidden
                />
                <span
                  className={cn(
                    "max-w-full truncate text-[10px] leading-none",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
