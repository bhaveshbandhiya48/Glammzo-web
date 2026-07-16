import type { Metadata } from "next"

import { SuccessStoriesContent } from "@/components/marketing/success-stories-content"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { SUCCESS_STORIES_PAGE } from "@/data/marketing-pages-copy"

export const metadata: Metadata = {
  title: "Success Stories",
  description: SUCCESS_STORIES_PAGE.subtitle,
  robots: { index: true, follow: true },
}

export default function SuccessStoriesPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <SuccessStoriesContent />
      </main>
      <Footer />
    </>
  )
}
