"use client"

import { LayoutGridIcon, MapIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ExploreViewMode = "list" | "map"

type ExploreViewToggleProps = {
  value: ExploreViewMode
  onChange: (value: ExploreViewMode) => void
  className?: string
}

const options: Array<{ id: ExploreViewMode; label: string; icon: typeof LayoutGridIcon }> = [
  { id: "list", label: "List", icon: LayoutGridIcon },
  { id: "map", label: "Map", icon: MapIcon },
]

export function ExploreViewToggle({ value, onChange, className }: ExploreViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Results view"
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-border/70 bg-card/80 p-1 shadow-sm shadow-black/[0.03]",
        className,
      )}
    >
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-foreground/65 hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}

export type { ExploreViewMode }
