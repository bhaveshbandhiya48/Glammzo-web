"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { BrowseServicesAccordion } from "@/components/salons/booking-catalog/browse-services-accordion"
import {
  BrowseAccordionSkeleton,
  CatalogPackagesSkeleton,
  FeaturedServicesSkeleton,
} from "@/components/salons/booking-catalog/catalog-skeletons"
import { CatalogSearchBar } from "@/components/salons/booking-catalog/catalog-search-bar"
import { CategoryFilterChips } from "@/components/salons/booking-catalog/category-filter-chips"
import { FeaturedServicesSlider } from "@/components/salons/booking-catalog/featured-services-slider"
import { PackageCatalogRow } from "@/components/salons/booking-catalog/package-catalog-row"
import { PackageDetailSheet } from "@/components/salons/booking-catalog/package-detail-sheet"
import { ServiceDetailSheet } from "@/components/salons/booking-catalog/service-detail-sheet"
import { BookingAssistantSidebar } from "@/components/salons/booking-assistant/booking-assistant-sidebar"
import { useSalonCartSelection } from "@/hooks/use-salon-cart-selection"
import {
  buildCatalogFilterChips,
  buildPackageServiceIds,
  buildServiceBookingFrequency,
  categoryMatchesFilter,
  filterPackagesForCatalog,
  filterServicesForCatalog,
  getExtraServiceIds,
  groupServicesByCategory,
  inferPackageBadges,
  inferServiceBadges,
  mergePackageWithExtras,
  packageServiceIdsIncluded,
  pickMostBookedServices,
  removePackageServiceIds,
  serviceIdsMatchPackage,
  type CatalogFilterId,
} from "@/lib/salons/catalog-utils"
import {
  eligibleServicesForOffer,
} from "@/lib/salons/offer-utils"
import { resolveServices, toggleServiceId, removeOneServiceId } from "@/lib/bookings/utils"
import type {
  SalonOffer,
  SalonPackage,
  SalonReview,
  SalonService,
} from "@/types/salon"
import type { GlammzoOffer } from "@/lib/marketing/glammzo-offers"

type SalonBookingCatalogSectionProps = {
  services: SalonService[]
  packages: SalonPackage[]
  salonId: string
  salonName: string
  salonCoverImageUrl: string
  authenticated: boolean
  customerReviews?: SalonReview[]
  offers?: SalonOffer[]
  glammzoOffers?: GlammzoOffer[]
}

