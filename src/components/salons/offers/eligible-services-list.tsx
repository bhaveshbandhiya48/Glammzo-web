"use client"

import { CheckIcon } from "lucide-react"

import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type EligibleServicesListProps = {
  appliesToAll: boolean
  services: SalonService[]
  maxVisible?: number
  className?: string
}

export function EligibleServicesList({
  appliesToAll,
  services,
  maxVisible = 3,
  className,
}: EligibleServicesListProps) {
  if (appliesToAll) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-foreground/45 uppercase">
          Applies to
        </p>
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <CheckIcon className="size-3.5 text-primary" aria-hidden />
          All services
        </p>
      </div>
    )
  }

  const visible = services.slice(0, maxVisible)
  const remaining = Math.max(0, services.length - visible.length)

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[11px] font-semibold tracking-[0.12em] text-foreground/45 uppercase">
        Eligible services
      </p>
      {visible.length === 0 ? (
        <p className="text-sm text-foreground/55">No matching services in this salon.</p>
      ) : (
        <ul className="space-y-1">
          {visible.map((service) => (
            <li
              key={service.id}
              className="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <CheckIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span className="truncate">{service.name}</span>
            </li>
          ))}
          {remaining > 0 ? (
            <li className="pl-5 text-xs text-foreground/50">+{remaining} more</li>
          ) : null}
        </ul>
      )}
    </div>
  )
}
