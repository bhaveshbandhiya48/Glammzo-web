import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { PageSection } from "@/components/layout/page-section"
import { Footer } from "@/components/sections/parts/footer"

export default function SalonDetailLoading() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection bleed className="!py-0">
          <div className="aspect-[21/9] max-h-[420px] animate-pulse bg-muted" />
          <Container className="relative -mt-16 pb-20 sm:-mt-20 sm:pb-28">
            <div className="h-4 w-28 animate-pulse rounded bg-muted/70" />
            <div className="mt-4 rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              <div className="mt-4 h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
              <div className="mt-6 h-4 w-full max-w-xl animate-pulse rounded bg-muted/60" />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/50" />
                ))}
              </div>
            </div>
          </Container>
        </PageSection>
        <PageSection>
          <div className="mb-10 space-y-3">
            <div className="h-3 w-12 animate-pulse rounded bg-muted/70" />
            <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted/60" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-2.5 rounded-2xl border border-border/70 bg-card/40 p-3 sm:p-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-card/80" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-3xl border border-border/70 bg-card/80" />
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
