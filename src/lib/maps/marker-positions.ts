import type { NearbySalonRecord } from "@/lib/maps/nearby-salon.types"

/** ~30 m offset — enough to separate stacked pins without misleading users far away. */
const SPREAD_RADIUS_DEG = 0.00027

function coordKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(6)}:${longitude.toFixed(6)}`
}

/** Spread salons that share identical coordinates so each marker stays visible. */
export function getSpreadMarkerPositions(
  salons: Pick<NearbySalonRecord, "id" | "latitude" | "longitude">[],
): Map<string, { lat: number; lng: number }> {
  const groups = new Map<string, Pick<NearbySalonRecord, "id" | "latitude" | "longitude">[]>()

  for (const salon of salons) {
    const key = coordKey(salon.latitude, salon.longitude)
    const list = groups.get(key) ?? []
    list.push(salon)
    groups.set(key, list)
  }

  const positions = new Map<string, { lat: number; lng: number }>()

  for (const group of groups.values()) {
    if (group.length === 1) {
      const salon = group[0]!
      positions.set(salon.id, { lat: salon.latitude, lng: salon.longitude })
      continue
    }

    group.forEach((salon, index) => {
      const angle = (2 * Math.PI * index) / group.length
      positions.set(salon.id, {
        lat: salon.latitude + SPREAD_RADIUS_DEG * Math.cos(angle),
        lng: salon.longitude + SPREAD_RADIUS_DEG * Math.sin(angle),
      })
    })
  }

  return positions
}
