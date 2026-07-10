import type { Metadata } from "next"

import { CustomerMapSection } from "@/components/maps/customer-map-section"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Footer } from "@/components/sections/parts/footer"

export const metadata: Metadata = {
  title: "Salon map",
  description: "Discover nearby salons on Glammzo with an interactive map.",
}

export default function CustomerMapPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow="Map"
            title="Salons near you"
            subtitle="Browse published salons on the map. Distances use your location and our saved salon coordinates only."
          />
          <div className="mt-8">
            <CustomerMapSection />
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
