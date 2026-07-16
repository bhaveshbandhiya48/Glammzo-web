import type { Metadata } from "next"

import { FaqPageContent } from "@/components/faq/faq-page-content"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { FAQ_PAGE } from "@/data/faq-copy"

export const metadata: Metadata = {
  title: "FAQs",
  description: FAQ_PAGE.subtitle,
  robots: { index: true, follow: true },
}

export default function FaqsPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <FaqPageContent />
      </main>
      <Footer />
    </>
  )
}
