"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { navItems } from "@/data/site-copy"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

export function Navbar() {
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-foreground/65 transition-colors hover:bg-foreground hover:text-background",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <CartNavButton />
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full px-6">
            <Link href="/explore">Find salons</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <CartNavButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <SheetHeader className="border-b border-border/60 p-6 text-left">
                <SheetTitle className="font-heading text-xl">Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation links</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto grid gap-2 p-4">
                <Button asChild variant="outline" className="h-11 w-full rounded-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="h-11 w-full rounded-full">
                  <Link href="/explore">Find salons</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  )
}
