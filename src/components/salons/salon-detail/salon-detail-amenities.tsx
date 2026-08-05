"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { amenityIconIdForName } from "@/lib/salons/amenity-catalog"
import { getAmenityIcon } from "@/lib/salons/amenity-icons"
import type { SalonAmenityCategory } from "@/types/salon"
import { cn } from "@/lib/utils"

const PREVIEW_COUNT = 10

type AmenityRow = {
  id: string
  label: string
  icon: string
  group?: string
}

function flattenAmenityRows(categories: SalonAmenityCategory[]): AmenityRow[] {
  const rows: AmenityRow[] = []

  for (const category of categories) {
    const items = category.items?.filter(Boolean) ?? []
    if (items.length > 0) {
      for (const item of items) {
        rows.push({
          id: `${category.name}-${item}`,
          // Grouped legacy data: prefer the item's own icon over the category's.
          icon: amenityIconIdForName(item) ?? category.icon,
          label: item,
          group: category.name,
        })
      }
    } else if (category.name.trim()) {
      rows.push({
        id: category.name,
        label: category.name,
        icon: category.icon,
      })
    }
  }

  return rows
}

function AmenityListItem({
  label,
  iconKey,
  className,
}: {
  label: string
  iconKey: string
  className?: string
}) {
  const Icon = getAmenityIcon(iconKey, label)
  return (
    <li className={cn("flex items-start gap-4", className)}>
      <Icon
        className="mt-0.5 size-6 shrink-0 text-foreground/85"
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="text-[15px] leading-snug text-foreground/90">{label}</span>
    </li>
  )
}

function AmenityGrid({ rows, className }: { rows: AmenityRow[]; className?: string }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2",
        className,
      )}
    >
      {rows.map((row) => (
        <AmenityListItem key={row.id} label={row.label} iconKey={row.icon} />
      ))}
    </ul>
  )
}

export function SalonDetailAmenities({
  categories,
}: {
  categories: SalonAmenityCategory[]
}) {
  const [open, setOpen] = useState(false)
  const rows = useMemo(() => flattenAmenityRows(categories), [categories])

  if (rows.length === 0) return null

  const preview = rows.slice(0, PREVIEW_COUNT)
  const hasMore = rows.length > preview.length

  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8">
        <AmenityGrid rows={preview} />

        {hasMore ? (
          <Button
            type="button"
            variant="outline"
            className="mt-8 h-11 rounded-xl border-foreground/20 px-5 text-sm font-semibold shadow-none hover:bg-muted/40"
            onClick={() => setOpen(true)}
          >
            Show all {rows.length} amenities
          </Button>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(85vh,720px)] max-w-lg overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
              What this place offers
            </DialogTitle>
          </DialogHeader>
          <AmenityGrid rows={rows} className="pt-2" />
        </DialogContent>
      </Dialog>
    </>
  )
}
