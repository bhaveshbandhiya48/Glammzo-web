import { Navbar } from "@/components/layout/navbar"
import { SitePageShell } from "@/components/layout/site-page-shell"

export default function DashboardLoading() {
  return (
    <>
      <Navbar />
      <SitePageShell>
        <div className="space-y-6">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-56 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-border/70 bg-muted/40"
              />
            ))}
          </div>
        </div>
      </SitePageShell>
    </>
  )
}
