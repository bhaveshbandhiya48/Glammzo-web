import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { CANCELLATION_POLICY, LEGAL_ENTITY } from "@/data/legal-copy"

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: `How cancellations and reschedules work on Glammzo, operated by ${LEGAL_ENTITY.companyName}.`,
  robots: { index: true, follow: true },
}

export default function CancellationPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <LegalDocument
          eyebrow="Policies"
          title={CANCELLATION_POLICY.title}
          lastUpdated={CANCELLATION_POLICY.lastUpdated}
          intro={CANCELLATION_POLICY.intro}
          sections={CANCELLATION_POLICY.sections}
          relatedHref="/terms"
          relatedLabel="View Terms of Service"
        />
      </main>
      <Footer />
    </>
  )
}
