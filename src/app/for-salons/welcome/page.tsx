import type { Metadata } from "next"

import { ForSalonsWelcome } from "@/components/for-salons/for-salons-welcome"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Footer } from "@/components/sections/parts/footer"

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
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow="Welcome"
            title="Your salon account is ready"
            subtitle="Your CRM dashboard is ready. Complete your business profile, services, and staff there — then publish when you want to go live on Glammzo."
            className="mx-auto max-w-2xl text-center [&_p]:mx-auto"
          />
        </PageSection>

        <PageSection>
          <ForSalonsWelcome salonId={params.salon} />
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
