"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  BookingStickySummary,
  MobileBookingBar,
} from "@/components/salons/booking-catalog/booking-sticky-summary"
import { BrowseServicesAccordion } from "@/components/salons/booking-catalog/browse-services-accordion"
import {
  BrowseAccordionSkeleton,
  CatalogPackagesSkeleton,
  FeaturedServicesSkeleton,
} from "@/components/salons/booking-catalog/catalog-skeletons"
import { CatalogSearchBar } from "@/components/salons/booking-catalog/catalog-search-bar"
import { CategoryFilterChips } from "@/components/salons/booking-catalog/category-filter-chips"
import { FeaturedServicesSlider } from "@/components/salons/booking-catalog/featured-services-slider"
import { PackageCard } from "@/components/salons/booking-catalog/package-card"
import { PackageDetailSheet } from "@/components/salons/booking-catalog/package-detail-sheet"
import { ServiceDetailSheet } from "@/components/salons/booking-catalog/service-detail-sheet"
import { useSalonCartSelection } from "@/hooks/use-salon-cart-selection"
import {
  buildCatalogFilterChips,
  buildPackageServiceIds,
  buildServicePackageFrequency,
  categoryMatchesFilter,
  filterPackagesForCatalog,
  filterServicesForCatalog,
  getExtraServiceIds,
  groupServicesByCategory,
  inferPackageBadges,
  inferServiceBadges,
  mergePackageWithExtras,
  packageServiceIdsIncluded,
  pickPopularServices,
  pickRecommendedPackage,
  removePackageServiceIds,
  serviceIdsMatchPackage,
  type CatalogFilterId,
} from "@/lib/salons/catalog-utils"
import { buildBookHref, resolveServices, toggleServiceId, removeOneServiceId } from "@/lib/bookings/utils"
import type {
  SalonCancellationPolicy,
  SalonPackage,
  SalonReview,
  SalonService,
} from "@/types/salon"
import { MotionDiv, MotionSection, stagger } from "@/components/shared/motion"

type SalonBookingCatalogSectionProps = {
  services: SalonService[]
  packages: SalonPackage[]
  salonId: string
  salonName: string
  salonCoverImageUrl: string
  authenticated: boolean
  customerReviews?: SalonReview[]
  cancellationPolicy?: SalonCancellationPolicy
}

