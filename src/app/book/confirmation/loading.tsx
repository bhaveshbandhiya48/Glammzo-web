import { Navbar } from "@/components/layout/navbar"
import { SitePageShell } from "@/components/layout/site-page-shell"

export default function BookingConfirmationLoading() {
  return (
    <>
      <Navbar />
      <SitePageShell>
        <div className="mx-auto flex max-w-lg flex-col items-center space-y-5">
          <div className="mx-auto size-14 animate-pulse rounded-full bg-muted" />
          <div className="mx-auto h-7 w-56 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="mx-auto h-4 w-72 max-w-full animate-pulse rounded bg-muted/70" />
          <div className="mx-auto h-7 w-36 animate-pulse rounded-full bg-muted/80" />
          <div className="h-48 w-full animate-pulse rounded-2xl border border-border/70 bg-muted/40" />
          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
            <div className="mx-auto h-12 w-full max-w-[11.5rem] animate-pulse rounded-full bg-muted" />
            <div className="mx-auto h-12 w-full max-w-[11.5rem] animate-pulse rounded-full bg-muted/70" />
          </div>
        </div>
      </SitePageShell>
    </>
  )
}
