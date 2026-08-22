import type { Metadata } from "next"

import { BookDemoForm } from "@/components/for-salons/book-demo-form"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Footer } from "@/components/sections/parts/footer"

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "Book a Glammzo demo for your salon. Share your business details and our team will walk you through marketplace booking and CRM.",
  alternates: {
    canonical: "/book-demo",
  },
}

export default function BookDemoPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow="For salons"
            title="Book a demo"
            subtitle="Tell us about your business and we’ll schedule a short walkthrough of Glammzo for owners."
          />
        </PageSection>

        <PageSection>
          <BookDemoForm />
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
