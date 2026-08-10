"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpDownIcon,
  CheckIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"

import {
  EXPLORE_PRICE_FILTERS,
  EXPLORE_RATING_FILTERS,
  EXPLORE_RADIUS_FILTERS,
  EXPLORE_SORT_FILTERS,
  buildExploreHref,
  getExploreCategoryLabel,
  type ExplorePriceId,
  type ExploreRadiusId,
  type ExploreRatingId,
  type ExploreSearchState,
  type ExploreSortId,
} from "@/lib/explore-filters"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

type ExploreFiltersProps = {
  state: ExploreSearchState
  categoryFilters: Array<{ id: string; label: string }>
}

type DraftFilters = {
  category: string
  sort: ExploreSortId
  price: ExplorePriceId
  rating: ExploreRatingId
  radius: ExploreRadiusId
  openOnly: boolean
}

type FilterSectionId =
  | "category"
  | "price"
  | "rating"
  | "radius"
  | "availability"

const FILTER_SECTIONS: Array<{ id: FilterSectionId; label: string }> = [
  { id: "category", label: "Business type" },
  { id: "price", label: "Price" },
  { id: "rating", label: "Rating" },
  { id: "radius", label: "Distance" },
  { id: "availability", label: "Availability" },
]

function toDraft(state: ExploreSearchState): DraftFilters {
  return {
    category: state.category,
    sort: state.sort,
    price: state.price,
    rating: state.rating,
    radius: state.radius,
    openOnly: state.openOnly,
  }
}

function countActiveFilters(draft: DraftFilters) {
  let count = 0
  if (draft.category !== "all") count += 1
  if (draft.price !== "any") count += 1
  if (draft.rating !== "any") count += 1
  if (draft.radius !== "any") count += 1
  if (draft.openOnly) count += 1
  return count
}

function sectionHasActive(section: FilterSectionId, draft: DraftFilters) {
  switch (section) {
    case "category":
      return draft.category !== "all"
    case "price":
      return draft.price !== "any"
    case "rating":
      return draft.rating !== "any"
    case "radius":
      return draft.radius !== "any"
    case "availability":
      return draft.openOnly
  }
}

function OptionRow({
  active,
  onSelect,
  children,
}: {
  active: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5 text-left text-sm transition-colors last:border-b-0",
        active
          ? "bg-primary/8 font-medium text-foreground"
          : "text-foreground/80 hover:bg-muted/40",
      )}
    >
      <span>{children}</span>
      {active ? <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden /> : null}
    </button>
  )
}

