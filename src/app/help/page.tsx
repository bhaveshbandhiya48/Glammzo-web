import type { Metadata } from "next"

import { HelpCenterContent } from "@/components/help/help-center-content"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { HELP_CENTER } from "@/data/help-center-copy"

export const metadata: Metadata = {
  title: "Help Center",
  description: HELP_CENTER.subtitle,
  robots: { index: true, follow: true },
}

export default function HelpCenterPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <HelpCenterContent />
      </main>
      <Footer />
    </>
  )
}
