import type { Metadata } from "next"

import { ForSalonsWelcome } from "@/components/for-salons/for-salons-welcome"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
}

export default async function ForSalonsWelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ salon?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklab,var(--glam-coral)_18%,transparent),transparent_45%)]">
      <Container className="section-y py-10 sm:py-16">
        <Logo className="mx-auto mb-10" />
        <ForSalonsWelcome salonId={params.salon} />
      </Container>
    </div>
  )
}