export function SalonBookingCatalogSection({
  services,
  packages,
  salonId,
  salonName,
  salonCoverImageUrl,
  authenticated,
  customerReviews = [],
  offers = [],
  glammzoOffers = [],
}: SalonBookingCatalogSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<CatalogFilterId>("all")
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => new Set())
  const [detailPackageId, setDetailPackageId] = useState<string | null>(null)
  const [detailPackageOpen, setDetailPackageOpen] = useState(false)
  const [detailService, setDetailService] = useState<SalonService | null>(null)
  const [detailServiceOpen, setDetailServiceOpen] = useState(false)

  const [selectedIds, setSelectedIds, packageId, setPackageId] = useSalonCartSelection(
    salonId,
    salonName,
    services,
    {},
    packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      packagePrice: pkg.packagePrice,
      totalDurationMin: pkg.totalDurationMin,
      serviceIds: buildPackageServiceIds(pkg),
    })),
  )

  const browseSectionRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const serviceRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didInitOpen = useRef(false)
  const [hydrated, setHydrated] = useState(false)
  const [highlightedServiceIds, setHighlightedServiceIds] = useState<Set<string>>(
    () => new Set(),
  )

  useEffect(() => {
    setHydrated(true)
  }, [])

  const catalogFilterChips = useMemo(() => buildCatalogFilterChips(services), [services])

  const filteredServices = useMemo(
    () => filterServicesForCatalog(services, searchQuery, activeFilter, catalogFilterChips),
    [services, searchQuery, activeFilter, catalogFilterChips],
  )

  const filteredPackages = useMemo(
    () =>
      filterPackagesForCatalog(packages, services, searchQuery, activeFilter, catalogFilterChips),
    [packages, services, searchQuery, activeFilter, catalogFilterChips],
  )

  const packageBadges = useMemo(() => inferPackageBadges(packages), [packages])

  const bookingFrequency = useMemo(
    () => buildServiceBookingFrequency(services),
    [services],
  )

  const featuredServices = useMemo(() => {
    const top = pickMostBookedServices(services, 4)
    return top.filter((service) => filteredServices.some((entry) => entry.id === service.id))
  }, [services, filteredServices])

  const featuredBadges = useMemo(
    () => inferServiceBadges(featuredServices, bookingFrequency),
    [featuredServices, bookingFrequency],
  )

  const groupedFilteredServices = useMemo(
    () => groupServicesByCategory(filteredServices),
    [filteredServices],
  )

  const selectedServices = useMemo(
    () => resolveServices(services, selectedIds),
    [services, selectedIds],
  )

  const selectedPackage = useMemo(() => {
    if (packageId) {
      return packages.find((pkg) => pkg.id === packageId) ?? null
    }
    return packages.find((pkg) => serviceIdsMatchPackage(selectedIds, pkg)) ?? null
  }, [packages, selectedIds, packageId])

  const extraServices = useMemo(() => {
    if (!selectedPackage) return selectedServices
    const packageServiceIds = buildPackageServiceIds(selectedPackage)
    const extraIds = getExtraServiceIds(selectedIds, packageServiceIds)
    return resolveServices(services, extraIds)
  }, [selectedPackage, selectedIds, selectedServices, services])

  useEffect(() => {
    if (!packageId) return
    const pkg = packages.find((entry) => entry.id === packageId)
    if (!pkg) {
      setPackageId(null)
      return
    }
    if (!packageServiceIdsIncluded(selectedIds, buildPackageServiceIds(pkg))) {
      setPackageId(null)
    }
  }, [selectedIds, packageId, packages, setPackageId])

  const registerCategoryRef = useCallback((category: string, node: HTMLDivElement | null) => {
    if (node) {
      categoryRefs.current.set(category, node)
    } else {
      categoryRefs.current.delete(category)
    }
  }, [])

  const registerServiceRef = useCallback((serviceId: string, node: HTMLDivElement | null) => {
    if (node) {
      serviceRefs.current.set(serviceId, node)
    } else {
      serviceRefs.current.delete(serviceId)
    }
  }, [])

  const handleViewEligibleServices = useCallback(
    (offer: SalonOffer) => {
      const eligible = eligibleServicesForOffer(offer, services)
      if (eligible.length === 0) return

      const categoriesToOpen = new Set(eligible.map((service) => service.category))
      setOpenCategories((current) => {
        const next = new Set(current)
        for (const category of categoriesToOpen) {
          next.add(category)
        }
        return next
      })
      setActiveFilter("all")
      setSearchQuery("")

      const ids = new Set(eligible.map((service) => service.id))
      setHighlightedServiceIds(ids)

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }

      window.requestAnimationFrame(() => {
        browseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        const first = eligible[0]
        if (!first) return
        window.setTimeout(() => {
          serviceRefs.current
            .get(first.id)
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 220)
      })

      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedServiceIds(new Set())
        highlightTimeoutRef.current = null
      }, 2600)
    },
    [services],
  )

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (didInitOpen.current || groupedFilteredServices.length === 0) return
    didInitOpen.current = true
    setOpenCategories(new Set([groupedFilteredServices[0]!.category]))
  }, [groupedFilteredServices])

  useEffect(() => {
    if (openCategories.size === 0) return
    const valid = groupedFilteredServices.map((group) => group.category)
    const pruned = new Set([...openCategories].filter((category) => valid.includes(category)))
    if (pruned.size !== openCategories.size) {
      setOpenCategories(
        pruned.size > 0 ? pruned : new Set(valid[0] ? [valid[0]] : []),
      )
    }
  }, [groupedFilteredServices, openCategories])

  function toggleCategory(category: string) {
    setOpenCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  function scrollToCategory(category: string) {
    const node = categoryRefs.current.get(category)
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      browseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  function handleFilterChange(filterId: CatalogFilterId) {
    setActiveFilter(filterId)

    if (filterId === "all" || filterId === "packages") return

    const match = groupServicesByCategory(
      filterServicesForCatalog(services, searchQuery, filterId),
    ).find((group) => categoryMatchesFilter(group.category, filterId))

    if (match) {
      setOpenCategories(new Set([match.category]))
      window.setTimeout(() => scrollToCategory(match.category), 120)
    } else {
      window.setTimeout(() => {
        browseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 120)
    }
  }

  const detailPackage = useMemo(
    () => packages.find((pkg) => pkg.id === detailPackageId) ?? null,
    [detailPackageId, packages],
  )

  function openPackageDetails(packageId: string) {
    setDetailPackageId(packageId)
    setDetailPackageOpen(true)
  }

  function openServiceDetails(service: SalonService) {
    setDetailService(service)
    setDetailServiceOpen(true)
  }

  function addPackage(pkg: SalonPackage) {
    const packageServiceIds = buildPackageServiceIds(pkg)
    const previousPackage = packageId
      ? packages.find((entry) => entry.id === packageId) ?? null
      : null

    setPackageId(pkg.id)
    setSelectedIds((prev) =>
      mergePackageWithExtras(
        packageServiceIds,
        prev,
        previousPackage ? buildPackageServiceIds(previousPackage) : null,
      ),
    )
  }

  function handleToggleService(id: string) {
    setSelectedIds((prev) => toggleServiceId(prev, id))
  }

  function handleRemoveService(id: string) {
    setSelectedIds((prev) => removeOneServiceId(prev, id))
  }

  function handleClearPackage() {
    if (!selectedPackage) {
      setPackageId(null)
      setSelectedIds([])
      return
    }

    setSelectedIds(removePackageServiceIds(selectedIds, buildPackageServiceIds(selectedPackage)))
    setPackageId(null)
  }

  const showPackages = filteredPackages.length > 0
  const servicesOnlyFilter = activeFilter !== "packages"
  const showFeatured =
    servicesOnlyFilter && featuredServices.length > 0 && !searchQuery.trim()
  const showBrowse = servicesOnlyFilter && filteredServices.length > 0
  const isLoading = !hydrated

  const assistantProps = {
    services,
    offers,
    glammzoOffers,
    selectedIds,
    selectedServices,
    extraServices,
    selectedPackage,
    salonId,
    salonCoverImageUrl,
    authenticated,
    onRemoveService: handleRemoveService,
    onClearPackage: handleClearPackage,
    onAddService: (id: string) => {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    },
    onViewEligibleServices: handleViewEligibleServices,
  }

  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,380px)] lg:gap-8">
        <div className="order-1 min-w-0 space-y-6">
          <div className="sticky top-[calc(4.25rem+env(safe-area-inset-top,0px))] z-30 -mx-5 space-y-2.5 border-b border-border/60 bg-background/95 px-5 pb-3 pt-0 backdrop-blur-xl sm:-mx-7 sm:px-7 lg:static lg:mx-0 lg:space-y-6 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
            <CatalogSearchBar value={searchQuery} onChange={setSearchQuery} />

            <CategoryFilterChips
              value={activeFilter}
              onChange={handleFilterChange}
              chips={catalogFilterChips}
            />
          </div>

          {showPackages ? (
            <section className="space-y-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Recommended Packages
                </h3>
                <p className="mt-1 hidden text-sm text-foreground/60 md:block">
                  Save more when you book together. Use Add to select a package, or open a row for
                  details.
                </p>
              </div>

              {isLoading ? (
                <CatalogPackagesSkeleton count={Math.min(filteredPackages.length || 3, 4)} />
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-sm shadow-black/[0.02]">
                  {filteredPackages.map((pkg) => (
                    <PackageCatalogRow
                      key={pkg.id}
                      pkg={pkg}
                      services={services}
                      salonCoverImageUrl={salonCoverImageUrl}
                      badge={packageBadges.get(pkg.id)}
                      selected={selectedPackage?.id === pkg.id}
                      onOpen={() => openPackageDetails(pkg.id)}
                      onToggle={() => {
                        if (selectedPackage?.id === pkg.id) {
                          handleClearPackage()
                        } else {
                          addPackage(pkg)
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {showFeatured ? (
            <section className="space-y-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Most Booked Services
                </h3>
                <p className="mt-1 hidden text-sm text-foreground/60 md:block">
                  Top picks to help you decide faster. Use Add on a card, or open it for details.
                </p>
              </div>

              {isLoading ? (
                <FeaturedServicesSkeleton count={Math.min(featuredServices.length, 4)} />
              ) : (
                <FeaturedServicesSlider
                  services={featuredServices}
                  badges={featuredBadges}
                  offers={offers}
                  selectedIds={selectedIds}
                  onOpenDetails={openServiceDetails}
                  onToggleService={handleToggleService}
                />
              )}
            </section>
          ) : null}

          {showBrowse ? (
            <section ref={browseSectionRef} className="scroll-mt-24 space-y-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Browse All Services
                </h3>
                <p className="mt-1 hidden text-sm text-foreground/60 md:block">
                  Explore by category. Use Add to select a service, or open a row for details.
                </p>
              </div>

              {isLoading ? (
                <BrowseAccordionSkeleton count={Math.min(groupedFilteredServices.length, 4)} />
              ) : (
                <BrowseServicesAccordion
                  services={filteredServices}
                  offers={offers}
                  openCategories={openCategories}
                  selectedIds={selectedIds}
                  highlightedServiceIds={highlightedServiceIds}
                  onToggleCategory={toggleCategory}
                  onOpenService={openServiceDetails}
                  onToggleService={handleToggleService}
                  searchQuery={searchQuery}
                  registerCategoryRef={registerCategoryRef}
                  registerServiceRef={registerServiceRef}
                />
              )}
            </section>
          ) : null}

          {!showPackages && filteredServices.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/70 py-12 text-center text-sm text-foreground/55">
              No packages or services match your search.
            </p>
          ) : null}
        </div>

        <BookingAssistantSidebar
          {...assistantProps}
          showMobileBar
          className="order-2 lg:sticky lg:top-[5.75rem] lg:self-start"
        />
      </div>

      <PackageDetailSheet
        pkg={detailPackage}
        services={services}
        salonId={salonId}
        salonName={salonName}
        salonCoverImageUrl={salonCoverImageUrl}
        authenticated={authenticated}
        open={detailPackageOpen}
        onOpenChange={setDetailPackageOpen}
        onAddPackage={addPackage}
      />

      <ServiceDetailSheet
        service={detailService}
        allServices={services}
        salonReviews={customerReviews}
        salonId={salonId}
        authenticated={authenticated}
        offers={offers}
        selected={detailService ? selectedIds.includes(detailService.id) : false}
        open={detailServiceOpen}
        onOpenChange={setDetailServiceOpen}
        onToggle={() => {
          if (detailService) handleToggleService(detailService.id)
        }}
        onAddOnToggle={handleToggleService}
        selectedIds={selectedIds}
      />
    </>
  )
}
