import type { SalonReview, SalonTeamMember } from "@/types/salon"

function normalizeStaffName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function buildStaffReviewCounts(
  reviews: Array<{ staff_id?: string | null }>,
): Map<string, number> {
  const counts = new Map<string, number>()

  for (const review of reviews) {
    const staffId = review.staff_id?.trim()
    if (!staffId) continue
    counts.set(staffId, (counts.get(staffId) ?? 0) + 1)
  }

  return counts
}

export function resolveTeamMemberReviewCount(
  member: SalonTeamMember,
  reviews: Pick<SalonReview, "staffId" | "staffMember">[],
): number {
  if (member.reviewCount > 0) {
    return member.reviewCount
  }

  const memberName = normalizeStaffName(member.name)
  let count = 0

  for (const review of reviews) {
    if (review.staffId === member.id) {
      count += 1
      continue
    }
    if (!review.staffId && normalizeStaffName(review.staffMember.name) === memberName) {
      count += 1
    }
  }

  return count
}

export function formatStaffReviewCount(count: number): string | null {
  if (count <= 0) return null
  return count === 1 ? "1 review" : `${count.toLocaleString()} reviews`
}
