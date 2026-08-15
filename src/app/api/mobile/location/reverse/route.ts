import { jsonError, jsonOk } from "@/lib/auth/mobile-bearer"
import {
  isGooglePlacesServerConfigured,
  reverseGeocodeLatLng,
} from "@/lib/maps/google-places-server"

export async function GET(request: Request) {
  if (!isGooglePlacesServerConfigured()) {
    return jsonError(503, "Google Places is not configured.")
  }

  const { searchParams } = new URL(request.url)
  const latitude = Number(searchParams.get("lat"))
  const longitude = Number(searchParams.get("lng"))

  const result = await reverseGeocodeLatLng({ latitude, longitude })
  if (!result.ok) {
    return jsonError(400, result.error)
  }

  return jsonOk({ place: result.place })
}
