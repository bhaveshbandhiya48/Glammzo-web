import "server-only"

function getGoogleMapsServerApiKey() {
  return (
    process.env.GOOGLE_MAPS_SERVER_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  )
}

function getGoogleMapsBrowserApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || ""
}

/** Prefer server key, then browser key (CRM Places often uses the public key). */
function getMapsApiKeys(): string[] {
  const keys = [getGoogleMapsServerApiKey(), getGoogleMapsBrowserApiKey()].filter(Boolean)
  return [...new Set(keys)]
}

export function isGooglePlacesServerConfigured() {
  return getMapsApiKeys().length > 0
}

export type PlacePrediction = {
  placeId: string
  primaryText: string
  secondaryText: string
  description: string
}

export type PlaceDetails = {
  placeId: string
  label: string
  formattedAddress: string
  latitude: number
  longitude: number
  city?: string
  area?: string
  state?: string
}

type AutocompleteResponse = {
  status: string
  error_message?: string
  predictions?: Array<{
    place_id: string
    description: string
    structured_formatting?: {
      main_text?: string
      secondary_text?: string
    }
  }>
}

type DetailsResponse = {
  status: string
  error_message?: string
  result?: {
    place_id?: string
    name?: string
    formatted_address?: string
    geometry?: { location?: { lat?: number; lng?: number } }
    address_components?: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
  }
}

type GeocodeResponse = {
  status: string
  error_message?: string
  results?: Array<{
    place_id?: string
    formatted_address?: string
    geometry?: { location?: { lat?: number; lng?: number } }
    address_components?: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
  }>
}

function readComponent(
  components: Array<{ long_name: string; short_name: string; types: string[] }>,
  type: string,
) {
  return components.find((c) => c.types.includes(type))?.long_name?.trim() || ""
}

function buildLabel(input: {
  name?: string
  area?: string
  city?: string
  formattedAddress?: string
}) {
  if (input.area && input.city && input.area.toLowerCase() !== input.city.toLowerCase()) {
    return `${input.area}, ${input.city}`
  }
  if (input.area) return input.area
  if (input.name && input.city) return `${input.name}, ${input.city}`
  if (input.city) return input.city
  if (input.name) return input.name
  return input.formattedAddress?.split(",").slice(0, 2).join(",").trim() || "Selected location"
}

function parseAddressComponents(
  components: Array<{ long_name: string; short_name: string; types: string[] }>,
) {
  const area =
    readComponent(components, "sublocality_level_1") ||
    readComponent(components, "sublocality") ||
    readComponent(components, "neighborhood") ||
    readComponent(components, "political")
  const city =
    readComponent(components, "locality") ||
    readComponent(components, "administrative_area_level_2")
  const state = readComponent(components, "administrative_area_level_1")
  return { area: area || undefined, city: city || undefined, state: state || undefined }
}

function isPlacesUnauthorized(status: string, message?: string) {
  const haystack = `${status} ${message ?? ""}`.toLowerCase()
  return (
    status === "REQUEST_DENIED" ||
    haystack.includes("not authorized") ||
    haystack.includes("api key") ||
    haystack.includes("not enabled")
  )
}

async function placesAutocompleteWithKey(
  apiKey: string,
  input: {
    query: string
    sessionToken?: string
    latitude?: number
    longitude?: number
  },
): Promise<
  | { ok: true; predictions: PlacePrediction[] }
  | { ok: false; unauthorized?: boolean; error: string }
> {
  const params = new URLSearchParams({
    input: input.query,
    key: apiKey,
    components: "country:in",
    language: "en",
  })
  if (input.sessionToken) params.set("sessiontoken", input.sessionToken)
  if (
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude) &&
    input.latitude != null &&
    input.longitude != null
  ) {
    params.set("location", `${input.latitude},${input.longitude}`)
    params.set("radius", "50000")
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  )

  if (!response.ok) {
    return { ok: false, error: "Places autocomplete failed." }
  }

  const payload = (await response.json()) as AutocompleteResponse
  if (payload.status === "ZERO_RESULTS") {
    return { ok: true, predictions: [] }
  }
  if (payload.status === "OK") {
    return {
      ok: true,
      predictions: (payload.predictions ?? []).slice(0, 8).map((item) => ({
        placeId: item.place_id,
        primaryText: item.structured_formatting?.main_text?.trim() || item.description,
        secondaryText: item.structured_formatting?.secondary_text?.trim() || "",
        description: item.description,
      })),
    }
  }

  return {
    ok: false,
    unauthorized: isPlacesUnauthorized(payload.status, payload.error_message),
    error: payload.error_message || `Places autocomplete status: ${payload.status}`,
  }
}