export function ExploreFilters({ state, categoryFilters }: ExploreFiltersProps) {
  const router = useRouter()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [mobileSortOpen, setMobileSortOpen] = useState(false)
  const [desktopSortOpen, setDesktopSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<FilterSectionId>("category")
  const [draft, setDraft] = useState<DraftFilters>(() => toDraft(state))

  useEffect(() => {
    if (filterOpen || mobileSortOpen || desktopSortOpen) {
      setDraft(toDraft(state))
    }
  }, [filterOpen, mobileSortOpen, desktopSortOpen, state])

  const activeFilterCount = countActiveFilters(toDraft(state))
  const draftFilterCount = countActiveFilters(draft)
  const sortLabel =
    EXPLORE_SORT_FILTERS.find((filter) => filter.id === state.sort)?.label ?? "Recommended"

  const appliedChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; href: string }> = []
    if (state.category !== "all") {
      chips.push({
        key: "category",
        label:
          categoryFilters.find((filter) => filter.id === state.category)?.label ??
          getExploreCategoryLabel(state.category),
        href: buildExploreHref(state, { category: "all" }),
      })
    }
    if (state.price !== "any") {
      chips.push({
        key: "price",
        label: EXPLORE_PRICE_FILTERS.find((filter) => filter.id === state.price)?.label ?? "Price",
        href: buildExploreHref(state, { price: "any" }),
      })
    }
    if (state.rating !== "any") {
      chips.push({
        key: "rating",
        label:
          EXPLORE_RATING_FILTERS.find((filter) => filter.id === state.rating)?.label ?? "Rating",
        href: buildExploreHref(state, { rating: "any" }),
      })
    }
    if (state.radius !== "any") {
      chips.push({
        key: "radius",
        label:
          EXPLORE_RADIUS_FILTERS.find((filter) => filter.id === state.radius)?.label ?? "Distance",
        href: buildExploreHref(state, { radius: "any" }),
      })
    }
    if (state.openOnly) {
      chips.push({
        key: "open",
        label: "Open now",
        href: buildExploreHref(state, { openOnly: false }),
      })
    }
    if (state.sort !== "recommended") {
      chips.push({
        key: "sort",
        label: sortLabel,
        href: buildExploreHref(state, { sort: "recommended" }),
      })
    }
    return chips
  }, [categoryFilters, sortLabel, state])

  const applyDraft = (next: DraftFilters) => {
    router.push(
      buildExploreHref(state, {
        category: next.category,
        sort: next.sort,
        price: next.price,
        rating: next.rating,
        radius: next.radius,
        openOnly: next.openOnly,
      }),
    )
  }

  const clearFilters = () => {
    const cleared: DraftFilters = {
      category: "all",
      sort: state.sort,
      price: "any",
      rating: "any",
      radius: "any",
      openOnly: false,
    }
    setDraft(cleared)
    applyDraft(cleared)
    setFilterOpen(false)
  }

  const applyFilters = () => {
    applyDraft(draft)
    setFilterOpen(false)
  }

  const applySort = (sort: ExploreSortId) => {
    router.push(buildExploreHref(state, { sort }))
    setMobileSortOpen(false)
    setDesktopSortOpen(false)
  }

  const sortTriggerClassName =
    "inline-flex h-11 w-full items-center justify-center gap-2 px-3 text-sm font-semibold text-foreground md:h-10 md:w-auto md:justify-start md:rounded-full md:border md:border-border/70 md:bg-card md:px-4 md:hover:border-primary/25"

  return (
    <>
      {appliedChips.length > 0 ? (
        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {appliedChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => router.push(chip.href)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 text-xs font-medium text-foreground"
            >
              {chip.label}
              <XIcon className="size-3.5 text-foreground/55" aria-hidden />
              <span className="sr-only">Remove {chip.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm shadow-black/[0.03] md:flex md:gap-2 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:shadow-none">
        <div className="grid grid-cols-2 divide-x divide-border/70 md:flex md:gap-2 md:divide-x-0">
          <button
            type="button"
            onClick={() => setMobileSortOpen(true)}
            className={cn(sortTriggerClassName, "md:hidden")}
          >
            <ArrowUpDownIcon className="size-4 text-foreground/55" aria-hidden />
            <span className="truncate">{sortLabel}</span>
          </button>

          <Popover open={desktopSortOpen} onOpenChange={setDesktopSortOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(sortTriggerClassName, "hidden md:inline-flex")}
                aria-haspopup="listbox"
                aria-expanded={desktopSortOpen}
              >
                <ArrowUpDownIcon className="size-4 text-foreground/55" aria-hidden />
                <span className="truncate">{sortLabel}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-1.5">
              <p className="px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                Sort by
              </p>
              <div role="listbox" aria-label="Sort by">
                {EXPLORE_SORT_FILTERS.map((filter) => {
                  const active = state.sort === filter.id
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => applySort(filter.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-foreground/80 hover:bg-muted/50",
                      )}
                    >
                      <span>{filter.label}</span>
                      {active ? (
                        <CheckIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-foreground md:h-10 md:justify-start md:rounded-full md:border md:border-border/70 md:bg-card md:px-4 md:hover:border-primary/25",
              activeFilterCount > 0 && "md:border-primary/35 md:bg-primary/10",
            )}
          >
            <SlidersHorizontalIcon className="size-4 text-foreground/55" aria-hidden />
            Filter
            {activeFilterCount > 0 ? (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <Sheet open={mobileSortOpen} onOpenChange={setMobileSortOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[75vh] gap-0 rounded-t-2xl p-0 md:hidden"
        >
          <SheetHeader className="border-b border-border/60 p-4 pb-3">
            <SheetTitle>Sort by</SheetTitle>
            <SheetDescription className="sr-only">
              Choose how salons are ordered in explore results.
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {EXPLORE_SORT_FILTERS.map((filter) => (
              <OptionRow
                key={filter.id}
                active={state.sort === filter.id}
                onSelect={() => applySort(filter.id)}
              >
                {filter.label}
              </OptionRow>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          showCloseButton={false}
          className={cn(
            "gap-0 p-0",
            isDesktop ? "w-[min(92vw,420px)]" : "h-[min(92vh,40rem)] rounded-t-2xl",
          )}
        >
          <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60 p-4">
            <div>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription className="sr-only">
                Refine explore results by business type, price, rating, and more.
              </SheetDescription>
            </div>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background"
              aria-label="Close filters"
            >
              <XIcon className="size-4" />
            </button>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <nav
              className="w-[36%] shrink-0 overflow-y-auto border-r border-border/60 bg-muted/30"
              aria-label="Filter categories"
            >
              {FILTER_SECTIONS.map((section) => {
                const active = activeSection === section.id
                const hasValue = sectionHasActive(section.id, draft)
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "relative flex w-full items-start border-b border-border/40 px-3 py-3.5 text-left text-sm transition-colors",
                      active
                        ? "bg-background font-semibold text-foreground"
                        : "text-foreground/70 hover:bg-background/60",
                    )}
                  >
                    {active ? (
                      <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" aria-hidden />
                    ) : null}
                    <span className="leading-snug">
                      {section.label}
                      {hasValue ? (
                        <span className="mt-0.5 block text-[10px] font-medium tracking-wide text-primary uppercase">
                          Applied
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {activeSection === "category"
                ? categoryFilters.map((filter) => (
                    <OptionRow
                      key={filter.id}
                      active={draft.category === filter.id}
                      onSelect={() => setDraft((prev) => ({ ...prev, category: filter.id }))}
                    >
                      {filter.label}
                    </OptionRow>
                  ))
                : null}

              {activeSection === "price"
                ? EXPLORE_PRICE_FILTERS.map((filter) => (
                    <OptionRow
                      key={filter.id}
                      active={draft.price === filter.id}
                      onSelect={() => setDraft((prev) => ({ ...prev, price: filter.id }))}
                    >
                      {filter.label}
                    </OptionRow>
                  ))
                : null}

              {activeSection === "rating"
                ? EXPLORE_RATING_FILTERS.map((filter) => (
                    <OptionRow
                      key={filter.id}
                      active={draft.rating === filter.id}
                      onSelect={() => setDraft((prev) => ({ ...prev, rating: filter.id }))}
                    >
                      {filter.label}
                    </OptionRow>
                  ))
                : null}

              {activeSection === "radius"
                ? EXPLORE_RADIUS_FILTERS.map((filter) => (
                    <OptionRow
                      key={filter.id}
                      active={draft.radius === filter.id}
                      onSelect={() => setDraft((prev) => ({ ...prev, radius: filter.id }))}
                    >
                      {filter.label}
                    </OptionRow>
                  ))
                : null}

              {activeSection === "availability" ? (
                <>
                  <OptionRow
                    active={!draft.openOnly}
                    onSelect={() => setDraft((prev) => ({ ...prev, openOnly: false }))}
                  >
                    Any time
                  </OptionRow>
                  <OptionRow
                    active={draft.openOnly}
                    onSelect={() => setDraft((prev) => ({ ...prev, openOnly: true }))}
                  >
                    Open now
                  </OptionRow>
                </>
              ) : null}
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 border-t border-border/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={clearFilters}
            >
              Clear all
            </Button>
            <Button type="button" className="flex-1 rounded-full" onClick={applyFilters}>
              Apply
              {draftFilterCount > 0 ? ` (${draftFilterCount})` : ""}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
