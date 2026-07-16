"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { MenuIcon, UserIcon } from "lucide-react"

import { navItems } from "@/data/site-copy"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CartNavButton } from "@/components/layout/cart-nav-button"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { LocationSwitcher } from "@/components/layout/location-switcher"
import { LogoutFormButton, LogoutMenuButton } from "@/components/auth/logout-form-button"
import { resolveSessionGreeting } from "@/lib/auth/display"

export function Navbar() {
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [welcomeName, setWelcomeName] = useState<string>("")

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

  useEffect(() => {
    let cancelled = false
    fetch("/api/session")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load session"))))
      .then((data: { authenticated?: boolean; session?: { name?: string; phone?: string } | null }) => {
        if (cancelled) return
        setAuthenticated(Boolean(data?.authenticated))
        setWelcomeName(
          resolveSessionGreeting({
            name: data?.session?.name,
            phone: data?.session?.phone,
          }),
        )
      })
      .catch(() => {
        if (!cancelled) setAuthenticated(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <Container className="flex h-[4.25rem] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5 pl-0.5 sm:gap-3">
          <Logo size="lg" className="shrink-0 px-1.5 py-0.5" />
          <LocationSwitcher
            size="xs"
            className="min-w-0 max-w-[10.5rem] sm:max-w-[14rem]"
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

        <div className="hidden items-center gap-2 md:flex">
          <CartNavButton />
          {authenticated ? (
            <>
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
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
                  >
                    Settings
                  </Link>
                  <LogoutMenuButton />
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <CartNavButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <SheetHeader className="border-b border-border/60 p-6 text-left">
                <SheetTitle className="font-heading text-xl">Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation links</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                {navItems.map((item) => {
                  const active = isActiveNav(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => scrollToTopIfCurrentPage(item.href)}
                      className={cn(
                        "rounded-xl px-4 py-3 text-base transition-colors hover:bg-accent",
                        active
                          ? "font-bold text-primary"
                          : "font-medium text-foreground/80",
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-auto grid gap-2 p-4">
                {authenticated ? (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/bookings">
                        <span className="inline-flex items-center gap-2">
                          <UserIcon className="size-4" />
                          My bookings
                        </span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/favorites">
                        <span className="inline-flex items-center gap-2">
                          <UserIcon className="size-4" />
                          Saved salons
                        </span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/settings">
                        <span className="inline-flex items-center gap-2">
                          <UserIcon className="size-4" />
                          Settings
                        </span>
                      </Link>
                    </Button>
                    <LogoutFormButton
                      variant="outline"
                      className="w-full"
                    />
                  </>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  )
}
