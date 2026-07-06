import type { Metadata } from "next"
import Link from "next/link"

import { siteCopy } from "@/data/site-copy"
import { getSalonsByCategory, salons } from "@/data/salons"
import { getSearchParam } from "@/lib/search-params"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { SectionHeader } from "@/components/shared/section-header"
import { ExploreSalonGrid } from "@/components/explore/explore-salon-grid"
import { Footer } from "@/components/sections/parts/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Explore salons",
  description: siteCopy.brand.description,
}

const filters = [
  { id: "all", label: "All" },
  { id: "hair", label: "Hair" },
  { id: "spa", label: "Spa" },
  { id: "nails", label: "Nails" },
  { id: "makeup", label: "Makeup" },
  { id: "grooming", label: "Grooming" },
] as const

type ExploreSearchParams = {
  category?: string | string[]
  q?: string | string[]
  area?: string | string[]
  near?: string | string[]
  lat?: string | string[]
  lng?: string | string[]
}

function filterSalons(list: typeof salons, query: string, area: string) {
  let result = list
  if (query) {
    const q = query.toLowerCase()
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.services.some(
          (svc) =>
            svc.name.toLowerCase().includes(q) || svc.category.toLowerCase().includes(q)
        )
    )
  }
  if (area) {
    const a = area.toLowerCase()
    result = result.filter((s) => s.area.toLowerCase().includes(a))
  }
  return result
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>
}) {
  const params = await searchParams
  const categoryParam = getSearchParam(params.category, "all").toLowerCase()
  const active = filters.some((f) => f.id === categoryParam) ? categoryParam : "all"
  const query = getSearchParam(params.q).trim()
  const area = getSearchParam(params.area).trim()
  const nearMode = getSearchParam(params.near) === "1"
  const latParam = parseFloat(getSearchParam(params.lat))
  const lngParam = parseFloat(getSearchParam(params.lng))
  const urlLatitude = Number.isFinite(latParam) ? latParam : undefined
  const urlLongitude = Number.isFinite(lngParam) ? lngParam : undefined

  const byCategory = getSalonsByCategory(active)
  const list = filterSalons(byCategory, query, nearMode ? "" : area)
  const activeFilterLabel = filters.find((f) => f.id === active)?.label ?? "All"

  const buildFilterHref = (categoryId: string) => {
    const sp = new URLSearchParams()
    if (categoryId !== "all") sp.set("category", categoryId)
    if (query) sp.set("q", query)
    if (nearMode && urlLatitude != null && urlLongitude != null) {
      sp.set("near", "1")
      sp.set("lat", String(urlLatitude))
      sp.set("lng", String(urlLongitude))
    } else if (area) {
      sp.set("area", area)
    }
    const qs = sp.toString()
    return qs ? `/explore?${qs}` : "/explore"
  }

  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow="Explore"
            title="Salons in Bengaluru"
            subtitle="Filter by service, compare ratings and prices, and book when you're ready, with no calls required."
          />
          {(query || area || nearMode) && (
            <p className="mt-4 text-sm text-foreground/55">
              Showing results
              {nearMode ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">near your location</span>
                </>
              ) : null}
              {query ? (
                <>
                  {nearMode ? " · " : " "}
                  for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
                </>
              ) : null}
              {!nearMode && area ? (
                <>
                  {" "}
                  in <span className="font-medium text-foreground">{area}</span>
                </>
              ) : null}
              {" · "}
              <Link href="/explore" className="text-primary underline-offset-2 hover:underline">
                Clear filters
              </Link>
            </p>
          )}
        </PageSection>

        <PageSection tone="statement" separated>
          <SectionHeader
            eyebrow="Results"
            title={
              list.length === 0
                ? "No matches right now"
                : `${list.length} salon${list.length === 1 ? "" : "s"} available`
            }
            subtitle={
              nearMode
                ? `${activeFilterLabel} services · Sorted by distance from you`
                : `${activeFilterLabel} services${area ? ` · ${area}` : " · Bengaluru"}`
            }
            className="mb-6 sm:mb-8"
          />

          <div className="mb-8 flex flex-wrap gap-2 sm:mb-10">
            {filters.map((f) => (
              <Link
                key={f.id}
                href={buildFilterHref(f.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active === f.id
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "border border-border/70 bg-card text-foreground/70 hover:border-primary/25 hover:text-foreground"
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>
          {list.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-border/80 bg-card px-8 py-12 text-center shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03]">
              <p className="font-heading text-lg font-semibold">No salons match yet</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                Try a different category or area. We&apos;re adding partners in Bengaluru every week.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link href="/explore">View all salons</Link>
              </Button>
            </div>
          ) : (
            <ExploreSalonGrid
              salons={list}
              nearFromUrl={nearMode}
              urlLatitude={urlLatitude}
              urlLongitude={urlLongitude}
            />
          )}
        </PageSection>

        <PageSection tone="featured" separated>
          <SectionHeader
            eyebrow="Own a salon?"
            title="Get discovered on Glamzzo"
            subtitle="List your services, accept online bookings, and reach clients searching by area and category in Bengaluru."
            align="center"
            className="mb-8"
          />
          <div className="flex justify-center">
            <Button asChild size="lg" className="h-12 rounded-full px-8">
              <Link href="/partner">Partner with us</Link>
            </Button>
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
