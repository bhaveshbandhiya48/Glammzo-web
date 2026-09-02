import type { SalonPackage, SalonService } from "@/types/salon"

export const SERVICE_GENDER_AUDIENCES = ["men", "women"] as const
export type ServiceGenderAudience = (typeof SERVICE_GENDER_AUDIENCES)[number]

export const SERVICE_GENDER_AUDIENCE_LABELS: Record<ServiceGenderAudience, string> = {
  men: "Men",
  women: "Women's",
}

export function serviceGenderLabel(
  genderAudience: ServiceGenderAudience | null | undefined,
) {
  if (!genderAudience) return null
  return SERVICE_GENDER_AUDIENCE_LABELS[genderAudience]
}

function normalizeBusinessType(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase()
}

export function isUnisexSalonBusiness(value: string | null | undefined) {
  return normalizeBusinessType(value) === "unisex salon"
}

export function parseServiceGenderAudience(value: unknown): ServiceGenderAudience | null {
  if (value === "men" || value === "women") return value
  return null
}

export function serviceMatchesGenderAudience(
  genderAudience: ServiceGenderAudience | null | undefined,
  selected: ServiceGenderAudience,
) {
  if (!genderAudience) return true
  return genderAudience === selected
}

export function filterServicesByGenderAudience(
  services: SalonService[],
  selected: ServiceGenderAudience,
) {
  return services.filter((service) =>
    serviceMatchesGenderAudience(service.genderAudience, selected),
  )
}

export function filterPackagesByGenderAudience(
  packages: SalonPackage[],
  services: SalonService[],
  selected: ServiceGenderAudience,
) {
  const byId = new Map(services.map((service) => [service.id, service]))
  return packages.filter((pkg) => {
    if (pkg.items.length === 0) return true
    return pkg.items.some((item) =>
      serviceMatchesGenderAudience(byId.get(item.serviceId)?.genderAudience, selected),
    )
  })
}
