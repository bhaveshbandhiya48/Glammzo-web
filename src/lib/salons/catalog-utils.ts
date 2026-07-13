import { media } from "@/data/media"
import {
  formatDuration,
  resolveServices,
  sumServiceDuration,
} from "@/lib/bookings/utils"
import type { SalonPackage, SalonService } from "@/types/salon"

export type CatalogFilterId =
  | "all"
  | "packages"
  | "hair"
  | "skin"
  | "spa"
  | "bridal"
  | "beard"
  | "kids"
  | "women"
  | "men"

export type CatalogFilterChip = {
  id: CatalogFilterId
  label: string
  keywords: string[]
}

export const CATALOG_FILTER_CHIPS: CatalogFilterChip[] = [
  { id: "all", label: "All", keywords: [] },
  { id: "packages", label: "Packages", keywords: [] },
  { id: "hair", label: "Hair", keywords: ["hair", "cut", "color", "colour", "styling", "blow"] },
  { id: "skin", label: "Skin", keywords: ["skin", "facial", "face", "glow", "cleanup", "detan"] },
  { id: "spa", label: "Spa", keywords: ["spa", "massage", "relax", "body", "aroma"] },
  { id: "bridal", label: "Bridal", keywords: ["bridal", "bride", "wedding", "mehendi", "makeup"] },
  { id: "beard", label: "Beard", keywords: ["beard", "trim", "shave"] },
  { id: "kids", label: "Kids", keywords: ["kid", "child", "children", "junior"] },
  { id: "women", label: "Women", keywords: ["women", "ladies", "woman"] },
  { id: "men", label: "Men", keywords: ["men", "groom", "barber"] },
]

export type PackageBadge = {
  emoji: string
  label: string
}

const PACKAGE_BADGE_DEFS = {
  bestSeller: { emoji: "⭐", label: "Best Seller" },
  mostBooked: { emoji: "🔥", label: "Most Booked" },
  premium: { emoji: "💎", label: "Premium" },
  bestValue: { emoji: "💰", label: "Best Value" },
  bridalSpecial: { emoji: "🎉", label: "Bridal Special" },
  new: { emoji: "🆕", label: "New" },
} as const

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function buildPackageServiceIds(pkg: SalonPackage) {
  return pkg.items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => item.serviceId),
  )
}

export function packageServiceIdsIncluded(
  selectedIds: string[],
  packageServiceIds: string[],
) {
  const pool = [...selectedIds]
  for (const id of packageServiceIds) {
    const index = pool.indexOf(id)
    if (index === -1) return false
    pool.splice(index, 1)
  }
  return true
}

export function getExtraServiceIds(
  selectedIds: string[],
  packageServiceIds: string[] | null | undefined,
) {
  if (!packageServiceIds?.length) return [...selectedIds]

  const pool = [...packageServiceIds]
  const extras: string[] = []

  for (const id of selectedIds) {
    const index = pool.indexOf(id)
    if (index >= 0) {
      pool.splice(index, 1)
    } else {
      extras.push(id)
    }
  }

  return extras
}

export function removePackageServiceIds(
  selectedIds: string[],
  packageServiceIds: string[],
) {
  const pool = [...selectedIds]
  for (const id of packageServiceIds) {
    const index = pool.indexOf(id)
    if (index >= 0) {
      pool.splice(index, 1)
    }
  }
  return pool
}

export function mergePackageWithExtras(
  packageServiceIds: string[],
  selectedIds: string[],
  previousPackageServiceIds: string[] | null | undefined,
) {
  let extras = selectedIds
  if (previousPackageServiceIds?.length) {
    extras = removePackageServiceIds(selectedIds, previousPackageServiceIds)
  }

  const packageIdSet = new Set(packageServiceIds)
  extras = extras.filter((id) => !packageIdSet.has(id))
  return [...packageServiceIds, ...extras]
}

export function groupServicesByCategory(services: SalonService[]) {
  const groups = new Map<string, SalonService[]>()

  for (const service of services) {
    const category = service.category.trim() || "Services"
    const list = groups.get(category) ?? []
    list.push(service)
    groups.set(category, list)
  }

  return Array.from(groups.entries())
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category))
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function haystackForService(service: SalonService) {
  return normalizeText(`${service.name} ${service.category}`)
}

function haystackForPackage(pkg: SalonPackage, services: SalonService[]) {
  const resolved = resolveServices(services, buildPackageServiceIds(pkg))
  const categories = resolved.map((service) => service.category).join(" ")
  return normalizeText(`${pkg.name} ${pkg.description} ${categories}`)
}

