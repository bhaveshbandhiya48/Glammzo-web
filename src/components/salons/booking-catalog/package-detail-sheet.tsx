"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { CheckIcon, ClockIcon } from "lucide-react"

import { PackageCover } from "@/components/salons/booking-catalog/package-cover"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  buildPackageServiceIds,
  formatInr,
  formatPackageDuration,
  getPackageSavings,
  getPackageServiceCount,
} from "@/lib/salons/catalog-utils"
import {
  getPackageBenefits,
  getPackagePerfectFor,
  getPackageTerms,
} from "@/lib/salons/service-detail-utils"
import { buildBookHref, resolveServices } from "@/lib/bookings/utils"
import type { SalonCancellationPolicy, SalonPackage, SalonService } from "@/types/salon"

type PackageDetailSheetProps = {
  pkg: SalonPackage | null
  services: SalonService[]
  salonId: string
  salonName: string
  salonCoverImageUrl: string
  authenticated: boolean
  cancellationPolicy?: SalonCancellationPolicy
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPackage: (pkg: SalonPackage) => void
}

function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-border/60 pt-5">
      <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function PackageDetailSheet({
  pkg,
  services,
  salonId,
  salonName,
  salonCoverImageUrl,
  authenticated,
  cancellationPolicy,
  open,
  onOpenChange,
  onAddPackage,
}: PackageDetailSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  if (!pkg) return null

  const { shouldShowCompare, savings, savingsPercent } = getPackageSavings(pkg)
  const serviceCount = getPackageServiceCount(pkg)
  const durationLabel = formatPackageDuration(pkg, services)
  const packageServices = resolveServices(services, buildPackageServiceIds(pkg))
  const bookHref = buildBookHref(salonId, buildPackageServiceIds(pkg), authenticated, pkg.id)
  const benefits = getPackageBenefits(packageServices)
  const perfectFor = getPackagePerfectFor(pkg.name, pkg.description)
  const terms = getPackageTerms(cancellationPolicy)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={
          isDesktop
            ? "w-[min(92vw,520px)] gap-0 p-0"
            : "max-h-[92vh] gap-0 rounded-t-3xl p-0"
        }
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="overflow-hidden">
              <PackageCover
                pkg={pkg}
                salonName={salonName}
                salonCoverImageUrl={salonCoverImageUrl}
                className="h-[240px] sm:h-[280px]"
              />
            </div>

            <div className="px-6 pt-5 pb-6">
              <SheetHeader className="space-y-2 p-0 text-left">
                <SheetTitle className="font-heading text-2xl leading-tight">{pkg.name}</SheetTitle>
                {(pkg.detailedDescription || pkg.description) ? (
                  <SheetDescription className="text-[15px] leading-relaxed">
                    {pkg.detailedDescription || pkg.description}
                  </SheetDescription>
                ) : null}
              </SheetHeader>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground/60">
                <span>
                  {serviceCount} {serviceCount === 1 ? "service" : "services"} included
                </span>
                {durationLabel ? (
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="size-3.5" />
                    Total ~{durationLabel}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  {shouldShowCompare ? (
                    <span className="text-base text-foreground/45 line-through tabular-nums">
                      {formatInr(pkg.comparePrice)}
                    </span>
                  ) : null}
                  <span className="font-heading text-3xl font-semibold tabular-nums">
                    {formatInr(pkg.packagePrice)}
                  </span>
                </div>
                {savings > 0 ? (
                  <p className="mt-1 text-sm font-medium text-emerald-700">
                    Save {formatInr(savings)}
                    {savingsPercent > 0 ? ` (${savingsPercent}% off)` : ""}
                  </p>
                ) : null}
              </div>

              <DetailSection title="Included services">
                <ul className="space-y-2.5">
                  {pkg.items.map((item) => {
                    const service = packageServices.find((entry) => entry.id === item.serviceId)
                    return (
                      <li
                        key={`${pkg.id}-${item.serviceId}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3.5 py-3 text-sm"
                      >
                        <span className="text-foreground/80">
                          {item.quantity}× {item.serviceName}
                        </span>
                        {service ? (
                          <span className="shrink-0 text-foreground/50">
                            {service.durationMin} min
                          </span>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </DetailSection>

              {benefits.length > 0 ? (
                <DetailSection title="Benefits">
                  <ul className="space-y-2.5">
                    {benefits.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/75">
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              ) : null}

              {perfectFor.length > 0 ? (
                <DetailSection title="Perfect for">
                  <div className="flex flex-wrap gap-2">
                    {perfectFor.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-foreground/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </DetailSection>
              ) : null}

              {terms.length > 0 ? (
                <DetailSection title="Terms & conditions">
                  <ul className="space-y-2 text-sm leading-relaxed text-foreground/70">
                    {terms.map((term) => (
                      <li key={term}>{term}</li>
                    ))}
                  </ul>
                </DetailSection>
              ) : null}
            </div>
          </div>

          <SheetFooter className="gap-2 border-t border-border/60 bg-background/95 px-6 py-4 sm:flex-col">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              onClick={() => {
                onAddPackage(pkg)
                onOpenChange(false)
              }}
            >
              Add to booking
            </Button>
            <Button asChild className="w-full rounded-full" size="lg">
              <Link href={bookHref}>Book Package</Link>
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
