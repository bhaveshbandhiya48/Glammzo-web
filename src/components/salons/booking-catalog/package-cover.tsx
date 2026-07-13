"use client"

import Image from "next/image"
import { SparklesIcon } from "lucide-react"

import {
  formatInr,
  getPackageSavings,
  getPackageServiceCount,
  resolvePackageCoverImage,
} from "@/lib/salons/catalog-utils"
import type { SalonPackage } from "@/types/salon"
import { cn } from "@/lib/utils"

type PackageCoverProps = {
  pkg: SalonPackage
  salonName: string
  salonCoverImageUrl: string
  className?: string
}

export function PackageCover({ pkg, salonName, salonCoverImageUrl, className }: PackageCoverProps) {
  const imageUrl = resolvePackageCoverImage(pkg, salonCoverImageUrl)
  const { savings } = getPackageSavings(pkg)
  const serviceCount = getPackageServiceCount(pkg)

  if (imageUrl) {
    return (
      <div className={cn("relative h-[210px] w-full overflow-hidden bg-muted/30", className)}>
        <Image
          src={imageUrl}
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex h-[210px] w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 p-5",
        className,
      )}
    >
      <div className="absolute -top-8 -right-8 size-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 size-28 rounded-full bg-emerald-500/10 blur-2xl" />

      <div className="relative flex items-start gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-background/80 text-primary shadow-sm ring-1 ring-border/60">
          <SparklesIcon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold leading-tight text-foreground">
            {pkg.name}
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            {serviceCount} {serviceCount === 1 ? "Service" : "Services"} Included
          </p>
        </div>
      </div>

      <div className="relative space-y-1">
        {savings > 0 ? (
          <p className="text-sm font-semibold text-emerald-700">Save {formatInr(savings)}</p>
        ) : null}
        <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
          {salonName}
        </p>
      </div>
    </div>
  )
}
