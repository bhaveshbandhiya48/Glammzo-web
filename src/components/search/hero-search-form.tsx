"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
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

import { HeroAreaPlaceholder } from "@/components/explore/explore-location-copy"
import { siteCopy } from "@/data/site-copy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  POPULAR_AREAS,
  POPULAR_SEARCHES,
  buildExploreHref,
  clearRecentSearches,
  getSearchSuggestions,
  readRecentSearches,
  saveRecentSearch,
  type RecentSearch,
} from "@/lib/search-suggestions"
import { useNearMe } from "@/hooks/use-near-me"
import { useSalonCatalog } from "@/hooks/use-salon-catalog"
import { formatHeroAreaLabel } from "@/lib/location"
import {
  LOCATION_UPDATED_EVENT,
  readStoredLocation,
  writeStoredLocation,
} from "@/lib/location-storage"

const { hero } = siteCopy

type ActivePanel = "query" | "area" | null

type AreaSuggestion = {
  id: string
  label: string
  lat: number
  lon: number
  city?: string | null
  state?: string | null
}

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
  const formRef = useRef<HTMLDivElement>(null)
  const queryId = useId()
  const areaId = useId()
  const panelId = useId()

  const [query, setQuery] = useState("")
  const [area, setArea] = useState("")
  const [areaSelected, setAreaSelected] = useState(false)
  const [areaError, setAreaError] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [recent, setRecent] = useState<RecentSearch[]>([])
  const [areaResults, setAreaResults] = useState<AreaSuggestion[]>([])
  const [areaLoading, setAreaLoading] = useState(false)
  const { busy: nearBusy, applyNearMe } = useNearMe()
  const { salons } = useSalonCatalog()

  const syncAreaFromStorage = useCallback(() => {
    const parsed = readStoredLocation()
    if (!parsed) return
    setArea(formatHeroAreaLabel(parsed.location, parsed.stored))
  }, [])

  useEffect(() => {
    setRecent(readRecentSearches())
    syncAreaFromStorage()
    const onUpdate = () => syncAreaFromStorage()
    window.addEventListener(LOCATION_UPDATED_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [syncAreaFromStorage])

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

  const suggestions = useMemo(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      return { salons: [], services: [], categories: [] }
    }
    return getSearchSuggestions(salons, trimmed)
  }, [salons, query])
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
    if (area.trim() && !areaSelected) {
      setAreaError("Please select a suggested area from the dropdown.")
      setActivePanel("area")
      return
    }
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

  const debouncedAreaQuery = useMemo(() => area.trim(), [area])

  useEffect(() => {
    if (activePanel !== "area") return
    const q = debouncedAreaQuery
    if (!q) {
      setAreaResults([])
      setAreaLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setAreaLoading(true)
      fetch(`/api/locations/autocomplete?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
        .then((data: { items?: AreaSuggestion[] }) => {
          setAreaResults(Array.isArray(data?.items) ? data.items : [])
        })
        .catch(() => {
          setAreaResults([])
        })
        .finally(() => setAreaLoading(false))
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [activePanel, debouncedAreaQuery])

  return (
    <div className={cn("relative mt-8 max-w-xl", panelOpen ? "z-50" : "z-30")}>
      <div
        ref={formRef}
        className={cn(
          "relative rounded-2xl border border-border/80 bg-card shadow-sm shadow-black/[0.04]",
          "transition-[box-shadow,border-color,transform] duration-200 ease-out",
          panelOpen && "border-border/90 shadow-md shadow-black/[0.08]"
        )}
      >
        <form onSubmit={handleSubmit} className="p-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center rounded-xl bg-background/30 px-1">
              <div className="relative min-w-0 flex-[0.9]">
                <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-foreground/45" />
                <Input
                  id={areaId}
                  name="area"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value)
                    setAreaSelected(false)
                    setAreaError(null)
                  }}
                  onFocus={() => setActivePanel("area")}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls={panelId}
                  aria-expanded={activePanel === "area"}
                  className="h-11 border-0 bg-transparent pl-9 shadow-none transition-colors duration-150 focus-visible:ring-0"
                  placeholder=""
                  aria-label="Location"
                />
                {!area ? (
                  <span
                    className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                    aria-hidden
                  >
                    <HeroAreaPlaceholder />
                  </span>
                ) : null}
              </div>

              <span
                aria-hidden
                className="mx-1 hidden h-6 w-px shrink-0 bg-border/80 sm:block"
              />

              <div className="relative min-w-0 flex-[1.1]">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-foreground/45" />
                <Input
                  id={queryId}
                  name="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setActivePanel("query")}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls={panelId}
                  aria-expanded={activePanel === "query"}
                  className="h-11 border-0 bg-transparent pl-9 shadow-none transition-colors duration-150 focus-visible:ring-0"
                  placeholder={hero.searchPlaceholder}
                  aria-label="Search salons or services"
                />
              </div>
            </div>

            <Button type="submit" className="h-11 shrink-0 rounded-xl px-5">
              Search
            </Button>
          </div>
        </form>

        <div
          id={panelId}
          role="listbox"
          aria-labelledby={activePanel === "query" ? queryId : areaId}
          aria-hidden={!panelOpen}
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[min(20rem,60vh)] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg shadow-black/[0.1]",
            "origin-top transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            panelOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          )}
        >
          <div className="max-h-[min(20rem,60vh)] overflow-y-auto">
          {activePanel === "query" ? (
            query.trim() && hasQueryMatches ? (
              <div className="p-2">
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
              {areaError ? (
                <p className="mb-3 rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {areaError}
                </p>
              ) : null}
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
                    setAreaSelected(true)
                    setAreaError(null)
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
                          setAreaSelected(true)
                          setAreaError(null)
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
                {areaLoading ? (
                  <p className="py-4 text-sm text-foreground/55">Searching areas…</p>
                ) : area.trim() && areaResults.length > 0 ? (
                  <div className="space-y-0.5">
                    {areaResults.map((item) => (
                      <SuggestionButton
                        key={item.id}
                        onClick={() => {
                          setArea(item.label)
                          setAreaSelected(true)
                          setAreaError(null)
                          const current = readStoredLocation()
                          if (current?.stored) {
                            writeStoredLocation({
                              ...current.stored,
                              nearMe: false,
                              latitude: item.lat,
                              longitude: item.lon,
                              displayLabel: [item.label, item.state].filter(Boolean).join(", "),
                              city: item.city ?? undefined,
                              state: item.state ?? undefined,
                              country: "India",
                              inServiceArea: false,
                              resolvedArea: undefined,
                              areaLabelOverride: item.label,
                            })
                          }
                          navigate(query, item.label)
                        }}
                      >
                        <MapPinIcon className="size-4 shrink-0 text-primary" />
                        <span>{item.label}</span>
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
        </div>
      </div>
    </div>
  )
}
