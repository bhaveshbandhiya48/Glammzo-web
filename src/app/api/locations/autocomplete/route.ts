export const runtime = "nodejs"

type NominatimAddress = {
  suburb?: string
  neighbourhood?: string
  city_district?: string
  hamlet?: string
  village?: string
  town?: string
  city?: string
  municipality?: string
  county?: string
  state?: string
  country_code?: string
}

type NominatimItem = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: NominatimAddress
}

function pickLocality(address: NominatimAddress | undefined) {
  if (!address) return null
  return (
    address.neighbourhood ||
    address.suburb ||
    address.city_district ||
    address.hamlet ||
    address.village ||
    address.town ||
    address.city ||
    address.municipality ||
    null
  )
}

function pickCity(address: NominatimAddress | undefined) {
  if (!address) return null
  return address.city || address.town || address.village || address.municipality || address.county || null
}

function buildLabel(item: NominatimItem) {
  const locality = pickLocality(item.address)
  const city = pickCity(item.address)
  if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
    return `${locality}, ${city}`
  }
  return locality || city || item.display_name.split(",").slice(0, 2).join(",").trim()
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get("q") ?? "").trim()

  if (q.length < 2) {
    return Response.json({ items: [] })
  }

  const nominatim = new URL("https://nominatim.openstreetmap.org/search")
  nominatim.searchParams.set("format", "jsonv2")
  nominatim.searchParams.set("addressdetails", "1")
  nominatim.searchParams.set("limit", "8")
  nominatim.searchParams.set("countrycodes", "in")
  nominatim.searchParams.set("q", q)

  const res = await fetch(nominatim.toString(), {
    headers: {
      accept: "application/json",
      "accept-language": "en",
      // Nominatim requires an identifying User-Agent.
      "user-agent": "Glammzo-web (local dev)",
    },
    // Reasonable caching to avoid rate limits while typing.
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return Response.json({ items: [] }, { status: 200 })
  }

  const data = (await res.json()) as NominatimItem[]

  const items = (data ?? [])
    .filter((item) => item.address?.country_code?.toLowerCase() === "in" || true)
    .map((item) => {
      const label = buildLabel(item)
      return {
        id: String(item.place_id),
        label,
        lat: Number(item.lat),
        lon: Number(item.lon),
        locality: pickLocality(item.address),
        city: pickCity(item.address),
        state: item.address?.state ?? null,
      }
    })
    .filter((item) => item.label)

  return Response.json({ items })
}