export function SalonBookingCatalogSection({
  services,
  packages,
  salonId,
  salonName,
  salonCoverImageUrl,
  authenticated,
  customerReviews = [],
  cancellationPolicy,
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
  const didInitOpen = useRef(false)
  const [hydrated, setHydrated] = useState(false)

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

  const packageFrequency = useMemo(
    () => buildServicePackageFrequency(packages),
    [packages],
  )

  const packageBadges = useMemo(() => inferPackageBadges(packages), [packages])

  const featuredServices = useMemo(() => {
    const top = pickPopularServices(services, packages, 4)
    return top.filter((service) => filteredServices.some((entry) => entry.id === service.id))
  }, [services, packages, filteredServices])

  const featuredBadges = useMemo(
    () => inferServiceBadges(featuredServices, packageFrequency),
    [featuredServices, packageFrequency],
  )

  const recommendedPackage = useMemo(
    () => pickRecommendedPackage(filteredPackages.length > 0 ? filteredPackages : packages),
    [filteredPackages, packages],
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

  const bookHref = buildBookHref(salonId, selectedIds, authenticated, selectedPackage?.id)

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

  function handleClearAll() {
    setPackageId(null)
    setSelectedIds([])
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

  return (
    <>
      <div className="grid items-start gap-8 pb-24 lg:grid-cols-[minmax(0,1fr)_min(100%,360px)] lg:gap-10 lg:pb-0">
        <div className="min-w-0 space-y-8">
          <CatalogSearchBar value={searchQuery} onChange={setSearchQuery} />

          <CategoryFilterChips
            value={activeFilter}
            onChange={handleFilterChange}
            chips={catalogFilterChips}
          />

          {showPackages ? (
            <section className="space-y-4">
              <div>
                <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                  Recommended Packages
                </h3>
                <p className="mt-1 text-sm text-foreground/60">
                  Save more when you book together, handpicked packages with exclusive pricing.
                </p>
              </div>

              {isLoading ? (
                <CatalogPackagesSkeleton count={Math.min(filteredPackages.length, 2)} />
              ) : (
                <MotionSection variants={stagger} whileInView="show" viewport={{ once: true }}>
                  <div className="grid auto-rows-fr gap-5 lg:grid-cols-2">
                    {filteredPackages.map((pkg) => (
                      <MotionDiv key={pkg.id} className="h-full">
                        <PackageCard
                          pkg={pkg}
                          services={services}
                          salonName={salonName}
                          salonCoverImageUrl={salonCoverImageUrl}
                          badge={packageBadges.get(pkg.id)}
                          selected={selectedPackage?.id === pkg.id}
                          onViewDetails={() => openPackageDetails(pkg.id)}
                          onAddPackage={() => addPackage(pkg)}
                        />
                      </MotionDiv>
                    ))}
                  </div>
                </MotionSection>
              )}
            </section>
          ) : null}

          <BookingStickySummary
            className="hidden md:block lg:hidden"
            selectedServices={selectedServices}
            extraServices={extraServices}
            selectedPackage={selectedPackage}
            recommendedPackage={recommendedPackage}
            allServices={services}
            salonId={salonId}
            authenticated={authenticated}
            bookHref={bookHref}
            onRemoveService={handleRemoveService}
            onClearPackage={handleClearPackage}
            onClearAll={handleClearAll}
            onAddRecommendedPackage={addPackage}
            onViewRecommendedPackage={(pkg) => openPackageDetails(pkg.id)}
          />

          {showFeatured ? (
            <section className="space-y-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Most Booked Services
                </h3>
                <p className="mt-1 text-sm text-foreground/60">
                  Top picks to help you decide faster. Tap + to add or open a card for details.
                </p>
              </div>

              {isLoading ? (
                <FeaturedServicesSkeleton count={Math.min(featuredServices.length, 4)} />
              ) : (
                <FeaturedServicesSlider
                  services={featuredServices}
                  badges={featuredBadges}
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
                <p className="mt-1 text-sm text-foreground/60">
                  Explore by category. Tap + to add a service or open a row for details.
                </p>
              </div>

              {isLoading ? (
                <BrowseAccordionSkeleton count={Math.min(groupedFilteredServices.length, 4)} />
              ) : (
                <BrowseServicesAccordion
                  services={filteredServices}
                  openCategories={openCategories}
                  selectedIds={selectedIds}
                  onToggleCategory={toggleCategory}
                  onOpenService={openServiceDetails}
                  onToggleService={handleToggleService}
                  searchQuery={searchQuery}
                  registerCategoryRef={registerCategoryRef}
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

        <BookingStickySummary
          className="hidden lg:block"
          selectedServices={selectedServices}
          extraServices={extraServices}
          selectedPackage={selectedPackage}
          recommendedPackage={recommendedPackage}
          allServices={services}
          salonId={salonId}
          authenticated={authenticated}
          bookHref={bookHref}
          onRemoveService={handleRemoveService}
          onClearPackage={handleClearPackage}
          onClearAll={handleClearAll}
          onAddRecommendedPackage={addPackage}
          onViewRecommendedPackage={(pkg) => openPackageDetails(pkg.id)}
        />
      </div>

      <MobileBookingBar
        selectedServices={selectedServices}
        extraServices={extraServices}
        selectedPackage={selectedPackage}
        bookHref={bookHref}
        salonId={salonId}
        authenticated={authenticated}
      />

      <PackageDetailSheet
        pkg={detailPackage}
        services={services}
        salonId={salonId}
        salonName={salonName}
        salonCoverImageUrl={salonCoverImageUrl}
        authenticated={authenticated}
        cancellationPolicy={cancellationPolicy}
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
