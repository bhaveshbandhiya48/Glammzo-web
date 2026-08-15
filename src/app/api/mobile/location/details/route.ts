import { jsonError, jsonOk } from "@/lib/auth/mobile-bearer"
import { fetchPlaceDetails, isGooglePlacesServerConfigured } from "@/lib/maps/google-places-server"

export async function GET(request: Request) {
  if (!isGooglePlacesServerConfigured()) {
    return jsonError(503, "Google Places is not configured.")
  }

  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get("placeId") ?? ""
  const sessionToken = searchParams.get("sessionToken") ?? undefined

  const result = await fetchPlaceDetails({ placeId, sessionToken })
  if (!result.ok) {
    return jsonError(400, result.error)
  }

  return jsonOk({ place: result.place })
}
