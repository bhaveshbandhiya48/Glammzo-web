"use client"

import type { CatalogFilterId } from "@/lib/salons/catalog-utils"
import { CATALOG_FILTER_CHIPS } from "@/lib/salons/catalog-utils"
import { cn } from "@/lib/utils"

type CategoryFilterChipsProps = {
  value: CatalogFilterId
  onChange: (value: CatalogFilterId) => void
  className?: string
}

export function CategoryFilterChips({ value, onChange, className }: CategoryFilterChipsProps) {
  return (
    <div className={cn("-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none", className)}>
      {CATALOG_FILTER_CHIPS.map((chip) => {
        const active = value === chip.id
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              active
                ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                : "border-border/70 bg-background/80 text-foreground/70 hover:border-primary/20 hover:bg-accent/40 hover:text-foreground",
            )}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