export function matchesCatalogFilter(
  haystack: string,
  filterId: CatalogFilterId,
): boolean {
  if (filterId === "all" || filterId === "packages") return true
  const chip = CATALOG_FILTER_CHIPS.find((item) => item.id === filterId)
  if (!chip) return true
  return chip.keywords.some((keyword) => haystack.includes(keyword))
}

export function filterServicesForCatalog(
  services: SalonService[],
  searchQuery: string,
  filterId: CatalogFilterId,
) {
  if (filterId === "packages") return []

  const query = normalizeText(searchQuery)

  return services.filter((service) => {
    const haystack = haystackForService(service)
    if (query && !haystack.includes(query) && !normalizeText(service.category).includes(query)) {
      return false
    }
    return matchesCatalogFilter(haystack, filterId)
  })
}

export function filterPackagesForCatalog(
  packages: SalonPackage[],
  services: SalonService[],
  searchQuery: string,
  filterId: CatalogFilterId,
) {
  const query = normalizeText(searchQuery)

  return packages.filter((pkg) => {
    const haystack = haystackForPackage(pkg, services)
    if (query && !haystack.includes(query) && !normalizeText(pkg.name).includes(query)) {
      return false
    }
    if (filterId === "packages") return true
    return matchesCatalogFilter(haystack, filterId)
  })
}

export function getPackageSavings(pkg: SalonPackage) {
  const shouldShowCompare =
    pkg.showComparePrice && pkg.comparePrice > pkg.packagePrice && pkg.packagePrice > 0
  const savings = shouldShowCompare ? pkg.amountSaved || pkg.comparePrice - pkg.packagePrice : 0
  const savingsPercent =
    shouldShowCompare && pkg.comparePrice > 0
      ? pkg.discountPercent || Math.round((savings / pkg.comparePrice) * 100)
      : 0

  return {
    shouldShowCompare,
    savings: pkg.showSavings ? savings : 0,
    savingsPercent: pkg.showSavings ? savingsPercent : 0,
  }
}

