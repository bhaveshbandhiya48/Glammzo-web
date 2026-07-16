import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { LEGAL_ENTITY, TERMS_OF_SERVICE } from "@/data/legal-copy"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms for using Glammzo, operated by ${LEGAL_ENTITY.companyName}.`,
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <LegalDocument
          title={TERMS_OF_SERVICE.title}
          lastUpdated={TERMS_OF_SERVICE.lastUpdated}
          intro={TERMS_OF_SERVICE.intro}
          sections={TERMS_OF_SERVICE.sections}
          relatedHref="/privacy"
          relatedLabel="View Privacy Policy"
        />
      </main>
      <Footer />
    </>
  )
}
