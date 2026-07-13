import type { SalonCancellationPolicy, SalonReview, SalonService } from "@/types/salon"

export type ServiceDetailContent = {
  highlight: string | null
  about: string | null
  benefits: string[]
  includedSteps: string[]
  recommendedFor: string[]
  thingsToKnow: Array<{ label: string; value: string }>
  productsUsed: string[]
  addOns: SalonService[]
  reviews: SalonReview[]
  rating: number | null
  reviewCount: number
}

export function getServiceCardSummary(service: SalonService): string | null {
  const description = service.description?.trim()
  if (description) {
    const firstLine = description.split(/\n|•|·|;/)[0]?.trim() ?? description
    if (firstLine && firstLine.toLowerCase() !== service.name.toLowerCase()) {
      if (firstLine.length <= 80) return firstLine
      return `${firstLine.slice(0, 77).trim()}…`
    }
  }

  if (service.includes.length >= 2) {
    const summary = service.includes.slice(0, 2).join(" & ")
    if (summary.length <= 80) return summary
  }

  if (service.includes.length === 1) {
    const item = service.includes[0]!.trim()
    if (item.length <= 80 && !item.toLowerCase().startsWith("includes")) {
      return item
    }
  }

  const haystack = `${service.name} ${service.category}`.toLowerCase()
  if (haystack.includes("condition") || haystack.includes("spa")) {
    return "Deep conditioning & scalp massage"
  }
  if (haystack.includes("facial") || haystack.includes("glow")) {
    return "Brightens skin in 30 minutes"
  }
  if (haystack.includes("color") || haystack.includes("colour")) {
    return "Ammonia-free premium coloring"
  }
  if (haystack.includes("beard") || haystack.includes("groom")) {
    return "Relaxing beard styling experience"
  }
  if (haystack.includes("massage")) {
    return "Therapeutic relief for tired muscles"
  }
  if (haystack.includes("manicure") || haystack.includes("nail")) {
    return "Long-lasting polish with nail care"
  }

  return null
}

export function getServiceHighlight(service: SalonService) {
  return getServiceCardSummary(service)
}

export function getServiceAbout(service: SalonService) {
  const description = service.description?.trim()
  if (!description) return null

  if (service.includes.length > 1) {
    const looksLikeBulletList = service.includes.every((item) => description.includes(item))
    if (looksLikeBulletList) return null
  }

  if (service.includes.length === 1 && service.includes[0] === description) {
    return null
  }

  return description
}

export function getServiceBenefits(service: SalonService) {
  // Multi-line descriptions are shown under "What's included" instead.
  if (service.includes.length > 1) {
    return []
  }

  if (service.includes.length === 1) {
    return service.includes
  }

  const about = getServiceAbout(service)
  if (!about) return []

  return about
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 12)
    .slice(0, 4)
}

export function getServiceIncludedSteps(service: SalonService) {
  if (service.includes.length > 1) {
    return service.includes
  }

  return []
}

export function getServiceRecommendedFor(service: SalonService) {
  return service.recommendedFor?.length ? service.recommendedFor : []
}

export function getServiceCareTips(service: SalonService) {
  const items: Array<{ label: string; value: string }> = []

  const beforeCare = service.beforeCare?.trim()
  if (beforeCare) {
    items.push({ label: "Before care", value: beforeCare })
  }

  const afterCare = service.afterCare?.trim()
  if (afterCare) {
    items.push({ label: "After care", value: afterCare })
  }

  return items
}

export function getServiceThingsToKnow(service: SalonService) {
  const items: Array<{ label: string; value: string }> = [
    {
      label: "Appointment duration",
      value: `${service.durationMin} minutes at the salon`,
    },
  ]

  for (const tip of getServiceCareTips(service)) {
    items.push(tip)
  }

  return items
}

export function getServiceAddOns(service: SalonService, allServices: SalonService[]) {
  if (service.addOnIds && service.addOnIds.length > 0) {
    const byId = new Map(allServices.map((entry) => [entry.id, entry]))

    return service.addOnIds
      .map((id) => byId.get(id))
      .filter((entry): entry is SalonService => entry != null && entry.id !== service.id)
      .slice(0, 6)
  }

  return allServices
    .filter(
      (entry) =>
        entry.id !== service.id &&
        entry.category.toLowerCase() === service.category.toLowerCase(),
    )
    .slice(0, 3)
}

export function getServiceReviews(reviews: SalonReview[], service: SalonService) {
  const serviceName = service.name.trim().toLowerCase()
  return reviews.filter((review) => review.serviceName.trim().toLowerCase() === serviceName)
}

export function getServiceRating(reviews: SalonReview[]) {
  if (reviews.length === 0) return null
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return Math.round((total / reviews.length) * 10) / 10
}

export function buildServiceDetailContent(
  service: SalonService,
  allServices: SalonService[],
  salonReviews: SalonReview[],
): ServiceDetailContent {
  const serviceReviews = getServiceReviews(salonReviews, service)
  const benefits = getServiceBenefits(service)
  const includedSteps = getServiceIncludedSteps(service)
  const careTips = getServiceCareTips(service)

  return {
    highlight: getServiceCardSummary(service),
    about: getServiceAbout(service),
    benefits,
    includedSteps,
    recommendedFor: getServiceRecommendedFor(service),
    thingsToKnow: careTips,
    productsUsed: [],
    addOns: getServiceAddOns(service, allServices),
    reviews: serviceReviews.slice(0, 4),
    rating: getServiceRating(serviceReviews),
    reviewCount: serviceReviews.length,
  }
}

export function getPackagePerfectFor(packageName: string, description: string) {
  const haystack = `${packageName} ${description}`.toLowerCase()
  const matches: string[] = []

  if (haystack.includes("bridal") || haystack.includes("wedding")) {
    matches.push("Brides & wedding guests", "Pre-wedding prep", "Special occasions")
  }
  if (haystack.includes("glow") || haystack.includes("facial") || haystack.includes("skin")) {
    matches.push("Skin refresh", "Event-ready glow", "Self-care days")
  }
  if (haystack.includes("hair")) {
    matches.push("Complete hair refresh", "Style makeovers", "Maintenance visits")
  }
  if (haystack.includes("spa") || haystack.includes("relax")) {
    matches.push("Stress relief", "Weekend pampering", "Recovery days")
  }

  if (matches.length === 0) {
    return ["Value seekers", "First-time guests", "Complete salon visits"]
  }

  return [...new Set(matches)].slice(0, 4)
}

export function getPackageBenefits(services: SalonService[]) {
  const unique = new Set<string>()
  for (const service of services) {
    for (const item of getServiceBenefits(service)) {
      unique.add(item)
    }
  }
  return Array.from(unique).slice(0, 6)
}

export function getPackageTerms(policy?: SalonCancellationPolicy) {
  if (!policy) return []

  const terms: string[] = []
  if (policy.freeCancelHours > 0) {
    terms.push(`Free cancellation up to ${policy.freeCancelHours} hours before your appointment.`)
  }
  if (policy.cancellationFeePercent && policy.cancellationFeePercent > 0) {
    terms.push(`Late cancellations may incur a ${policy.cancellationFeePercent}% fee.`)
  }
  if (policy.depositRequired && policy.depositPercent) {
    terms.push(`A ${policy.depositPercent}% deposit may be required to confirm your booking.`)
  }

  return terms
}
