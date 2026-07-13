"use client"

import { motion } from "framer-motion"
import { ClockIcon, Trash2Icon } from "lucide-react"

import { formatInr, formatPackageDuration, getPackageSavings } from "@/lib/salons/catalog-utils"
import type { SalonPackage, SalonService } from "@/types/salon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PackageCartItemProps = {
  pkg: SalonPackage
  services: SalonService[]
  onRemove: () => void
  className?: string
}

export function PackageCartItem({ pkg, services, onRemove, className }: PackageCartItemProps) {
  const savings = getPackageSavings(pkg)
  const duration = formatPackageDuration(pkg, services)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "overflow-hidden rounded-xl border border-primary/25 bg-primary/[0.05]",
        className,
      )}
    >
      <div className="flex h-[4.75rem] items-center gap-3 px-3 sm:px-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Pkg
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{pkg.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {duration ? (
              <>
                <ClockIcon className="size-3 shrink-0" aria-hidden />
                {duration}
              </>
            ) : (
              "Package"
            )}
            {savings.savings > 0 ? (
              <span className="font-medium text-emerald-700">
                · Save {formatInr(savings.savings)}
              </span>
            ) : null}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {formatInr(pkg.packagePrice)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remove ${pkg.name}`}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </motion.div>
  )
}
