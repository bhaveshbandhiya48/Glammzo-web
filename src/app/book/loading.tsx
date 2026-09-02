import { SitePageShell } from "@/components/layout/site-page-shell"

export default function BookLoading() {
  return (
    <SitePageShell compactMain navbarMobileTitle="Book appointment">
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-xl bg-muted/60 xl:hidden" />
          <div className="hidden space-y-4 xl:block">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-5 w-80 max-w-full animate-pulse rounded bg-muted/70" />
            <div className="mt-8 h-40 animate-pulse rounded-3xl bg-muted/60" />
          </div>
        </div>
        <div className="space-y-4 rounded-xl border border-border/70 bg-white/50 p-4 sm:p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-12 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </SitePageShell>
  )
}
