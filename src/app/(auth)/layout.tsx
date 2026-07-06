import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <Container className="section-y">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-border/70 bg-white/45 p-7 shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03] backdrop-blur-md sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,#F95C4828,transparent_55%),radial-gradient(circle_at_78%_55%,#E4DED240,transparent_60%)]" />
            <div className="relative">
              <Logo className="-ml-2" />
              <h1 className="mt-6 text-3xl leading-tight sm:text-4xl">
                Welcome back.
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-foreground/65 sm:text-base">
                Book appointments faster, save favorites, and keep everything in one calm place.
              </p>

              <div className="mt-8 overflow-hidden rounded-[2rem] bg-white/55 ring-1 ring-black/[0.06] shadow-xl shadow-black/[0.07]">
                <div className="relative aspect-[16/11]">
                  <Image
                    src="/images/auth/salon.jpg"
                    alt="Salon"
                    fill
                    className="object-cover"
                    priority={false}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(30,30,30,0.32),transparent_60%)]" />
                </div>
              </div>

              <div className="mt-6 text-sm text-foreground/60">
                <Link
                  href="/partner-signup"
                  className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                >
                  Create a Salon Partner Account
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-border/70 bg-white/35 p-6 shadow-sm shadow-black/[0.03] ring-1 ring-black/[0.03] backdrop-blur-md sm:p-8">
            {children}
          </div>
        </div>
      </Container>
    </div>
  )
}

