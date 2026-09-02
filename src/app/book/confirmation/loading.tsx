import { SitePageShell } from "@/components/layout/site-page-shell"

export default function BookingConfirmationLoading() {
  return (
    <SitePageShell compactMain navbarMobileTitle="Booking confirmed">
        <div className="mx-auto grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm lg:mx-0 lg:max-w-none">
            <div className="space-y-3 border-b border-border/50 px-6 py-7 sm:px-8">
              <div className="h-3 w-14 animate-pulse rounded bg-muted" />
              <div className="h-7 w-48 max-w-full animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="grid grid-cols-2 border-b border-border/50">
              <div className="space-y-2 border-r border-border/50 px-6 py-5 sm:px-8">
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                <div className="h-5 w-28 animate-pulse rounded bg-muted/80" />
              </div>
              <div className="space-y-2 px-6 py-5 sm:px-8">
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded bg-muted/80" />
              </div>
            </div>
            <div className="space-y-4 px-6 py-7 sm:px-8">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-muted/50" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-muted/40" />
            </div>
            <div className="space-y-3 border-t border-border/50 bg-muted/25 px-6 py-6 sm:px-8">
              <div className="flex justify-between">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-7 w-28 animate-pulse rounded-full bg-muted/70" />
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl border border-border/60 bg-white px-6 py-8 shadow-sm sm:px-8 lg:mx-0 lg:max-w-none">
            <div className="size-16 animate-pulse rounded-full bg-muted sm:size-[4.5rem]" />
            <div className="mt-5 h-8 w-36 animate-pulse rounded-full bg-muted/80" />
            <div className="mt-5 h-8 w-56 max-w-full animate-pulse rounded-lg bg-muted" />
            <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-muted/70" />
            <div className="mt-8 w-full space-y-3">
              <div className="h-14 w-full animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-14 w-full animate-pulse rounded-2xl bg-muted/35" />
              <div className="h-14 w-full animate-pulse rounded-2xl bg-muted/30" />
            </div>
            <div className="mt-8 flex w-full flex-col gap-3">
              <div className="h-12 w-full animate-pulse rounded-full bg-muted" />
              <div className="h-12 w-full animate-pulse rounded-full bg-muted/60" />
            </div>
          </div>
        </div>
      </SitePageShell>
    )
}
