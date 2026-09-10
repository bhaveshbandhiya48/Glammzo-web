import { trackSiteVisit } from "@/lib/visits/track-site-visit"

export async function POST(request: Request) {
  let body: { locationGranted?: unknown; locationLabel?: unknown }
  try {
    body = (await request.json()) as { locationGranted?: unknown; locationLabel?: unknown }
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }

  const locationGranted = body.locationGranted === true
  const locationLabel =
    typeof body.locationLabel === "string" ? body.locationLabel.trim().slice(0, 120) : null

  try {
    await trackSiteVisit({
      locationGranted,
      locationLabel: locationGranted ? locationLabel : null,
    })
  } catch (error) {
    console.error("[visits] track failed:", error)
  }

  return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } })
}
