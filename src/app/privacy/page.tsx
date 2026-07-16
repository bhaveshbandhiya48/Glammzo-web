import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { LEGAL_ENTITY, PRIVACY_POLICY } from "@/data/legal-copy"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${LEGAL_ENTITY.companyName} collects and uses personal information on Glammzo.`,
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <LegalDocument
          title={PRIVACY_POLICY.title}
          lastUpdated={PRIVACY_POLICY.lastUpdated}
          intro={PRIVACY_POLICY.intro}
          sections={PRIVACY_POLICY.sections}
          relatedHref="/terms"
          relatedLabel="View Terms of Service"
        />
      </main>
      <Footer />
    </>
  )
}