/** Geocoding-based suggestions — works when Places Autocomplete is not enabled on the key. */
async function geocodeAutocomplete(
  apiKey: string,
  query: string,
): Promise<{ ok: true; predictions: PlacePrediction[] } | { ok: false; error: string }> {
  const params = new URLSearchParams({
    address: query,
    key: apiKey,
    region: "in",
    components: "country:IN",
    language: "en",
  })

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  )

  if (!response.ok) {
    return { ok: false, error: "Location search failed." }
  }

  const payload = (await response.json()) as GeocodeResponse
  if (payload.status === "ZERO_RESULTS") {
    return { ok: true, predictions: [] }
  }
  if (payload.status !== "OK" || !payload.results?.length) {
    return {
      ok: false,
      error: payload.error_message || `Location search status: ${payload.status}`,
    }
  }

  const predictions = payload.results.slice(0, 8).map((result) => {
    const parts = parseAddressComponents(result.address_components ?? [])
    const formatted = result.formatted_address?.trim() || query
    const primary =
      parts.area ||
      parts.city ||
      formatted.split(",")[0]?.trim() ||
      query
    const secondary = [parts.city, parts.state].filter(Boolean).join(", ")
    return {
      placeId: result.place_id || `geo:${formatted}`,
      primaryText: primary,
      secondaryText: secondary || formatted,
      description: formatted,
    }
  })

  return { ok: true, predictions }
}

export async function autocompletePlaces(input: {
  query: string
  sessionToken?: string
  latitude?: number
  longitude?: number
}): Promise<{ ok: true; predictions: PlacePrediction[] } | { ok: false; error: string }> {
  const keys = getMapsApiKeys()
  if (keys.length === 0) {
    return { ok: false, error: "Google Maps is not configured on the server." }
  }

  const query = input.query.trim()
  if (query.length < 2) {
    return { ok: true, predictions: [] }
  }

  let lastError = "Location search failed."
  let placesDenied = false

  for (const key of keys) {
    const places = await placesAutocompleteWithKey(key, { ...input, query })
    if (places.ok) return places
    lastError = places.error
    if (places.unauthorized) {
      placesDenied = true
      continue
    }
  }

  // Places Autocomplete often blocked on server keys; Geocoding usually works (same as Near me).
  if (placesDenied || lastError.toLowerCase().includes("not authorized")) {
    for (const key of keys) {
      const geo = await geocodeAutocomplete(key, query)
      if (geo.ok) return geo
      lastError = geo.error
    }
  }

  return { ok: false, error: lastError }
}

async function placeDetailsWithKey(
  apiKey: string,
  placeId: string,
  sessionToken?: string,
): Promise<
  | { ok: true; place: PlaceDetails }
  | { ok: false; unauthorized?: boolean; error: string }
> {
  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    language: "en",
    fields: "place_id,name,formatted_address,geometry,address_component",
  })
  if (sessionToken) params.set("sessiontoken", sessionToken)

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  )

  if (!response.ok) {
    return { ok: false, error: "Place details failed." }
  }

  const payload = (await response.json()) as DetailsResponse
  if (payload.status === "OK" && payload.result) {
    const result = payload.result
    const latitude = Number(result.geometry?.location?.lat)
    const longitude = Number(result.geometry?.location?.lng)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { ok: false, error: "Place has no coordinates." }
    }
    const parts = parseAddressComponents(result.address_components ?? [])
    const formattedAddress = result.formatted_address?.trim() || result.name || ""
    return {
      ok: true,
      place: {
        placeId: result.place_id || placeId,
        label: buildLabel({
          name: result.name,
          area: parts.area,
          city: parts.city,
          formattedAddress,
        }),
        formattedAddress,
        latitude,
        longitude,
        city: parts.city,
        area: parts.area,
        state: parts.state,
      },
    }
  }

  return {
    ok: false,
    unauthorized: isPlacesUnauthorized(payload.status, payload.error_message),
    error: payload.error_message || `Place details status: ${payload.status}`,
  }
}

async function geocodeByPlaceId(
  apiKey: string,
  placeId: string,
): Promise<{ ok: true; place: PlaceDetails } | { ok: false; error: string }> {
  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    language: "en",
  })

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  )

  if (!response.ok) {
    return { ok: false, error: "Could not resolve that place." }
  }

  const payload = (await response.json()) as GeocodeResponse
  if (payload.status !== "OK" || !payload.results?.[0]) {
    return {
      ok: false,
      error: payload.error_message || `Geocode status: ${payload.status}`,
    }
  }

  const result = payload.results[0]
  const latitude = Number(result.geometry?.location?.lat)
  const longitude = Number(result.geometry?.location?.lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { ok: false, error: "Place has no coordinates." }
  }

  const parts = parseAddressComponents(result.address_components ?? [])
  const formattedAddress = result.formatted_address?.trim() || ""
  return {
    ok: true,
    place: {
      placeId: result.place_id || placeId,
      label: buildLabel({
        area: parts.area,
        city: parts.city,
        formattedAddress,
      }),
      formattedAddress,
      latitude,
      longitude,
      city: parts.city,
      area: parts.area,
      state: parts.state,
    },
  }
}

