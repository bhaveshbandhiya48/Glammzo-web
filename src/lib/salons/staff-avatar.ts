import { media } from "@/data/media"
import { sanitizeSalonImageUrl } from "@/lib/salons/image-url"

export type StaffGender = "male" | "female"

export function resolveStaffImageUrl(
  avatarUrl: string | null | undefined,
  gender: string | null | undefined,
): string {
  const photo = sanitizeSalonImageUrl(avatarUrl)
  if (photo) return photo

  if (gender === "male") return media.staffAvatars.male
  if (gender === "female") return media.staffAvatars.female
  return media.staffAvatars.neutral
}