export function getPackageServiceCount(pkg: SalonPackage) {
  return pkg.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function estimatePackageDuration(pkg: SalonPackage, services: SalonService[]) {
  const resolved = resolveServices(services, buildPackageServiceIds(pkg))
  return sumServiceDuration(resolved)
}

export function formatPackageDuration(pkg: SalonPackage, services: SalonService[]) {
  const duration =
    pkg.totalDurationMin > 0 ? pkg.totalDurationMin : estimatePackageDuration(pkg, services)
  return duration > 0 ? formatDuration(duration) : null
}

export function resolvePackageCoverImage(
  pkg: SalonPackage,
  salonCoverImageUrl: string,
): string | null {
  if (pkg.imageUrl?.trim()) return pkg.imageUrl.trim()
  if (salonCoverImageUrl?.trim()) return salonCoverImageUrl.trim()
  return null
}

const CATEGORY_MEDIA_MAP: Array<{ keywords: string[]; image: string }> = [
  { keywords: ["hair", "cut", "color", "colour", "styling"], image: media.categories.hair },
  { keywords: ["nail", "manicure", "pedicure"], image: media.categories.nails },
  { keywords: ["makeup", "bridal", "glam"], image: media.categories.makeup },
  { keywords: ["groom", "beard", "shave", "barber", "men"], image: media.categories.grooming },
  { keywords: ["spa", "massage", "relax", "body"], image: media.categories.spa },
  { keywords: ["skin", "facial", "face"], image: media.categories.spa },
]

export function resolveServiceThumbnail(service: SalonService) {
  if (service.imageUrl?.trim()) return service.imageUrl.trim()
  const haystack = normalizeText(`${service.name} ${service.category}`)
  for (const entry of CATEGORY_MEDIA_MAP) {
    if (entry.keywords.some((keyword) => haystack.includes(keyword))) {
      return entry.image
    }
  }
  return media.categories.spa
}

export function getCategoryIconName(category: string): "hair" | "spa" | "nails" | "makeup" | "grooming" {
  const haystack = normalizeText(category)
  if (haystack.includes("hair")) return "hair"
  if (haystack.includes("nail")) return "nails"
  if (haystack.includes("makeup") || haystack.includes("bridal")) return "makeup"
  if (haystack.includes("groom") || haystack.includes("men")) return "grooming"
  return "spa"
}

const CRM_BADGE_MAP: Record<string, PackageBadge> = {
  best_seller: PACKAGE_BADGE_DEFS.bestSeller,
  most_booked: PACKAGE_BADGE_DEFS.mostBooked,
  bridal_special: PACKAGE_BADGE_DEFS.bridalSpecial,
  festive_offer: { emoji: "🎊", label: "Festive Offer" },
  premium: PACKAGE_BADGE_DEFS.premium,
  limited_time: { emoji: "⏳", label: "Limited Time" },
  new: PACKAGE_BADGE_DEFS.new,
  staff_pick: { emoji: "⭐", label: "Staff Pick" },
}

export function resolvePackageBadge(pkg: SalonPackage): PackageBadge | undefined {
  if (!pkg.badge) return undefined
  return CRM_BADGE_MAP[pkg.badge]
}

export function inferPackageBadges(
  packages: SalonPackage[],
): Map<string, PackageBadge> {
  const badges = new Map<string, PackageBadge>()
  if (packages.length === 0) return badges

  for (const pkg of packages) {
    const resolved = resolvePackageBadge(pkg)
    if (resolved) badges.set(pkg.id, resolved)
  }

  const meta = packages
    .filter((pkg) => !badges.has(pkg.id))
    .map((pkg) => {
    const savings = getPackageSavings(pkg)
    return {
      pkg,
      savings,
      serviceCount: getPackageServiceCount(pkg),
      haystack: `${pkg.name} ${pkg.description}`.toLowerCase(),
    }
  })

  if (meta.length === 0) return badges

  for (const entry of meta) {
    if (
      entry.haystack.includes("bridal") ||
      entry.haystack.includes("wedding") ||
      entry.haystack.includes("bride")
    ) {
      badges.set(entry.pkg.id, PACKAGE_BADGE_DEFS.bridalSpecial)
    }
  }

  const withSavings = meta.filter((entry) => entry.savings.savings > 0)

  if (withSavings.length > 0) {
    const bestValue = withSavings.reduce((best, current) =>
      current.savings.savingsPercent > best.savings.savingsPercent ? current : best,
    )
    if (!badges.has(bestValue.pkg.id)) {
      badges.set(bestValue.pkg.id, PACKAGE_BADGE_DEFS.bestValue)
    }

    const bestSeller = withSavings.reduce((best, current) =>
      current.savings.savings > best.savings.savings ? current : best,
    )
    if (!badges.has(bestSeller.pkg.id)) {
      badges.set(bestSeller.pkg.id, PACKAGE_BADGE_DEFS.bestSeller)
    }
  }

  const mostBooked = meta.reduce((best, current) =>
    current.serviceCount > best.serviceCount ? current : best,
  )
  if (mostBooked.serviceCount > 1 && !badges.has(mostBooked.pkg.id)) {
    badges.set(mostBooked.pkg.id, PACKAGE_BADGE_DEFS.mostBooked)
  }

  const premium = meta.reduce((best, current) =>
    current.pkg.packagePrice > best.pkg.packagePrice ? current : best,
  )
  if (premium.pkg.packagePrice > 0 && !badges.has(premium.pkg.id)) {
    badges.set(premium.pkg.id, PACKAGE_BADGE_DEFS.premium)
  }

  if (packages.length === 1 && !badges.has(packages[0]!.id)) {
    badges.set(packages[0]!.id, PACKAGE_BADGE_DEFS.new)
  }

  return badges
}

export function getPackageTagline(pkg: SalonPackage) {
  const shortDescription = pkg.shortDescription?.trim()
  if (shortDescription) return shortDescription

  const description = pkg.description?.trim()
  if (description) {
    const firstLine = description.split(/\n|•/)[0]?.trim() ?? description
    if (firstLine.length <= 72) return firstLine
    return `${firstLine.slice(0, 69).trim()}…`
  }

  const haystack = `${pkg.name} ${pkg.description}`.toLowerCase()
  if (haystack.includes("bridal") || haystack.includes("wedding")) {
    return "Perfect for weddings and special occasions."
  }
  if (haystack.includes("groom") || haystack.includes("beard") || haystack.includes("men")) {
    return "Complete grooming package."
  }
  if (haystack.includes("spa") || haystack.includes("massage") || haystack.includes("relax")) {
    return "Relaxing spa experience."
  }
  if (haystack.includes("hair")) {
    return "Complete hair refresh in one visit."
  }
  if (haystack.includes("facial") || haystack.includes("skin")) {
    return "Glow-ready skin care in one sitting."
  }

  return "Handpicked services at a better price."
}

export function getPackageIncludedPreview(pkg: SalonPackage, maxVisible = pkg.servicePreviewCount || 3) {
  const names = pkg.items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => item.serviceName),
  )
  const visible = names.slice(0, maxVisible)
  const remaining = Math.max(0, names.length - visible.length)
  return { visible, remaining, total: names.length }
}

