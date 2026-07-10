"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import {
  EXPLORE_CATEGORY_FILTERS,
  EXPLORE_PRICE_FILTERS,
  EXPLORE_RATING_FILTERS,
  EXPLORE_RADIUS_FILTERS,
  EXPLORE_SORT_FILTERS,
  buildExploreHref,
  getExploreCategoryLabel,
  type ExploreSearchState,
} from "@/lib/explore-filters"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type ExploreFiltersProps = {
  state: ExploreSearchState
}

type FilterDropdownProps = {
  label: string
  valueLabel: string
  active?: boolean
  children: (close: () => void) => React.ReactNode
}

function FilterDropdown({ label, valueLabel, active, children }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${valueLabel}`}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
            active
              ? "border-primary/30 bg-primary/10 text-foreground"
              : "border-border/70 bg-card text-foreground/75 hover:border-primary/25 hover:text-foreground"
          )}
        >
          <span className="max-w-[9rem] truncate sm:max-w-none">{valueLabel}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-foreground/45" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1.5" align="start">
        <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
          {label}
        </p>
        <div className="space-y-0.5">{children(close)}</div>
      </PopoverContent>
    </Popover>
  )
}

type FilterOptionProps = {
  href: string
  active: boolean
  onSelect: () => void
  children: React.ReactNode
}

function FilterOption({ href, active, onSelect, children }: FilterOptionProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-foreground"
          : "text-foreground/75 hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <span>{children}</span>
      {active ? <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden /> : null}
    </Link>
  )
}

export function ExploreFilters({ state }: ExploreFiltersProps) {
  const categoryLabel = getExploreCategoryLabel(state.category)
  const sortLabel =
    EXPLORE_SORT_FILTERS.find((filter) => filter.id === state.sort)?.label ?? "Recommended"
  const priceLabel =
    EXPLORE_PRICE_FILTERS.find((filter) => filter.id === state.price)?.label ?? "Any price"
  const ratingLabel =
    EXPLORE_RATING_FILTERS.find((filter) => filter.id === state.rating)?.label ?? "Any rating"
  const radiusLabel =
    EXPLORE_RADIUS_FILTERS.find((filter) => filter.id === state.radius)?.label ??
    "Any distance"
  const availabilityLabel = state.openOnly ? "Open now" : "Any time"

  return (
    <div className="mb-8 flex gap-2 overflow-x-auto pb-0.5 sm:mb-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <FilterDropdown
        label="Service category"
        valueLabel={categoryLabel}
        active={state.category !== "all"}
      >
        {(close) =>
          EXPLORE_CATEGORY_FILTERS.map((filter) => (
            <FilterOption
              key={filter.id}
              href={buildExploreHref(state, { category: filter.id })}
              active={state.category === filter.id}
              onSelect={close}
            >
              {filter.label}
            </FilterOption>
          ))
        }
      </FilterDropdown>

      <FilterDropdown
        label="Sort by"
        valueLabel={sortLabel}
        active={state.sort !== "recommended"}
      >
        {(close) =>
          EXPLORE_SORT_FILTERS.map((filter) => (
            <FilterOption
              key={filter.id}
              href={buildExploreHref(state, { sort: filter.id })}
              active={state.sort === filter.id}
              onSelect={close}
            >
              {filter.label}
            </FilterOption>
          ))
        }
      </FilterDropdown>

      <FilterDropdown label="Price" valueLabel={priceLabel} active={state.price !== "any"}>
        {(close) =>
          EXPLORE_PRICE_FILTERS.map((filter) => (
            <FilterOption
              key={filter.id}
              href={buildExploreHref(state, { price: filter.id })}
              active={state.price === filter.id}
              onSelect={close}
            >
              {filter.label}
            </FilterOption>
          ))
        }
      </FilterDropdown>

      <FilterDropdown label="Rating" valueLabel={ratingLabel} active={state.rating !== "any"}>
        {(close) =>
          EXPLORE_RATING_FILTERS.map((filter) => (
            <FilterOption
              key={filter.id}
              href={buildExploreHref(state, { rating: filter.id })}
              active={state.rating === filter.id}
              onSelect={close}
            >
              {filter.label}
            </FilterOption>
          ))
        }
      </FilterDropdown>

      <FilterDropdown
        label="Radius"
        valueLabel={radiusLabel}
        active={state.radius !== "any"}
      >
        {(close) =>
          EXPLORE_RADIUS_FILTERS.map((filter) => (
            <FilterOption
              key={filter.id}
              href={buildExploreHref(state, { radius: filter.id })}
              active={state.radius === filter.id}
              onSelect={close}
            >
              {filter.label}
            </FilterOption>
          ))
        }
      </FilterDropdown>

      <FilterDropdown
        label="Availability"
        valueLabel={availabilityLabel}
        active={state.openOnly}
      >
        {(close) => (
          <>
            <FilterOption
              href={buildExploreHref(state, { openOnly: false })}
              active={!state.openOnly}
              onSelect={close}
            >
              Any time
            </FilterOption>
            <FilterOption
              href={buildExploreHref(state, { openOnly: true })}
              active={state.openOnly}
              onSelect={close}
            >
              Open now
            </FilterOption>
          </>
        )}
      </FilterDropdown>
    </div>
  )
}
