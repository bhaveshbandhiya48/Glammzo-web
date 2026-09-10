import Image from "next/image"
import { PackageIcon } from "lucide-react"

import type { SalonPackage } from "@/types/salon"
import { getPackageSavings } from "@/lib/salons/catalog-utils"
import { cn } from "@/lib/utils"

type SalonPackagesSectionProps = {
  packages: SalonPackage[]
}

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function PackagePriceDisplay({ pkg }: { pkg: SalonPackage }) {
  const { shouldShowCompare, savings } = getPackageSavings(pkg)

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">
        {formatInr(pkg.packagePrice)}
      </span>
      {shouldShowCompare ? (
        <span className="text-sm text-foreground/50 line-through tabular-nums">
          {formatInr(pkg.comparePrice)}
        </span>
      ) : null}
      {shouldShowCompare && savings > 0 ? (
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          Save {formatInr(savings)}
        </span>
      ) : null}
    </div>
  )
}

export function SalonPackagesSection({ packages }: SalonPackagesSectionProps) {
  if (packages.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {packages.map((pkg) => (
        <article
          key={pkg.id}
          className={cn(
            "overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm shadow-black/[0.03]",
          )}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
            {pkg.imageUrl ? (
              <Image
                src={pkg.imageUrl}
                alt={pkg.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-foreground/35">
                <PackageIcon className="size-10" />
              </div>
            )}
          </div>

          <div className="space-y-3 p-5">
            <div className="min-w-0">
              <h3 className="font-heading text-lg font-semibold text-foreground wrap-anywhere">
                {pkg.name}
              </h3>
              {pkg.description ? (
                <p className="mt-1 text-sm leading-relaxed text-foreground/65 wrap-anywhere">
                  {pkg.description}
                </p>
              ) : null}
            </div>

            <PackagePriceDisplay pkg={pkg} />

            <ul className="space-y-1.5 border-t border-border/60 pt-3 text-sm text-foreground/70">
              {pkg.items.map((item, index) => (
                <li key={`${pkg.id}-${item.serviceId ?? item.serviceName}-${index}`}>
                  {item.quantity}× {item.serviceName}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  )
}
