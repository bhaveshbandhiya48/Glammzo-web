"use client"

import { useMemo } from "react"
import { ChevronDownIcon } from "lucide-react"

import { ServiceCatalogRow } from "@/components/salons/booking-catalog/service-catalog-row"
import {
  formatCategoryHeading,
  groupServicesByCategory,
} from "@/lib/salons/catalog-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type BrowseServicesAccordionProps = {
  services: SalonService[]
  openCategories: Set<string>
  selectedIds: string[]
  onToggleCategory: (category: string) => void
  onOpenService: (service: SalonService) => void
  onToggleService: (serviceId: string) => void
  searchQuery: string
  registerCategoryRef: (category: string, node: HTMLDivElement | null) => void
}

export function BrowseServicesAccordion({
  services,
  openCategories,
  selectedIds,
  onToggleCategory,
  onOpenService,
  onToggleService,
  searchQuery,
  registerCategoryRef,
}: BrowseServicesAccordionProps) {
  const grouped = useMemo(() => groupServicesByCategory(services), [services])
  const expandAll = searchQuery.trim().length > 0

  if (services.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/70 py-10 text-center text-sm text-foreground/55">
        {searchQuery.trim() ? "No services match your search." : "No services available."}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {grouped.map((group) => {
        const expanded = expandAll || openCategories.has(group.category)

        return (
          <div
            key={group.category}
            ref={(node) => registerCategoryRef(group.category, node)}
            className="overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-sm shadow-black/[0.02]"
          >
            <button
              type="button"
              onClick={() => onToggleCategory(group.category)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-accent/20"
              aria-expanded={expanded}
            >
              <span className="font-heading text-[15px] font-semibold text-foreground">
                {formatCategoryHeading(group.category, group.items.length)}
              </span>
              <ChevronDownIcon
                className={cn(
                  "size-4 text-foreground/45 transition-transform duration-300",
                  expanded && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border/50">
                  {group.items.map((service) => (
                    <ServiceCatalogRow
                      key={service.id}
                      service={service}
                      selected={selectedIds.includes(service.id)}
                      onOpen={() => onOpenService(service)}
                      onToggle={() => onToggleService(service.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
