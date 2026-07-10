import { NextResponse } from "next/server"

import { DEFAULT_NEARBY_RADIUS_KM } from "@/lib/maps/config"
import { fetchNearbySalons } from "@/server/salons/nearby-salons"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const latitude = Number(url.searchParams.get("lat"))
  const longitude = Number(url.searchParams.get("lng"))
  const radiusKm = Number(url.searchParams.get("radius") ?? DEFAULT_NEARBY_RADIUS_KM)
  const query = url.searchParams.get("q") ?? ""

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      { error: "lat and lng query parameters are required." },
      { status: 400 },
    )
  }

  const data = await fetchNearbySalons({
    latitude,
    longitude,
    radiusKm: Number.isFinite(radiusKm) ? radiusKm : DEFAULT_NEARBY_RADIUS_KM,
    query,
  })

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
    },
  })
}
