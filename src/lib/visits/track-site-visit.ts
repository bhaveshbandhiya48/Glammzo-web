import "server-only"

import { createHash } from "node:crypto"
import { headers } from "next/headers"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

const recentClaims = new Map<string, number>()
const CLAIM_TTL_MS = 30_000

function kolkataYmd(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date)
}

function hashVisitor(ip: string) {
  const salt = process.env.AUTH_SECRET ?? "glamzzo-listing-view"
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32)
}

function claimLocal(key: string) {
  const now = Date.now()
  for (const [entry, at] of recentClaims) {
    if (now - at > CLAIM_TTL_MS) recentClaims.delete(entry)
  }
  const previous = recentClaims.get(key)
  if (previous && now - previous < CLAIM_TTL_MS) {
    return false
  }
  recentClaims.set(key, now)
  return true
}

export async function getRequestVisitorKey() {
  const headerStore = await headers()
  const forwarded = headerStore.get("x-forwarded-for")
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    headerStore.get("cf-connecting-ip")?.trim() ||
    "unknown"
  return hashVisitor(ip)
}

export async function trackSiteVisit(input: {
  locationGranted: boolean
  locationLabel: string | null
}) {
  if (!isSupabaseConfigured()) return

  const visitorKey = await getRequestVisitorKey()
  const dayBucket = kolkataYmd()
  const claimKey = `${visitorKey}:${dayBucket}`
  if (!claimLocal(claimKey)) {
    return
  }

  const locationLabel = input.locationGranted
    ? input.locationLabel?.trim().slice(0, 120) || null
    : null

  const supabase = createAdminClient()
  const existing = await supabase
    .from("web_site_visits")
    .select("id, location_granted")
    .eq("visitor_key", visitorKey)
    .eq("day_bucket", dayBucket)
    .maybeSingle()

  if (existing.data?.id) {
    if (input.locationGranted && existing.data.location_granted !== true) {
      await supabase
        .from("web_site_visits")
        .update({
          location_granted: true,
          location_label: locationLabel,
        })
        .eq("id", existing.data.id)
    }
    return
  }

  if (existing.error && !existing.error.message.toLowerCase().includes("web_site_visits")) {
    console.error("[visits] lookup failed:", existing.error.message)
  }

  const { error } = await supabase.from("web_site_visits").insert({
    visitor_key: visitorKey,
    day_bucket: dayBucket,
    location_granted: input.locationGranted,
    location_label: locationLabel,
    source: "glammzo_web",
  })

  if (error && error.code !== "23505") {
    console.error("[visits] insert failed:", error.message)
  }
}
