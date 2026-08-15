import { jsonError, jsonOk } from "@/lib/auth/mobile-bearer"
import { autocompletePlaces, isGooglePlacesServerConfigured } from "@/lib/maps/google-places-server"

export async function GET(request: Request) {
  if (!isGooglePlacesServerConfigured()) {
    return jsonError(503, "Google Places is not configured.")
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") ?? searchParams.get("input") ?? ""
  const sessionToken = searchParams.get("sessionToken") ?? undefined
  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))

  const result = await autocompletePlaces({
    query,
    sessionToken,
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lng) ? lng : undefined,
  })

  if (!result.ok) {
    return jsonError(502, result.error)
  }

  return jsonOk({ predictions: result.predictions })
}
