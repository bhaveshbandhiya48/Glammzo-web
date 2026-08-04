"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  type GlamzzoLocation,
  type StoredLocation,
  formatStoredLocationLabel,
  getLocationById,
} from "@/lib/location"
import {
  LOCATION_UPDATED_EVENT,
  buildExploreHrefForStoredLocation,
  buildExploreNearMeHref,
  hasActiveNearMe,
  readStoredLocation,
  writeStoredLocation,
} from "@/lib/location-storage"
import { getNearestPopularCities } from "@/lib/salon-coordinates"
import { getSalonAreasForCity } from "@/lib/salons/city-filter"
import { getSignupCityOptions } from "@/lib/salon-onboarding/india"
import { useSalonCatalog } from "@/hooks/use-salon-catalog"

type LocationSwitcherProps = {
  className?: string
  /** Compact styling for header placement */
  size?: "sm" | "xs"
}

const CITY_OPTIONS = getSignupCityOptions()

function titleCaseCity(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export function LocationSwitcher({ className, size = "sm" }: LocationSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [current, setCurrent] = useState<GlamzzoLocation>(() => getLocationById(null))
  const [stored, setStored] = useState<StoredLocation | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { busy: geoBusy, error: geoError, applyNearMe, clearError } = useNearMe()
  const { salons: catalogSalons } = useSalonCatalog()

  const syncFromStorage = () => {
    const parsed = readStoredLocation()
    if (parsed) {
      setCurrent(parsed.location)
      setStored(parsed.stored)
    }
  }

  const refreshAfterLocationChange = (next: StoredLocation) => {
    if (pathname.startsWith("/explore")) {
      router.replace(buildExploreHrefForStoredLocation(next, window.location.search))
      return
    }
    router.refresh()
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

  const handleSelectArea = (loc: GlamzzoLocation) => {
    const next: StoredLocation = { id: loc.id }
    setCurrent(loc)
    setStored(next)
    writeStoredLocation(next)
    setQuery("")
    setOpen(false)
    clearError()
    refreshAfterLocationChange(next)
  }

  const handleSelectCity = (cityName: string) => {
    const city = titleCaseCity(cityName)
    if (!city) return

    const next: StoredLocation = {
      id: "blr_other",
      city,
      nearMe: false,
      inServiceArea: false,
      defaultFallback: false,
    }
    const location = getLocationById(next.id)
    setCurrent(location)
    setStored(next)
    writeStoredLocation(next)
    setQuery("")
    setOpen(false)
    clearError()
    refreshAfterLocationChange(next)
  }

  const handleSelectCityArea = (cityName: string, areaName: string) => {
    const city = titleCaseCity(cityName)
    const area = areaName.trim()
    if (!city || !area) return

    const next: StoredLocation = {
      id: "blr_other",
      city,
      areaLabelOverride: area,
      nearMe: false,
      inServiceArea: false,
      defaultFallback: false,
    }
    const location = getLocationById(next.id)
    setCurrent(location)
    setStored(next)
    writeStoredLocation(next)
    setQuery("")
    setOpen(false)
    clearError()
    refreshAfterLocationChange(next)
  }

  const handleUseNearMe = async () => {
    clearError()
    const result = await applyNearMe({ navigateToExplore: false })
    if (result) {
      setCurrent(result.location)
      setStored(result.stored)
      setQuery("")
      setOpen(false)
      refreshAfterLocationChange(result.stored)
    }
  }

  const displayLabel = stored
    ? formatStoredLocationLabel(current, stored)
    : "Detecting…"
  const isNearMe = hasActiveNearMe(stored)
  const selectedCity = stored?.city?.trim() || null
  const selectedArea = stored?.areaLabelOverride?.trim() || null

  const exploreNearHref =
    isNearMe && stored?.latitude != null && stored?.longitude != null
      ? buildExploreNearMeHref(stored.latitude, stored.longitude)
      : selectedCity
        ? buildExploreHrefForStoredLocation(
            stored ?? { id: "blr_other", city: selectedCity },
          )
        : "/explore"

  const trimmedQuery = query.trim()
  const queryLower = trimmedQuery.toLowerCase()

  const filteredAreas = useMemo(() => {
    if (!queryLower) return GLAMZZO_LOCATIONS
    return GLAMZZO_LOCATIONS.filter((loc) => {
      const text = `${loc.label} ${loc.areaLabel}`.toLowerCase()
      return text.includes(queryLower)
    })
  }, [queryLower])

  const matchingCities = useMemo(() => {
    if (!queryLower || queryLower.length < 2) return []
    return CITY_OPTIONS.filter((city) => city.toLowerCase().includes(queryLower)).slice(0, 8)
  }, [queryLower])

  const browseOriginCity =
    selectedCity ||
    (isNearMe ? stored?.city?.trim() || displayLabel : null) ||
    current.label

  const showBengaluruAreas =
    !selectedCity &&
    (!isNearMe || Boolean(stored?.inServiceArea)) &&
    /bengaluru|bangalore/i.test(browseOriginCity)

  const cityAreas = useMemo(() => {
    if (queryLower || showBengaluruAreas) return []
    return getSalonAreasForCity(catalogSalons, browseOriginCity)
  }, [browseOriginCity, catalogSalons, queryLower, showBengaluruAreas])

  const showCityAreas = cityAreas.length > 0

  const nearestPopularCities = useMemo(() => {
    if (queryLower) return []
    if (showBengaluruAreas || showCityAreas) return []

    return getNearestPopularCities({
      city: browseOriginCity,
      latitude: stored?.latitude,
      longitude: stored?.longitude,
      excludeCity: browseOriginCity,
      limit: 5,
    })
  }, [
    browseOriginCity,
    queryLower,
    showBengaluruAreas,
    showCityAreas,
    stored?.latitude,
    stored?.longitude,
  ])

  const exactCityMatch = matchingCities.some(
    (city) => city.toLowerCase() === queryLower,
  )
  const canSelectTypedCity = trimmedQuery.length >= 2 && !exactCityMatch
  const typedCityLabel = titleCaseCity(trimmedQuery)

  const formatDistanceLabel = (km: number) => {
    if (km < 1) return "Nearby"
    if (km < 10) return `${km.toFixed(1)} km away`
    return `${Math.round(km)} km away`
  }

  const applyPrimarySearchSelection = () => {
    if (!trimmedQuery) return
    if (exactCityMatch) {
      handleSelectCity(matchingCities.find((city) => city.toLowerCase() === queryLower)!)
      return
    }
    if (matchingCities[0]) {
      handleSelectCity(matchingCities[0])
      return
    }
    if (filteredAreas[0] && filteredAreas.length === 1) {
      handleSelectArea(filteredAreas[0])
      return
    }
    handleSelectCity(trimmedQuery)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "justify-start border-border/70 bg-background/70 text-foreground/80",
          (isNearMe || selectedCity) && "border-primary/25 bg-primary/5",
          className
        )}
        onClick={() => setOpen(true)}
        title={isNearMe ? "Using your current location, click to change" : "Change location"}
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
          if (!next) {
            clearError()
            setQuery("")
          } else {
            syncFromStorage()
          }
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
              Search your city, use Near me, or pick a nearby popular city.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div
              className={cn(
                "rounded-xl border px-3.5 py-3",
                isNearMe || selectedCity
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
                  Detected from your device. Salons nearest to you show first.
                </p>
              ) : selectedCity ? (
                <p className="mt-1 text-xs text-foreground/55">
                  Browsing salons in {selectedCity}. Change anytime below.
                </p>
              ) : (
                <p className="mt-1 text-xs text-foreground/55">
                  Search a city like Jamnagar, or use Near me
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      applyPrimarySearchSelection()
                    }
                  }}
                  placeholder="Search city or area (e.g. Jamnagar)"
                  className="h-11 w-full rounded-2xl border border-border/70 bg-background/70 pl-9 pr-3 text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
                  aria-label="Search city or area"
                />
              </div>
              <Button
                type="button"
                variant="default"
                className="shrink-0 px-5"
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

            {trimmedQuery.length >= 2 ? (
              <div className="grid gap-2">
                {canSelectTypedCity ? (
                  <button
                    type="button"
                    onClick={() => handleSelectCity(typedCityLabel)}
                    className="flex items-center justify-between rounded-2xl border border-primary bg-primary/5 px-3.5 py-3 text-left text-sm transition-colors hover:bg-primary/10"
                  >
                    <span className="flex items-center gap-2">
                      <MapPinIcon className="size-4 text-primary" />
                      <span>
                        <span className="font-semibold text-foreground">
                          Select {typedCityLabel}
                        </span>
                        <span className="mt-0.5 block text-xs text-foreground/55">
                          Use this city for browsing and distances
                        </span>
                      </span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Select
                    </span>
                  </button>
                ) : null}

                {matchingCities.map((city) => {
                  const isActive = !isNearMe && selectedCity?.toLowerCase() === city.toLowerCase()
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                        isActive
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/70 bg-background/70 hover:bg-muted/80"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="size-4 text-primary" />
                        <span className="font-medium">{city}</span>
                      </span>
                      {isActive ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-primary">Select</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {isNearMe || selectedCity ? (
              <Button asChild variant="outline" className="w-full">
                <Link
                  href={exploreNearHref}
                  onClick={() => setOpen(false)}
                >
                  View nearby salons
                </Link>
              </Button>
            ) : null}

            <div className="grid gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
                {queryLower
                  ? "Matching areas"
                  : showBengaluruAreas
                    ? "Popular areas"
                    : showCityAreas
                      ? `Areas in ${browseOriginCity}`
                      : `Nearest to ${browseOriginCity}`}
              </p>

              {queryLower ? (
                filteredAreas.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border/70 px-3.5 py-3 text-sm text-foreground/55">
                    No Bengaluru areas match. Select your city from the results above.
                  </p>
                ) : (
                  filteredAreas.map((loc) => {
                    const isActive =
                      !selectedCity &&
                      (isNearMe
                        ? Boolean(
                            stored?.inServiceArea &&
                              current?.id === loc.id &&
                              stored?.resolvedArea === loc.areaLabel,
                          )
                        : current?.id === loc.id && !stored?.city)
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectArea(loc)}
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
                            {loc.label}{" "}
                            <span className="text-foreground/60">· {loc.areaLabel}</span>
                          </span>
                        </span>
                        {isActive ? (
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            Current
                          </span>
                        ) : null}
                      </button>
                    )
                  })
                )
              ) : showBengaluruAreas ? (
                filteredAreas.map((loc) => {
                  const isActive =
                    !selectedCity &&
                    (isNearMe
                      ? Boolean(
                          stored?.inServiceArea &&
                            current?.id === loc.id &&
                            stored?.resolvedArea === loc.areaLabel,
                        )
                      : current?.id === loc.id && !stored?.city)
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectArea(loc)}
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
                          {loc.label}{" "}
                          <span className="text-foreground/60">· {loc.areaLabel}</span>
                        </span>
                      </span>
                      {isActive ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          Current
                        </span>
                      ) : null}
                    </button>
                  )
                })
              ) : showCityAreas ? (
                cityAreas.map((area) => {
                  const isActive =
                    !isNearMe &&
                    selectedCity?.toLowerCase() === browseOriginCity.toLowerCase() &&
                    selectedArea?.toLowerCase() === area.toLowerCase()
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleSelectCityArea(browseOriginCity, area)}
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
                          {browseOriginCity}{" "}
                          <span className="text-foreground/60">· {area}</span>
                        </span>
                      </span>
                      {isActive ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-primary">Select</span>
                      )}
                    </button>
                  )
                })
              ) : nearestPopularCities.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border/70 px-3.5 py-3 text-sm text-foreground/55">
                  Search another city above to continue browsing.
                </p>
              ) : (
                nearestPopularCities.map((city) => {
                  const isActive =
                    !isNearMe && selectedCity?.toLowerCase() === city.name.toLowerCase()
                  return (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => handleSelectCity(city.name)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                        isActive
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/70 bg-background/70 hover:bg-muted/80"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <MapPinIcon className="size-4 shrink-0 text-primary" />
                        <span className="min-w-0">
                          <span className="block font-medium">{city.name}</span>
                          <span className="block text-xs text-foreground/55">
                            {formatDistanceLabel(city.distanceKm)}
                          </span>
                        </span>
                      </span>
                      {isActive ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-primary">Select</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Type your city and tap Select, or press Enter.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
