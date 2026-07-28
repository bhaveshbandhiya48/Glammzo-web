import type { Metadata } from "next"

import { SalonOnboardingWizard } from "@/components/for-salons/salon-onboarding-wizard"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { readOnboardingProgress, writeOnboardingProgress } from "@/lib/salon-onboarding/cookies"
import type { SalonOnboardingProgress } from "@/lib/salon-onboarding/constants"
import { isSalonPlanCode } from "@/lib/subscriptions/plan-catalog"

export const metadata: Metadata = {
  title: "Start free",
  description: "Create your Glammzo salon account and open your CRM in minutes.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: Promise<{ plan?: string }>
}

export default async function ForSalonsStartPage({ searchParams }: PageProps) {
  const params = await searchParams
  const planFromUrl = isSalonPlanCode(params.plan) ? params.plan : undefined
  let progress = await readOnboardingProgress()

  if (planFromUrl && progress && progress.intendedPlan !== planFromUrl) {
    const updated: SalonOnboardingProgress = {
      ...progress,
      intendedPlan: planFromUrl,
      updatedAt: Date.now(),
    }
    await writeOnboardingProgress(updated)
    progress = updated
  }

  const initialProgress: SalonOnboardingProgress | null = progress
    ? progress
    : planFromUrl
      ? {
          step: "details",
          businessName: "",
          ownerName: "",
          mobile: "",
          city: "",
          businessType: "Salon",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          intendedPlan: planFromUrl,
        }
      : null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,color-mix(in_oklab,var(--glam-coral)_16%,transparent),transparent_42%),radial-gradient(circle_at_90%_10%,color-mix(in_oklab,var(--glam-sand)_55%,transparent),transparent_45%)]">
      <Container className="section-y py-10 sm:py-14">
        <Logo className="mb-8 -ml-1" />
        <SalonOnboardingWizard initialProgress={initialProgress} />
      </Container>
    </div>
  )
}
