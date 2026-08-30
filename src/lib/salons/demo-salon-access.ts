import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import type { Salon } from "@/types/salon"

/** Production demo salon — visible only to allowlisted consumer phones. */
const DEFAULT_DEMO_SALON_IDS = [
  "560a8a2a-94cf-4cdf-b117-f67d1a822da8",
  "glammzo-salon",
]

const DEFAULT_DEMO_VIEWER_PHONES = ["9484516500"]

function parseCsvEnv(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
}

function demoSalonIdSet() {
  const fromEnv = parseCsvEnv(process.env.DEMO_SALON_IDS)
  return new Set(
    [...DEFAULT_DEMO_SALON_IDS, ...fromEnv].map((id) => id.toLowerCase()),
  )
}

function demoViewerPhoneSet() {
  const fromEnv = parseCsvEnv(process.env.DEMO_SALON_VIEWER_PHONES)
  return new Set(
    [...DEFAULT_DEMO_VIEWER_PHONES, ...fromEnv]
      .map((phone) => normalizeCustomerPhoneDigits(phone))
      .filter(Boolean),
  )
}

export function isRestrictedDemoSalonIdentifier(
  ...identifiers: Array<string | null | undefined>
) {
  const ids = demoSalonIdSet()
  return identifiers.some((value) => {
    if (!value?.trim()) return false
    return ids.has(value.trim().toLowerCase())
  })
}

export function isRestrictedDemoSalon(
  salon: Pick<Salon, "id" | "crmSalonId"> & { slug?: string | null },
) {
  return isRestrictedDemoSalonIdentifier(salon.id, salon.crmSalonId, salon.slug)
}

export function canViewerSeeDemoSalons(phone: string | null | undefined) {
  if (!phone?.trim()) return false
  const normalized = normalizeCustomerPhoneDigits(phone)
  if (!normalized) return false
  return demoViewerPhoneSet().has(normalized)
}

export function filterDemoSalonsForViewer<T extends Pick<Salon, "id" | "crmSalonId"> & { slug?: string | null }>(
  salons: T[],
  phone: string | null | undefined,
): T[] {
  if (canViewerSeeDemoSalons(phone)) return salons
  return salons.filter((salon) => !isRestrictedDemoSalon(salon))
}

export function filterDemoSalonRowsForViewer<
  T extends { id: string; slug?: string | null },
>(rows: T[], phone: string | null | undefined): T[] {
  if (canViewerSeeDemoSalons(phone)) return rows
  return rows.filter(
    (row) => !isRestrictedDemoSalonIdentifier(row.id, row.slug),
  )
}
