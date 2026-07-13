import { Navbar } from "@/components/layout/navbar"
import { SitePageShell } from "@/components/layout/site-page-shell"

export default function RescheduleLoading() {
  return (
    <>
      <Navbar />
      <SitePageShell>
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-10 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded bg-muted/70" />
          <div className="space-y-4 rounded-3xl border border-border/70 bg-white/50 p-6 sm:p-8">
            <div className="h-12 animate-pulse rounded-2xl bg-muted/60" />
            <div className="h-12 animate-pulse rounded-2xl bg-muted/60" />
            <div className="h-12 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </SitePageShell>
    </>
  )
}
