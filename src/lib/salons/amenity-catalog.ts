/**
 * Amenity icon ids mirrored from the CRM catalog
 * (`GROWTH_AMENITY_CATALOG` / `MARKETPLACE_AMENITY_OPTIONS`).
 * Keep in sync so a salon sees the same icon in CRM and on the public listing.
 */

export const AMENITY_CATALOG = [
  { icon: "CircleParking", name: "Parking" },
  { icon: "Car", name: "Valet Parking" },
  { icon: "Wifi", name: "WiFi" },
  { icon: "AirVent", name: "Air Conditioning" },
  { icon: "Zap", name: "Power Backup" },
  { icon: "Plug", name: "Charging Points" },
  { icon: "CreditCard", name: "Card Payment" },
  { icon: "Smartphone", name: "UPI Payments" },
  { icon: "Accessibility", name: "Wheelchair Accessible" },
  { icon: "ArrowUpDown", name: "Elevator" },
  { icon: "Bath", name: "Washroom" },
  { icon: "Baby", name: "Kids Friendly" },
  { icon: "PawPrint", name: "Pet Friendly" },
  { icon: "Armchair", name: "Waiting Area" },
  { icon: "Venus", name: "Women-only Space" },
  { icon: "DoorClosed", name: "Private Treatment Rooms" },
  { icon: "DoorOpen", name: "Changing Room" },
  { icon: "GlassWater", name: "Drinking Water" },
  { icon: "Coffee", name: "Refreshments" },
  { icon: "ShieldCheck", name: "Sanitized Equipment" },
  { icon: "SprayCan", name: "Disposable Tools" },
  { icon: "Cctv", name: "CCTV Security" },
] as const

/** Icon ids the web can render, including legacy ids kept for older listings. */
export const AMENITY_ICON_IDS = new Set<string>([
  ...AMENITY_CATALOG.map((amenity) => amenity.icon),
  "ParkingCircle",
  "Nfc",
  "Sparkles",
])

/** Retired amenity labels that still exist on older listings. */
const AMENITY_NAME_ALIASES: Record<string, string> = {
  "free parking": "Parking",
  "contactless payments": "Card Payment",
  "kids' waiting area": "Kids Friendly",
  "kids waiting area": "Kids Friendly",
  wifi: "WiFi",
  "wi-fi": "WiFi",
  "free wifi": "WiFi",
  ac: "Air Conditioning",
  "air conditioned": "Air Conditioning",
  "card payments": "Card Payment",
  upi: "UPI Payments",
  "wheelchair access": "Wheelchair Accessible",
  restroom: "Washroom",
  washrooms: "Washroom",
  "waiting lounge": "Waiting Area",
  "ladies only": "Women-only Space",
  "women only": "Women-only Space",
  water: "Drinking Water",
  refreshment: "Refreshments",
  cctv: "CCTV Security",
}

const ICON_BY_NAME = new Map<string, string>(
  AMENITY_CATALOG.map((amenity) => [amenity.name.toLowerCase(), amenity.icon]),
)

/** Best-effort icon id for an amenity label, e.g. "Air Conditioning" → "AirVent". */
export function amenityIconIdForName(name: string | null | undefined): string | null {
  const key = name?.trim().toLowerCase()
  if (!key) return null

  const direct = ICON_BY_NAME.get(key)
  if (direct) return direct

  const aliased = AMENITY_NAME_ALIASES[key]
  return aliased ? (ICON_BY_NAME.get(aliased.toLowerCase()) ?? null) : null
}

/**
 * Resolve the icon id to render. Prefers the id saved by the CRM, then falls
 * back to matching the amenity label so legacy/emoji icons still get a real
 * icon instead of everything collapsing to the generic sparkle.
 */
export function resolveAmenityIconId(
  icon: string | null | undefined,
  name?: string | null,
): string {
  const trimmed = icon?.trim()
  if (trimmed && AMENITY_ICON_IDS.has(trimmed) && trimmed !== "Sparkles") {
    return trimmed
  }

  return amenityIconIdForName(name) ?? "Sparkles"
}
