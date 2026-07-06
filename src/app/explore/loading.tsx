import { Navbar } from "@/components/layout/navbar"
import { PageSection } from "@/components/layout/page-section"
import { Footer } from "@/components/sections/parts/footer"

export default function ExploreLoading() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-muted/70" />
        </PageSection>
        <PageSection tone="statement" separated>
          <div className="mb-6 space-y-3 sm:mb-8">
            <div className="h-3 w-16 animate-pulse rounded bg-muted/70" />
            <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted/60" />
          </div>
          <div className="mb-8 flex flex-wrap gap-2 sm:mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-16 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="space-y-3 border-t border-border/60 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted/70" />
                  <div className="h-10 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </PageSection>
        <PageSection tone="featured" separated>
          <div className="mx-auto max-w-md space-y-3 text-center">
            <div className="mx-auto h-3 w-24 animate-pulse rounded bg-muted/70" />
            <div className="mx-auto h-9 w-64 animate-pulse rounded-lg bg-muted" />
            <div className="mx-auto h-12 w-40 animate-pulse rounded-full bg-muted" />
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
