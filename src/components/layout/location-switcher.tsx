"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CrosshairIcon, MapPinIcon, SearchIcon, SparklesIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNearMe } from "@/hooks/use-near-me"
import {
  GLAMZZO_LOCATIONS,
  DEFAULT_CITY_NAME,
  type GlamzzoLocation,
  type StoredLocation,
  formatStoredLocationLabel,
  getLocationById,
} from "@/lib/location"
import {
  LOCATION_UPDATED_EVENT,
  buildExploreNearMeHref,
  hasActiveNearMe,
  readStoredLocation,
  writeStoredLocation,
} from "@/lib/location-storage"

type LocationSwitcherProps = {
  className?: string
  /** Compact styling for header placement */
  size?: "sm" | "xs"
}

export function LocationSwitcher({ className, size = "sm" }: LocationSwitcherProps) {
  const [current, setCurrent] = useState<GlamzzoLocation>(() => getLocationById(null))
  const [stored, setStored] = useState<StoredLocation | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { busy: geoBusy, error: geoError, applyNearMe, clearError } = useNearMe()

  const syncFromStorage = () => {
    const parsed = readStoredLocation()
    if (parsed) {
      setCurrent(parsed.location)
      setStored(parsed.stored)
    }
  }

  useEffect(() => {
    try {
      syncFromStorage()
    } catch {
      // localStorage unavailable
    }
  }, [])

  useEffect(() => {
    const onUpdate = () => syncFromStorage()
    window.addEventListener(LOCATION_UPDATED_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [])

  const handleSelect = (loc: GlamzzoLocation) => {
    const next: StoredLocation = { id: loc.id }
    setCurrent(loc)
    setStored(next)
    writeStoredLocation(next)
    setQuery("")
    setOpen(false)
    clearError()
  }

  const handleUseNearMe = async () => {
    clearError()
    const result = await applyNearMe({ navigateToExplore: false })
    if (result) {
      setCurrent(result.location)
      setStored(result.stored)
      setQuery("")
      setOpen(false)
    }
  }

  const displayLabel = stored
    ? formatStoredLocationLabel(current, stored)
    : "Detecting…"
  const isNearMe = hasActiveNearMe(stored)
  const nearMeCityLabel = stored?.city ?? current.label

  const exploreNearHref =
    isNearMe && stored?.latitude != null && stored?.longitude != null
      ? buildExploreNearMeHref(stored.latitude, stored.longitude)
      : "/explore"

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GLAMZZO_LOCATIONS
    return GLAMZZO_LOCATIONS.filter((loc) => {
      const text = `${loc.label} ${loc.areaLabel}`.toLowerCase()
      return text.includes(q)
    })
  }, [query])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size === "xs" ? "xs" : "sm"}
        className={cn(
          "justify-start rounded-full border-border/70 bg-background/70 text-foreground/80",
          size === "xs" ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-xs",
          isNearMe && "border-primary/25 bg-primary/5",
          className
        )}
        onClick={() => setOpen(true)}
        title={isNearMe ? "Using your current location — click to change" : "Change location"}
      >
        <MapPinIcon
          className={cn("mr-1.5 shrink-0 text-primary", size === "xs" ? "size-3" : "size-3.5")}
        />
        <span className={cn("truncate", size === "xs" ? "max-w-[12rem]" : "max-w-[14rem]")}>
          {displayLabel}
        </span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) clearError()
          else syncFromStorage()
        }}
      >
        <DialogContent>
          <DialogHeader className="gap-2">
            <DialogTitle className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <SparklesIcon className="size-4" />
              </span>
              Choose your area
            </DialogTitle>
            <DialogDescription>
              Use Near me to detect your location automatically, or pick an area from the list.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div
              className={cn(
                "rounded-xl border px-3.5 py-3",
                isNearMe
                  ? "border-primary/25 bg-primary/5"
                  : "border-border/70 bg-muted/30"
              )}
              aria-live="polite"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
                Your location
              </p>
              <p className="mt-1 font-medium text-foreground">{displayLabel}</p>
              {isNearMe ? (
                <p className="mt-1 text-xs text-foreground/55">
                  {stored?.inServiceArea
                    ? `Detected from your device — showing salons in ${nearMeCityLabel} nearest to you`
                    : `Detected from your device — Glammzo salons are currently in ${DEFAULT_CITY_NAME}; distances are from your location`}
                </p>
              ) : (
                <p className="mt-1 text-xs text-foreground/55">
                  Select an area below or use Near me
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search areas (e.g., Indiranagar)"
                  className="h-11 w-full rounded-2xl border border-border/70 bg-background/70 pl-9 pr-3 text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
                />
              </div>
              <Button
                type="button"
                variant="default"
                className="h-11 shrink-0 rounded-2xl px-5"
                onClick={handleUseNearMe}
                disabled={geoBusy}
              >
                <CrosshairIcon className="size-4" />
                {geoBusy ? "Detecting…" : "Near me"}
              </Button>
            </div>

            {geoError ? (
              <p
                className="rounded-xl border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                role="alert"
              >
                {geoError}
              </p>
            ) : null}

            {isNearMe ? (
              <Button asChild variant="outline" className="h-10 w-full rounded-2xl">
                <Link href={exploreNearHref}>View nearby salons</Link>
              </Button>
            ) : null}

            <div className="grid gap-2">
              {filtered.map((loc) => {
                const isActive = isNearMe
                  ? Boolean(
                      stored?.inServiceArea &&
                        current?.id === loc.id &&
                        stored?.resolvedArea === loc.areaLabel
                    )
                  : current?.id === loc.id
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/70 bg-background/70 hover:bg-muted/80"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <MapPinIcon className="size-4 text-primary" />
                      <span className="font-medium">
                        {loc.label} <span className="text-foreground/60">· {loc.areaLabel}</span>
                      </span>
                    </span>
                    {isActive ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Current
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Not in your city yet? We&apos;re expanding to more cities soon.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
