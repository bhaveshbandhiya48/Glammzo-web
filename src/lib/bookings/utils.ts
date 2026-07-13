import type { SalonService } from "@/types/salon"

export function parseServiceIds(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}

export function resolveServices(
  allServices: SalonService[],
  ids: string[]
): SalonService[] {
  return ids
    .map((id) => allServices.find((s) => s.id === id))
    .filter((s): s is SalonService => Boolean(s))
}

export function toggleServiceId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

export function removeOneServiceId(ids: string[], id: string): string[] {
  const index = ids.indexOf(id)
  if (index === -1) return ids
  return [...ids.slice(0, index), ...ids.slice(index + 1)]
}

export function sumServicePrice(services: Pick<SalonService, "price">[]): number {
  return services.reduce((sum, s) => sum + s.price, 0)
}

export function sumServiceDuration(services: Pick<SalonService, "durationMin">[]): number {
  return services.reduce((sum, s) => sum + s.durationMin, 0)
}

export function formatDuration(totalMin: number): string {
  if (totalMin < 60) return `${totalMin} min`
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

export function buildBookHref(
  salonId: string,
  serviceIds: string[],
  authenticated: boolean,
  packageId?: string | null,
): string {
  const params = new URLSearchParams()
  if (serviceIds.length > 0) {
    params.set("services", serviceIds.join(","))
  }
  if (packageId) {
    params.set("package", packageId)
  }

  const qs = params.toString()
  const base = qs ? `/book/${salonId}?${qs}` : `/book/${salonId}`
  return authenticated ? base : `/login?next=${encodeURIComponent(base)}`
}

export function formatBookingDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
