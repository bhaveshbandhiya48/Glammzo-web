import { media } from "@/data/media"
import { sanitizeSalonImageUrl } from "@/lib/salons/image-url"

export type StaffGender = "male" | "female"

/** Photo when present; otherwise a simple head-and-shoulders placeholder. */
export function resolveStaffImageUrl(
  avatarUrl: string | null | undefined,
  _gender?: string | null,
): string {
  const photo = sanitizeSalonImageUrl(avatarUrl)
  if (photo) return photo
  return media.staffAvatars.neutral
}
