import { Navbar } from "@/components/layout/navbar"
import { SitePageShell } from "@/components/layout/site-page-shell"

export default function BookingConfirmationLoading() {
  return (
    <>
      <Navbar />
      <SitePageShell>
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <div className="mx-auto size-16 animate-pulse rounded-full bg-muted" />
          <div className="mx-auto h-10 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="mx-auto h-5 w-80 max-w-full animate-pulse rounded bg-muted/70" />
          <div className="mx-auto h-40 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
          <div className="mx-auto h-11 w-48 animate-pulse rounded-full bg-muted" />
        </div>
      </SitePageShell>
    </>
  )
}
