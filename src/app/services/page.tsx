import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { categories } from "@/data/landing"
import { siteCopy } from "@/data/site-copy"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { SectionHeader } from "@/components/shared/section-header"
import { ServiceCategoryGridCard } from "@/components/services/service-category-grid-card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/sections/parts/footer"

const { categories: categoriesCopy } = siteCopy

export const metadata: Metadata = {
  title: "Services",
  description: categoriesCopy.subtitle,
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow={categoriesCopy.eyebrow}
            title={categoriesCopy.title}
            subtitle={categoriesCopy.subtitle}
          />
        </PageSection>

        <PageSection tone="statement" separated>
          <SectionHeader
            eyebrow="Categories"
            title="Browse by what you need"
            subtitle="Each category includes popular treatments with upfront pricing on salon pages."
            className="mb-8 sm:mb-10"
          />
          <ul
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Service categories"
          >
            {categories.map((category, index) => (
              <li key={category.id} className="min-h-0">
                <ServiceCategoryGridCard category={category} priority={index < 3} />
              </li>
            ))}
          </ul>
        </PageSection>

        <PageSection tone="featured" separated>
          <SectionHeader
            eyebrow="Ready to book?"
            title="Find salons offering these services"
            subtitle="Compare ratings, prices, and availability and confirm in minutes."
            align="center"
            className="mb-8"
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-8">
              <Link href="/explore">
                Explore salons
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8">
              <Link href="/#how">How it works</Link>
            </Button>
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
