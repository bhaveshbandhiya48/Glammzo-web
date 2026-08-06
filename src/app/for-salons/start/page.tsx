import type { Metadata } from "next"

import { SalonOnboardingWizard } from "@/components/for-salons/salon-onboarding-wizard"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Footer } from "@/components/sections/parts/footer"
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
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow="For salons"
            title="Create your salon account"
            subtitle="Same quick signup as Glammzo CRM — then finish your business profile inside the dashboard."
          />
        </PageSection>

        <PageSection>
          <SalonOnboardingWizard initialProgress={initialProgress} />
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
