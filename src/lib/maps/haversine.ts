/**
 * Great-circle distance between two WGS84 points (kilometres).
 * No Google Distance Matrix, pure math.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusKm = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistanceKm(distanceKm: number): string {
  if (!Number.isFinite(distanceKm)) {
    return ""
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`
  }

  return `${distanceKm.toFixed(1)} km away`
}

/** Bounding box deltas for a radius at a given latitude (degrees). */
export function boundingBoxDeltas(latitude: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32
  const lngDelta = radiusKm / (111.32 * Math.cos((latitude * Math.PI) / 180))

  return { latDelta, lngDelta }
}
