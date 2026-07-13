import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Footer } from "@/components/sections/parts/footer"

export default function CustomerMapLoading() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow="Map"
            title="Salons near you"
            subtitle="Browse published salons on the map."
          />
          <div className="mt-8 h-[min(70vh,640px)] animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
