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

export function isReviewForTeamMember(
  review: Pick<SalonReview, "staffId" | "staffMember">,
  member: Pick<SalonTeamMember, "id" | "name">,
): boolean {
  if (review.staffId) {
    return review.staffId === member.id
  }

  const reviewStaffName = normalizeStaffName(review.staffMember?.name ?? "")
  const memberName = normalizeStaffName(member.name)
  return Boolean(
    reviewStaffName &&
      reviewStaffName !== "staff" &&
      reviewStaffName === memberName,
  )
}

export function getTeamMemberReviews(
  member: Pick<SalonTeamMember, "id" | "name" | "reviewCount">,
  reviews: SalonReview[],
): SalonReview[] {
  return reviews.filter((review) => isReviewForTeamMember(review, member))
}

export function resolveTeamMemberReviewCount(
  member: SalonTeamMember,
  reviews: Pick<SalonReview, "staffId" | "staffMember">[],
): number {
  const fromReviews = reviews.filter((review) => isReviewForTeamMember(review, member)).length
  if (fromReviews > 0) {
    return fromReviews
  }
  return member.reviewCount > 0 ? member.reviewCount : 0
}

export function resolveTeamMemberRating(
  member: SalonTeamMember,
  reviews: SalonReview[],
): { count: number; average: number | null; latest: SalonReview | null } {
  const memberReviews = getTeamMemberReviews(member, reviews)
  const count = memberReviews.length > 0 ? memberReviews.length : resolveTeamMemberReviewCount(member, reviews)

  if (memberReviews.length === 0) {
    return { count, average: null, latest: null }
  }

  const average =
    memberReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / memberReviews.length

  const latest = memberReviews[0] ?? null

  return {
    count,
    average: Number.isFinite(average) ? average : null,
    latest,
  }
}

export function formatStaffReviewCount(count: number): string | null {
  if (count <= 0) return null
  return count === 1 ? "1 review" : `${count.toLocaleString()} reviews`
}
