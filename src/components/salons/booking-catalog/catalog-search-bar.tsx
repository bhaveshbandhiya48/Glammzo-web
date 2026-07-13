"use client"

import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type CatalogSearchBarProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CatalogSearchBar({ value, onChange, className }: CatalogSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground/40" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search packages or services..."
        className="h-12 rounded-2xl border-border/70 bg-card/60 pl-11 text-[15px] shadow-sm transition-shadow focus-visible:shadow-md"
      />
    </div>
  )
}
