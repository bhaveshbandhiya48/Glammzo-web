import type { Metadata } from "next"

import { WhyGlammzoContent } from "@/components/marketing/why-glammzo-content"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { WHY_GLAMMZO_PAGE } from "@/data/marketing-pages-copy"

export const metadata: Metadata = {
  title: "Why Glammzo",
  description: WHY_GLAMMZO_PAGE.subtitle,
  robots: { index: true, follow: true },
}

export default function WhyGlammzoPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <WhyGlammzoContent />
      </main>
      <Footer />
    </>
  )
}
