import type { Metadata } from "next"
import Link from "next/link"

import { PricingPlans } from "@/components/marketing/pricing-plans"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Footer } from "@/components/sections/parts/footer"
import { Button } from "@/components/ui/button"
import {
  loadActiveLaunchOffer,
  loadPublicPlanCatalog,
} from "@/lib/subscriptions/plan-catalog"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Glammzo plans for salon partners — free CRM, marketplace growth, and WhatsApp automation.",
  robots: { index: true, follow: true },
}

export default async function PricingPage() {
  const [plans, offer] = await Promise.all([
    loadPublicPlanCatalog(),
    loadActiveLaunchOffer(),
  ])

  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow="For businesses"
            title="Simple pricing for growing salons"
            subtitle="Start with a free CRM, then unlock marketplace discovery and messaging when you’re ready. Create your account and complete your profile in Glammzo CRM."
            className="mx-auto max-w-2xl text-center [&_p]:mx-auto"
          />
        </PageSection>

        <PageSection tone="statement" separated>
          <PricingPlans plans={plans} offer={offer} />
        </PageSection>

        <PageSection bordered>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Already partnering with us?
            </h2>
            <p className="mt-2 text-sm text-foreground/60">
              Open your CRM to manage billing, WhatsApp credits, and marketplace listing.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Button asChild className="rounded-full px-5">
                <Link href="/for-salons">For Salons</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link href="/for-salons/start">Start free</Link>
              </Button>
            </div>
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
