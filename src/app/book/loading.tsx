import { Navbar } from "@/components/layout/navbar"
import { SitePageShell } from "@/components/layout/site-page-shell"

export default function BookLoading() {
  return (
    <>
      <Navbar />
      <SitePageShell>
        <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="space-y-4">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-5 w-80 max-w-full animate-pulse rounded bg-muted/70" />
            <div className="mt-8 h-40 animate-pulse rounded-3xl bg-muted/60" />
          </div>
          <div className="space-y-4 rounded-3xl border border-border/70 bg-white/50 p-6 sm:p-8">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
            <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
            <div className="h-12 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </SitePageShell>
    </>
  )
}