export async function fetchPlaceDetails(input: {
  placeId: string
  sessionToken?: string
}): Promise<{ ok: true; place: PlaceDetails } | { ok: false; error: string }> {
  const keys = getMapsApiKeys()
  if (keys.length === 0) {
    return { ok: false, error: "Google Maps is not configured on the server." }
  }

  const placeId = input.placeId.trim()
  if (!placeId) {
    return { ok: false, error: "placeId is required." }
  }

  // Synthetic ids from geocode fallback already resolved via description — treat as geocode lookup
  if (placeId.startsWith("geo:")) {
    const address = placeId.slice(4)
    for (const key of keys) {
      const geo = await geocodeAutocomplete(key, address)
      if (geo.ok && geo.predictions[0]) {
        const first = geo.predictions[0]
        if (first.placeId.startsWith("geo:")) continue
        const details = await geocodeByPlaceId(key, first.placeId)
        if (details.ok) return details
      }
    }
  }

  let lastError = "Could not resolve that place."
  let placesDenied = false

  for (const key of keys) {
    const details = await placeDetailsWithKey(key, placeId, input.sessionToken)
    if (details.ok) return details
    lastError = details.error
    if (details.unauthorized) {
      placesDenied = true
      continue
    }
  }

  // Geocoding accepts place_id and is usually enabled on the server key.
  for (const key of keys) {
    const geo = await geocodeByPlaceId(key, placeId)
    if (geo.ok) return geo
    lastError = geo.error
  }

  if (placesDenied) {
    return {
      ok: false,
      error: "Location lookup is limited on this API key. Try Near me or another area.",
    }
  }

  return { ok: false, error: lastError }
}

export async function reverseGeocodeLatLng(input: {
  latitude: number
  longitude: number
}): Promise<{ ok: true; place: PlaceDetails } | { ok: false; error: string }> {
  const keys = getMapsApiKeys()
  if (keys.length === 0) {
    return { ok: false, error: "Google Maps is not configured on the server." }
  }

  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
    return { ok: false, error: "Invalid coordinates." }
  }

  let lastError = "Reverse geocode failed."

  for (const apiKey of keys) {
    const params = new URLSearchParams({
      latlng: `${input.latitude},${input.longitude}`,
      key: apiKey,
      language: "en",
      result_type:
        "neighborhood|sublocality|sublocality_level_1|locality|postal_code|administrative_area_level_2",
    })

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    )

    if (!response.ok) {
      lastError = "Reverse geocode failed."
      continue
    }

    const payload = (await response.json()) as GeocodeResponse
    if (payload.status === "ZERO_RESULTS" || !payload.results?.[0]) {
      return {
        ok: true,
        place: {
          placeId: "",
          label: "Near me",
          formattedAddress: "Current location",
          latitude: input.latitude,
          longitude: input.longitude,
        },
      }
    }
    if (payload.status !== "OK") {
      lastError = payload.error_message || `Reverse geocode status: ${payload.status}`
      continue
    }

    const result = payload.results[0]
    const parts = parseAddressComponents(result.address_components ?? [])
    const formattedAddress = result.formatted_address?.trim() || ""
    return {
      ok: true,
      place: {
        placeId: result.place_id || "",
        label: buildLabel({
          area: parts.area,
          city: parts.city,
          formattedAddress,
        }),
        formattedAddress,
        latitude: input.latitude,
        longitude: input.longitude,
        city: parts.city,
        area: parts.area,
        state: parts.state,
      },
    }
  }

  return { ok: false, error: lastError }
}

/**
 * Resolve up to 3 nearby neighbourhood/area labels around a point by
 * reverse-geocoding slight offsets (not the same pin as “current”).
 */
export async function nearbyAreasFromLatLng(input: {
  latitude: number
  longitude: number
}): Promise<{ ok: true; areas: PlacePrediction[] } | { ok: false; error: string }> {
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
    return { ok: false, error: "Invalid coordinates." }
  }

  const origin = await reverseGeocodeLatLng(input)
  if (!origin.ok) return { ok: false, error: origin.error }

  const currentKeys = new Set(
    [origin.place.area, origin.place.label, origin.place.city]
      .filter(Boolean)
      .map((value) => value!.trim().toLowerCase()),
  )

  // ~1.2–1.8 km offsets in different directions
  const offsets: Array<[number, number]> = [
    [0.014, 0.002],
    [-0.004, 0.014],
    [-0.013, -0.006],
    [0.008, -0.013],
    [0.002, 0.016],
  ]

  const seen = new Set<string>()
  const areas: PlacePrediction[] = []

  for (const [dLat, dLng] of offsets) {
    if (areas.length >= 3) break
    const sample = await reverseGeocodeLatLng({
      latitude: input.latitude + dLat,
      longitude: input.longitude + dLng,
    })
    if (!sample.ok) continue

    const areaName =
      sample.place.area?.trim() ||
      sample.place.label.split(",")[0]?.trim() ||
      ""
    if (!areaName) continue

    const key = areaName.toLowerCase()
    if (currentKeys.has(key) || seen.has(key)) continue
    if (sample.place.city && key === sample.place.city.trim().toLowerCase()) continue

    seen.add(key)
    const city = sample.place.city?.trim()
    areas.push({
      placeId: sample.place.placeId || "",
      primaryText: areaName,
      secondaryText: city && city.toLowerCase() !== key ? city : sample.place.state || "",
      description: sample.place.formattedAddress || sample.place.label,
    })
  }

  return { ok: true, areas: areas.filter((area) => Boolean(area.placeId)).slice(0, 3) }
}
