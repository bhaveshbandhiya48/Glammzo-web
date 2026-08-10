"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeftIcon, UserIcon } from "lucide-react"

import { navItems } from "@/data/site-copy"
import {
  isProfileHubChild,
  profileMobileNavTitle,
  profileSectionFromHash,
} from "@/lib/account/profile-nav"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CartNavButton } from "@/components/layout/cart-nav-button"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { LocationSwitcher } from "@/components/layout/location-switcher"
import { MobileTabBar } from "@/components/layout/mobile-tab-bar"
import { LogoutMenuButton } from "@/components/auth/logout-form-button"
import { useSessionStatus } from "@/hooks/use-session-status"

type NavbarProps = {
  /** When set on `/salons/[id]`, replaces logo + location with back + title. */
  salonName?: string
}

function isSalonDetailPath(pathname: string | null) {
  return Boolean(pathname && /^\/salons\/[^/]+$/.test(pathname))
}

function isProfilePath(pathname: string | null) {
  return Boolean(pathname && (pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile/")))
}

export function Navbar({ salonName }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { authenticated, welcomeName } = useSessionStatus()
  const salonDetail = isSalonDetailPath(pathname)
  const profilePage = isProfilePath(pathname)
  const [profileHash, setProfileHash] = useState("")

  useEffect(() => {
    if (!profilePage) {
      setProfileHash("")
      return
    }
    const sync = () => setProfileHash(window.location.hash)
    sync()
    window.addEventListener("hashchange", sync)
    window.addEventListener("popstate", sync)
    return () => {
      window.removeEventListener("hashchange", sync)
      window.removeEventListener("popstate", sync)
    }
  }, [profilePage, pathname])

  const profileSection = profileSectionFromHash(profileHash)
  /** Mobile-only compact header (back + title); desktop keeps full chrome. */
  const mobileCompact = salonDetail || profilePage
  const mobileTitle = profilePage
    ? profileMobileNavTitle(profileSection)
    : salonName?.trim() || "Salon"
  const backFallbackHref = profilePage ? "/" : "/explore"

  const scrollToTopIfCurrentPage = (href: string) => {
    const path = href.split("#")[0] || href
    if (path === pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
  }

  const isActiveNav = (href: string) => {
    const path = href.split("#")[0] || href
    if (path === "/") return pathname === "/"
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const onCompactBack = () => {
    if (profilePage && isProfileHubChild(profileSection)) {
      window.history.replaceState(null, "", `${pathname}#profile`)
      window.dispatchEvent(new Event("hashchange"))
      return
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    router.push(backFallbackHref)
  }

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <Container className="flex h-[4.25rem] items-center justify-between gap-3">
          {mobileCompact ? (
            <div className="flex min-w-0 flex-1 items-center gap-1.5 pl-0.5 lg:hidden">
              <button
                type="button"
                onClick={onCompactBack}
                aria-label="Go back"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-foreground/80 transition hover:bg-muted/70 active:scale-[0.97]"
              >
                <ArrowLeftIcon className="size-5" aria-hidden />
              </button>
              <h1 className="min-w-0 truncate font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {mobileTitle}
              </h1>
            </div>
          ) : null}

          <div
            className={cn(
              "min-w-0 items-center gap-2 pl-0.5 sm:gap-3",
              mobileCompact ? "hidden lg:flex" : "flex",
            )}
          >
            <Logo size="lg" className="shrink-0 px-1.5 py-0.5" />
            <LocationSwitcher
              size="xs"
              className="min-w-0 max-w-[9.5rem] sm:max-w-[14rem]"
            />
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map((item) => {
              const active = isActiveNav(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => scrollToTopIfCurrentPage(item.href)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
                    active
                      ? "font-bold text-primary"
                      : "font-medium text-foreground/65 hover:bg-foreground hover:text-background",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <div className={cn(profilePage && "max-lg:hidden")}>
              <CartNavButton />
            </div>

            {/* Desktop account — mobile uses bottom Profile tab */}
            <div className="hidden items-center gap-2 md:flex">
              {authenticated ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Account">
                      <UserIcon className="size-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-52 rounded-lg p-2">
                    <div className="px-2 py-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/45">
                        Welcome
                      </p>
                      {welcomeName ? (
                        <p className="mt-1 truncate text-sm font-medium text-foreground/85">
                          {welcomeName}
                        </p>
                      ) : null}
                    </div>
                    <div className="my-1 h-px bg-border/70" />
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/bookings"
                      className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
                    >
                      My bookings
                    </Link>
                    <Link
                      href="/dashboard/favorites"
                      className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
                    >
                      Saved salons
                    </Link>
                    <LogoutMenuButton />
                  </PopoverContent>
                </Popover>
              ) : (
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </Container>
      </header>

      <MobileTabBar />
    </>
  )
}
