import type { Metadata } from "next"

import { SalonOnboardingWizard } from "@/components/for-salons/salon-onboarding-wizard"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { readOnboardingProgress } from "@/lib/salon-onboarding/cookies"

export const metadata: Metadata = {
  title: "Start free",
  description: "Create your Glammzo salon account and open your CRM in minutes.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function ForSalonsStartPage() {
  const progress = await readOnboardingProgress()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,color-mix(in_oklab,var(--glam-coral)_16%,transparent),transparent_42%),radial-gradient(circle_at_90%_10%,color-mix(in_oklab,var(--glam-sand)_55%,transparent),transparent_45%)]">
      <Container className="section-y py-10 sm:py-14">
        <Logo className="mb-8 -ml-1" />
        <SalonOnboardingWizard initialProgress={progress} />
      </Container>
    </div>
  )
}
