"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ClockIcon,
  CrosshairIcon,
  MapPinIcon,
  ScissorsIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
  StoreIcon,
  TrendingUpIcon,
} from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  POPULAR_AREAS,
  POPULAR_SEARCHES,
  buildExploreHref,
  clearRecentSearches,
  getAreaSuggestions,
  getSearchSuggestions,
  readRecentSearches,
  saveRecentSearch,
  type RecentSearch,
} from "@/lib/search-suggestions"
import { useNearMe } from "@/hooks/use-near-me"
import { readStoredLocation } from "@/lib/location-storage"

const { hero } = siteCopy

type ActivePanel = "query" | "area" | null

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45",
        className
      )}
    >
      {children}
    </p>
  )
}

function SuggestionButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={false}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60"
    >
      {children}
    </button>
  )
}

function ChipButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="cursor-pointer rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-medium text-foreground/75 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
    >
      {label}
    </button>
  )
}

export function HeroSearchForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const queryId = useId()
  const areaId = useId()
  const panelId = useId()

  const [query, setQuery] = useState("")
  const [area, setArea] = useState("")
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [recent, setRecent] = useState<RecentSearch[]>([])
  const { busy: nearBusy, applyNearMe } = useNearMe()

  useEffect(() => {
    setRecent(readRecentSearches())
    const stored = readStoredLocation()
    if (stored?.stored.nearMe) {
      if (stored.stored.inServiceArea && stored.stored.resolvedArea) {
        setArea(stored.stored.resolvedArea)
      } else if (stored.stored.displayLabel) {
        setArea(stored.stored.displayLabel)
      }
    } else if (stored?.location.areaLabel) {
      setArea(stored.location.areaLabel)
    }
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!formRef.current?.contains(event.target as Node)) {
        setActivePanel(null)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePanel(null)
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const suggestions = getSearchSuggestions(query)
  const areaSuggestions = getAreaSuggestions(area)
  const hasQueryMatches =
    suggestions.salons.length > 0 ||
    suggestions.services.length > 0 ||
    suggestions.categories.length > 0

  const navigate = useCallback(
    (nextQ: string, nextArea: string, category?: string) => {
      saveRecentSearch(nextQ, nextArea)
      setRecent(readRecentSearches())
      setActivePanel(null)
      router.push(buildExploreHref(nextQ, nextArea, category))
    },
    [router]
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(query, area)
  }

  const applyRecent = (item: RecentSearch) => {
    setQuery(item.q)
    setArea(item.area)
    navigate(item.q, item.area)
  }

  const handleClearRecent = () => {
    clearRecentSearches()
    setRecent([])
  }

  const panelOpen = activePanel !== null

  return (
    <div className="relative z-30 mt-8 max-w-xl">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm shadow-black/[0.04]",
          panelOpen && "shadow-md shadow-black/[0.06]"
        )}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="p-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div className="relative min-w-0">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-foreground/45" />
              <Input
                id={queryId}
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setActivePanel("query")}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls={panelOpen ? panelId : undefined}
                aria-expanded={activePanel === "query"}
                className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
                placeholder={hero.searchPlaceholder}
                aria-label="Search salons or services"
              />
            </div>

            <div className="relative min-w-0">
              <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-foreground/45" />
              <Input
                id={areaId}
                name="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onFocus={() => setActivePanel("area")}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls={panelOpen ? panelId : undefined}
                aria-expanded={activePanel === "area"}
                className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
                placeholder={hero.locationPlaceholder}
                aria-label="Area"
              />
            </div>

            <Button type="submit" className="h-11 shrink-0 rounded-xl px-5">
              Search
            </Button>
          </div>
        </form>

        {panelOpen ? (
          <div
            id={panelId}
            role="listbox"
            aria-labelledby={activePanel === "query" ? queryId : areaId}
            className="border-t border-border/60 bg-card"
          >
          {activePanel === "query" ? (
            query.trim() && hasQueryMatches ? (
              <div className="max-h-[min(20rem,60vh)] overflow-y-auto p-2">
                {suggestions.salons.length > 0 ? (
                  <div className="mb-1">
                    <SectionLabel className="px-2 py-2">Salons</SectionLabel>
                    {suggestions.salons.map((salon) => (
                      <SuggestionButton
                        key={salon.id}
                        onClick={() => navigate(salon.name, area)}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <StoreIcon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{salon.name}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground/50">
                            <MapPinIcon className="size-3 shrink-0" />
                            <span className="truncate">{salon.area}</span>
                            <span aria-hidden>·</span>
                            <StarIcon className="size-3 shrink-0 fill-primary text-primary" />
                            {salon.rating.toFixed(1)}
                          </span>
                        </span>
                      </SuggestionButton>
                    ))}
                  </div>
                ) : null}

                {suggestions.services.length > 0 ? (
                  <div className="mb-1 border-t border-border/50 pt-1">
                    <SectionLabel className="px-2 py-2">Services</SectionLabel>
                    {suggestions.services.map((svc) => (
                      <SuggestionButton
                        key={`${svc.salonId}-${svc.name}`}
                        onClick={() => navigate(svc.name, area)}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/55">
                          <ScissorsIcon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{svc.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-foreground/50">
                            {svc.salonName} · From ₹{svc.price}
                          </span>
                        </span>
                      </SuggestionButton>
                    ))}
                  </div>
                ) : null}

                {suggestions.categories.length > 0 ? (
                  <div className="border-t border-border/50 pt-1">
                    <SectionLabel className="px-2 py-2">Categories</SectionLabel>
                    {suggestions.categories.map((cat) => (
                      <SuggestionButton
                        key={cat.id}
                        onClick={() => navigate(query, area, cat.id)}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <SparklesIcon className="size-4" />
                        </span>
                        <span className="font-medium">{cat.label} services</span>
                      </SuggestionButton>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : query.trim() && !hasQueryMatches ? (
              <p className="px-4 py-8 text-center text-sm text-foreground/55">
                No matches for &ldquo;{query}&rdquo;. Try a service name or salon.
              </p>
            ) : (
              <div className="p-4">
                {recent.length > 0 ? (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <SectionLabel>Recent searches</SectionLabel>
                      <button
                        type="button"
                        onClick={handleClearRecent}
                        className="cursor-pointer text-[11px] font-medium text-foreground/45 transition-colors hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {recent.map((item) => (
                        <SuggestionButton key={item.ts} onClick={() => applyRecent(item)}>
                          <ClockIcon className="size-4 shrink-0 text-foreground/40" />
                          <span className="min-w-0 truncate">
                            {[item.q, item.area].filter(Boolean).join(" · ") || "Explore salons"}
                          </span>
                        </SuggestionButton>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className={cn(recent.length > 0 && "border-t border-border/50 pt-4")}>
                  <SectionLabel className="mb-3 inline-flex items-center gap-1.5">
                    <TrendingUpIcon className="size-3.5 text-primary" />
                    Popular searches
                  </SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <ChipButton
                        key={term}
                        label={term}
                        onClick={() => {
                          setQuery(term)
                          navigate(term, area)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="p-4">
              <button
                type="button"
                onClick={async () => {
                  const result = await applyNearMe({ navigateToExplore: false, q: query })
                  if (result?.stored.displayLabel) {
                    setArea(
                      result.stored.inServiceArea && result.stored.resolvedArea
                        ? result.stored.resolvedArea
                        : result.stored.displayLabel
                    )
                    setActivePanel(null)
                  }
                }}
                disabled={nearBusy}
                className="mb-4 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CrosshairIcon className="size-4" />
                </span>
                <span>
                  <span className="font-medium text-foreground">
                    {nearBusy ? "Detecting location…" : "Near me"}
                  </span>
                  <span className="mt-0.5 block text-xs text-foreground/55">
                    Use your current location to find nearby salons
                  </span>
                </span>
              </button>

              {!area.trim() ? (
                <div className="mb-4">
                  <SectionLabel className="mb-3">Popular areas</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_AREAS.map((label) => (
                      <ChipButton
                        key={label}
                        label={label}
                        onClick={() => {
                          setArea(label)
                          navigate(query, label)
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className={cn(!area.trim() && "border-t border-border/50 pt-4")}>
                <SectionLabel className="mb-2">
                  {area.trim() ? "Matching areas" : "All areas"}
                </SectionLabel>
                {areaSuggestions.length > 0 ? (
                  <div className="space-y-0.5">
                    {areaSuggestions.map((label) => (
                      <SuggestionButton
                        key={label}
                        onClick={() => {
                          setArea(label)
                          navigate(query, label)
                        }}
                      >
                        <MapPinIcon className="size-4 shrink-0 text-primary" />
                        <span>{label}</span>
                      </SuggestionButton>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-sm text-foreground/55">
                    No areas match &ldquo;{area}&rdquo;. Try Indiranagar or Koramangala.
                  </p>
                )}
              </div>
            </div>
          )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
