/** Hash → mobile nav title for `/dashboard/profile`. */

export type ProfileNavSection =
  | "home"
  | "bookings"
  | "wallet"
  | "loyalty"
  | "activity"
  | "details"

export function profileSectionFromHash(hash: string): ProfileNavSection {
  const value = hash.replace(/^#/, "")
  if (value === "profile" || value === "home") return "home"
  if (
    value === "bookings" ||
    value === "loyalty" ||
    value === "activity" ||
    value === "details" ||
    value === "wallet"
  ) {
    return value
  }
  return "bookings"
}

export function profileMobileNavTitle(section: ProfileNavSection): string {
  switch (section) {
    case "home":
      return "Profile"
    case "bookings":
      return "My bookings"
    case "wallet":
      return "Wallet"
    case "loyalty":
      return "Loyalty rewards"
    case "activity":
      return "Wallet activity"
    case "details":
      return "Profile information"
  }
}

/** Sub-screens that should back to the profile hub (`#profile`). */
export function isProfileHubChild(section: ProfileNavSection): boolean {
  return (
    section === "details" ||
    section === "wallet" ||
    section === "loyalty" ||
    section === "activity"
  )
}
