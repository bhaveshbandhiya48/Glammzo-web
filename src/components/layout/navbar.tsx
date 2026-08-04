"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserIcon } from "lucide-react"

import { navItems } from "@/data/site-copy"
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

export function Navbar() {
  const pathname = usePathname()
  const { authenticated, welcomeName } = useSessionStatus()

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

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <Container className="flex h-[4.25rem] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 pl-0.5 sm:gap-3">
            <Logo size="lg" className="shrink-0 px-1.5 py-0.5" />
            <LocationSwitcher
              size="xs"
              className="min-w-0 max-w-[9.5rem] sm:max-w-[14rem]"
            />
          </div>

          {/* Desktop primary nav */}
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

          <div className="flex items-center gap-1.5 md:gap-2">
            <CartNavButton />

            {/* Desktop account */}
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

            {/* Mobile: compact account shortcut (tabs handle primary nav) */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={authenticated ? "Account" : "Login"}
            >
              <Link
                href={
                  authenticated
                    ? "/dashboard/profile"
                    : `/login?next=${encodeURIComponent(pathname || "/")}`
                }
              >
                <UserIcon className="size-5" />
              </Link>
            </Button>
          </div>
        </Container>
      </header>

      <MobileTabBar />
    </>
  )
}
