import { PageHeader } from "@/components/layout/page-header"
import { Footer } from "@/components/sections/parts/footer"

export default function ReviewLoading() {
  return (
    <>
      <main className="page-main">
        <PageHeader
          eyebrow="Review"
          title="Share your experience"
          subtitle="Tell us how your visit went."
        />
        <div className="mt-8 max-w-xl space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl border border-border/70 bg-muted/40" />
          <div className="h-12 animate-pulse rounded-full bg-muted" />
        </div>
      </main>
      <Footer />
    </>
  )
}
