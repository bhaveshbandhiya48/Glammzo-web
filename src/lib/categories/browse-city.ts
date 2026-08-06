import "server-only"

import { cookies } from "next/headers"

import { GLAMZZO_CITY_COOKIE } from "@/lib/location-city-cookie"

/** Selected browse city from the location cookie (same source Explore uses). */
export async function getBrowseCityFromCookies(): Promise<string | null> {
  const jar = await cookies()
  const raw = jar.get(GLAMZZO_CITY_COOKIE)?.value
  if (!raw) return null
  try {
    return decodeURIComponent(raw).trim() || null
  } catch {
    return raw.trim() || null
  }
}
