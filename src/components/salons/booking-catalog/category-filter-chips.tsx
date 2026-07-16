"use client"

import type { CatalogFilterChip, CatalogFilterId } from "@/lib/salons/catalog-utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CategoryFilterChipsProps = {
  value: CatalogFilterId
  onChange: (value: CatalogFilterId) => void
  chips: CatalogFilterChip[]
  className?: string
}

export function CategoryFilterChips({
  value,
  onChange,
  chips,
  className,
}: CategoryFilterChipsProps) {
  return (
    <div className={cn("-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none", className)}>
      {chips.map((chip) => {
        const active = value === chip.id
        return (
          <Button
            key={chip.id}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            onClick={() => onChange(chip.id)}
            className={cn(
              "shrink-0",
              !active && "border-border/70 bg-background/80 text-foreground/70",
            )}
          >
            {chip.label}
          </Button>
        )
      })}
    </div>
  )
}