export function pickRecommendedPackage(packages: SalonPackage[]) {
  if (packages.length === 0) return null

  const badges = inferPackageBadges(packages)
  const bestValue = packages.find(
    (pkg) => badges.get(pkg.id)?.label === PACKAGE_BADGE_DEFS.bestValue.label,
  )
  if (bestValue) return bestValue

  const ranked = [...packages].sort((a, b) => {
    const savingsA = getPackageSavings(a).savings
    const savingsB = getPackageSavings(b).savings
    if (savingsB !== savingsA) return savingsB - savingsA
    return getPackageServiceCount(b) - getPackageServiceCount(a)
  })

  return ranked[0] ?? null
}

export function buildServicePackageFrequency(packages: SalonPackage[]) {
  const frequency = new Map<string, number>()

  for (const pkg of packages) {
    for (const item of pkg.items) {
      frequency.set(item.serviceId, (frequency.get(item.serviceId) ?? 0) + item.quantity)
    }
  }

  return frequency
}

export type ServiceBadge = {
  emoji: string
  label: string
}

const SERVICE_BADGE_DEFS = {
  mostBooked: { emoji: "🔥", label: "Most Booked" },
  staffPick: { emoji: "⭐", label: "Staff Pick" },
  premium: { emoji: "💎", label: "Premium" },
  express: { emoji: "⚡", label: "Express" },
  signature: { emoji: "👑", label: "Signature" },
  new: { emoji: "🆕", label: "New" },
} as const

export function inferServiceBadges(
  services: SalonService[],
  packageFrequency: Map<string, number>,
): Map<string, ServiceBadge> {
  const badges = new Map<string, ServiceBadge>()
  if (services.length === 0) return badges

  const withMeta = services.map((service) => ({
    service,
    frequency: packageFrequency.get(service.id) ?? 0,
    haystack: `${service.name} ${service.category}`.toLowerCase(),
  }))

  const topBooked = withMeta.reduce((best, current) =>
    current.frequency > best.frequency ? current : best,
  )
  if (topBooked.frequency > 0) {
    badges.set(topBooked.service.id, SERVICE_BADGE_DEFS.mostBooked)
  }

  for (const entry of withMeta) {
    if (!badges.has(entry.service.id) && entry.haystack.includes("signature")) {
      badges.set(entry.service.id, SERVICE_BADGE_DEFS.signature)
    }
  }

  const expressCandidates = withMeta.filter(
    (entry) => entry.service.durationMin <= 30 && !badges.has(entry.service.id),
  )
  if (expressCandidates.length > 0) {
    const fastest = expressCandidates.reduce((best, current) =>
      current.service.durationMin < best.service.durationMin ? current : best,
    )
    badges.set(fastest.service.id, SERVICE_BADGE_DEFS.express)
  }

  const prices = services.map((service) => service.price)
  const maxPrice = Math.max(...prices)
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const premium = withMeta.find((entry) => entry.service.price === maxPrice)
  if (premium && maxPrice > 0 && maxPrice >= averagePrice * 1.15 && !badges.has(premium.service.id)) {
    badges.set(premium.service.id, SERVICE_BADGE_DEFS.premium)
  }

  const ranked = [...withMeta].sort((a, b) => b.frequency - a.frequency)
  const staffPick = ranked.find((entry, index) => index === 1 && entry.frequency > 0)
  if (staffPick && !badges.has(staffPick.service.id)) {
    badges.set(staffPick.service.id, SERVICE_BADGE_DEFS.staffPick)
  }

  return badges
}

export function categoryMatchesFilter(category: string, filterId: CatalogFilterId) {
  if (filterId === "all" || filterId === "packages") return true
  const chip = CATALOG_FILTER_CHIPS.find((item) => item.id === filterId)
  if (!chip) return true
  const haystack = category.trim().toLowerCase()
  return chip.keywords.some((keyword) => haystack.includes(keyword))
}

export function formatCategoryHeading(category: string, count: number) {
  const trimmed = category.trim()
  const label = /services?$/i.test(trimmed) ? trimmed : `${trimmed} Services`
  return `${label} (${count})`
}

export function pickPopularServices(
  services: SalonService[],
  packages: SalonPackage[],
  limit = 4,
) {
  const frequency = buildServicePackageFrequency(packages)

  const ranked = [...services].sort((a, b) => {
    const diff = (frequency.get(b.id) ?? 0) - (frequency.get(a.id) ?? 0)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })

  return ranked.slice(0, limit)
}

export function serviceIdsMatchPackage(selectedIds: string[], pkg: SalonPackage) {
  const expected = buildPackageServiceIds(pkg).sort().join(",")
  const actual = [...selectedIds].sort().join(",")
  return expected.length > 0 && expected === actual
}
