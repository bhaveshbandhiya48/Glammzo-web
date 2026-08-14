"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { useUserLocation } from "@/hooks/use-user-location"
import {
  EXPLORE_AREA_DIRECTORY_PREVIEW,
  buildExploreDirectoryLinks,
} from "@/lib/explore/local-directory"
import { normalizeCityName } from "@/lib/salons/city-filter"
import { Container } from "@/components/layout/container"

type ExploreLocalDirectoryProps = {
  initialCity: string
  areasByCity: Record<string, string[]>
  cityLabels: Record<string, string>
}

export function ExploreLocalDirectory({
  initialCity,
  areasByCity,
  cityLabels,
}: ExploreLocalDirectoryProps) {
  const { browseCity } = useUserLocation()
  const [expanded, setExpanded] = useState(false)

  const cityDisplay = useMemo(() => {
    const preferred = (browseCity || initialCity).trim()
    const key = normalizeCityName(preferred)
    return cityLabels[key] || preferred
  }, [browseCity, cityLabels, initialCity])

  const areas = useMemo(() => {
    const key = normalizeCityName(cityDisplay)
    return areasByCity[key] ?? []
  }, [areasByCity, cityDisplay])

  const links = useMemo(
    () => buildExploreDirectoryLinks(cityDisplay, areas),
    [areas, cityDisplay],
  )

  useEffect(() => {
    setExpanded(false)
  }, [cityDisplay])

  if (links.length === 0) {
    return null
  }

  const visible = expanded ? links : links.slice(0, EXPLORE_AREA_DIRECTORY_PREVIEW)
  const canShowMore = links.length > EXPLORE_AREA_DIRECTORY_PREVIEW

  return (
    <section
      className="border-t border-border/60 bg-background py-10 sm:py-14"
      aria-labelledby="explore-local-directory-heading"
    >
      <Container>
        <h2
          id="explore-local-directory-heading"
          className="text-center font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          Best salons in {cityDisplay}
        </h2>

        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group block min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                  {item.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-foreground/45 lowercase">
                  {cityDisplay}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {canShowMore ? (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        ) : null}
      </Container>
    </section>
  )
}
