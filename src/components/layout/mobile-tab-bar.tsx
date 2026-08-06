"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CalendarDaysIcon,
  CompassIcon,
  UserRoundIcon,
} from "lucide-react"

import { useSessionStatus } from "@/hooks/use-session-status"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "home", label: "Home", href: "/explore", icon: CompassIcon },
  {
    id: "bookings",
    label: "Bookings",
    href: "/dashboard/profile#bookings",
    icon: CalendarDaysIcon,
    requiresAuth: true,
  },
  {
    id: "profile",
    label: "Profile",
    href: "/dashboard/profile#profile",
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
  const target = splitHref(href)

  if (target.path === "/explore") {
    return pathname === "/explore" || pathname.startsWith("/services")
  }

  const pathMatches =
    pathname === target.path || pathname.startsWith(`${target.path}/`)

  if (!pathMatches) return false
  if (!target.hash) return true

  // On profile, Bookings vs Profile are distinguished by hash.
  if (target.path === "/dashboard/profile") {
    const current = hash.replace(/^#/, "") || "bookings"
    if (target.hash === "bookings") return current === "bookings"
    if (target.hash === "profile") {
      return (
        current === "profile" ||
        current === "home" ||
        current === "wallet" ||
        current === "loyalty" ||
        current === "activity" ||
        current === "details"
      )
    }
    return current === target.hash
  }

  return true
}

/** Next.js often skips hash-only updates on the same path — force them. */
function goToTabHref(pathname: string, href: string, router: ReturnType<typeof useRouter>) {
  const { path, hash: targetHash } = splitHref(href)

  if (pathname === path) {
    const nextHash = targetHash ? `#${targetHash}` : ""
    if (window.location.hash === nextHash) {
      window.dispatchEvent(new Event("hashchange"))
      return
    }
    if (targetHash) {
      window.location.hash = targetHash
    } else {
      history.pushState(null, "", path)
      window.dispatchEvent(new Event("hashchange"))
    }
    return
  }

  if (targetHash) {
    router.push(`${path}#${targetHash}`)
    // App Router can drop the hash on soft nav — re-apply after route settles.
    window.setTimeout(() => {
      if (window.location.pathname === path && window.location.hash !== `#${targetHash}`) {
        window.location.hash = targetHash
      } else if (window.location.pathname === path) {
        window.dispatchEvent(new Event("hashchange"))
      }
    }, 50)
    return
  }

  router.push(path)
}

/**
 * Native-style bottom tab bar for Glammzo-web mobile (< md).
 * Desktop is unchanged.
 */
export function MobileTabBar() {
  const pathname = usePathname()
  const router = useRouter()
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
      <ul className="mx-auto flex h-[4.5rem] max-w-lg items-stretch justify-between px-2">
        {TABS.map((tab) => {
          const needsAuthRedirect =
            "requiresAuth" in tab && tab.requiresAuth && authenticated === false
          const href = needsAuthRedirect
            ? `/login?next=${encodeURIComponent(tab.href)}`
            : tab.href
          const active = isTabActive(pathname, hash, tab.href)
          const Icon = tab.icon
          const tabHash = splitHref(tab.href).hash

          return (
            <li key={tab.id} className="flex min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                scroll={false}
                onClick={(event) => {
                  if (needsAuthRedirect) return
                  event.preventDefault()
                  goToTabHref(pathname, tab.href, router)
                  setHash(tabHash ? `#${tabHash}` : "")
                }}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  active ? "text-primary" : "text-foreground/45 hover:text-foreground/75",
                )}
              >
                <Icon
                  className={cn("size-6 stroke-[1.75]", active && "stroke-[2.25]")}
                  aria-hidden
                />
                <span
                  className={cn(
                    "max-w-full truncate text-[11px] leading-none",
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
