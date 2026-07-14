import type { CrmSalonRow } from "@/lib/salons/crm-types"

function readAreaFromSettings(settings: unknown): string {
  if (!settings || typeof settings !== "object") {
    return ""
  }

  const record = settings as Record<string, unknown>
  const onboarding = record.onboarding

  if (onboarding && typeof onboarding === "object") {
    const area = (onboarding as Record<string, unknown>).area
    if (typeof area === "string") {
      return area.trim()
    }
  }

  return ""
}

/** Neighborhood/locality shown on explore cards (e.g. "MG Road · 1.3 km away"). */
export function resolveSalonArea(
  row: Pick<CrmSalonRow, "address_line2" | "city" | "settings">,
  fallback = "Bengaluru",
): string {
  return (
    row.address_line2?.trim() ||
    readAreaFromSettings(row.settings) ||
    row.city?.trim() ||
    fallback
  )
}
