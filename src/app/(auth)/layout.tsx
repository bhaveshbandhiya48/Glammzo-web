import type { Metadata, Viewport } from "next"
import Image from "next/image"
import Link from "next/link"

import { Logo } from "@/components/layout/logo"

export const metadata: Metadata = {
  title: "Continue",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f4f1",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,color-mix(in_oklab,var(--glam-coral)_18%,transparent),transparent_52%),radial-gradient(ellipse_at_88%_100%,color-mix(in_oklab,var(--glam-sand)_55%,transparent),transparent_48%)]"
      />

      {/* Mobile: native app-style full-screen shell */}
      <div className="relative flex min-h-dvh flex-col lg:hidden">
        <header className="flex items-center justify-between px-5 pt-[max(0.85rem,env(safe-area-inset-top))] pb-3">
          <Logo size="lg" className="-ml-1" />
          <Link
            href="/for-salons/start"
            className="text-xs font-medium text-foreground/55 underline-offset-4 hover:text-foreground hover:underline"
          >
            For salons
          </Link>
        </header>

        <main className="flex min-h-0 flex-1 flex-col px-5">{children}</main>
      </div>

      {/* Desktop: split brand + form */}
      <div className="relative hidden min-h-dvh lg:grid lg:grid-cols-2">
        <aside className="relative flex flex-col justify-between overflow-hidden border-r border-border/60 px-12 py-10">
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(160deg,color-mix(in_oklab,white_72%,var(--glam-bg)),color-mix(in_oklab,var(--glam-sand)_35%,var(--glam-bg)))]"
          />
          <div
            aria-hidden
            className="absolute -top-24 left-[-10%] size-[28rem] rounded-full bg-primary/[0.08] blur-3xl"
          />

          <div className="relative">
            <Logo size="xl" className="-ml-2" />
            <div className="mt-10 max-w-md">
              <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                Book salons with your mobile number.
              </p>
              <p className="mt-3 max-w-sm text-base leading-7 text-foreground/65">
                Save favorites, manage appointments, and rebook faster — we&apos;ll create your
                account the first time you verify.
              </p>
            </div>
          </div>

          <div className="relative mt-8">
            <div className="overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/15 ring-1 ring-black/[0.06]">
              <div className="relative aspect-[16/11]">
                <Image
                  src="/images/auth/salon-auth-v3.jpg"
                  alt="Luxury salon interior with styling stations"
                  fill
                  className="object-cover object-[center_40%]"
                  priority
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(28,22,18,0.52),transparent_55%)]" />
                <p className="absolute inset-x-5 bottom-5 font-heading text-lg font-semibold tracking-tight text-white">
                  Premium salons. Effortless booking.
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-foreground/55">
              Growing a salon?{" "}
              <Link
                href="/for-salons/start"
                className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
              >
                Create a partner account
              </Link>
            </p>
          </div>
        </aside>

        <main className="relative flex items-center justify-center px-14 py-12">
          <div className="w-full animate-in fade-in duration-700 fill-mode-both">{children}</div>
        </main>
      </div>
    </div>
  )
}
