import { describe, expect, it } from "vitest"

import {
  buildStaffReviewCounts,
  formatStaffReviewCount,
  resolveTeamMemberRating,
  resolveTeamMemberReviewCount,
} from "@/lib/salons/staff-review-counts"
import type { SalonReview, SalonTeamMember } from "@/types/salon"

const member: SalonTeamMember = {
  id: "staff-1",
  name: "Bhavesh",
  role: "Stylist",
  imageUrl: "",
  specialties: [],
  reviewCount: 0,
}

describe("staff-review-counts", () => {
  it("counts reviews by staff_id", () => {
    const counts = buildStaffReviewCounts([
      { staff_id: "a" },
      { staff_id: "a" },
      { staff_id: "b" },
      { staff_id: null },
    ])
    expect(counts.get("a")).toBe(2)
    expect(counts.get("b")).toBe(1)
  })

  it("formats review labels", () => {
    expect(formatStaffReviewCount(0)).toBeNull()
    expect(formatStaffReviewCount(1)).toBe("1 review")
    expect(formatStaffReviewCount(12)).toBe("12 reviews")
  })

  it("resolves counts from staffId on reviews", () => {
    const reviews = [
      { staffId: "staff-1", staffMember: { name: "Bhavesh", role: "Stylist" } },
    ] as Pick<SalonReview, "staffId" | "staffMember">[]

    expect(resolveTeamMemberReviewCount(member, reviews)).toBe(1)
  })

  it("resolves average rating and latest review for a staff member", () => {
    const reviews = [
      {
        id: "r1",
        staffId: "staff-1",
        staffMember: { name: "Bhavesh", role: "Stylist" },
        rating: 5,
        comment: "Great cut",
        authorName: "A",
        userId: "u1",
        reviewType: "Overall experience",
        date: "5 Aug 2026",
        serviceName: "Haircut",
      },
      {
        id: "r2",
        staffId: "staff-1",
        staffMember: { name: "Bhavesh", role: "Stylist" },
        rating: 3,
        comment: "Okay",
        authorName: "B",
        userId: "u2",
        reviewType: "Overall experience",
        date: "1 Aug 2026",
        serviceName: "Haircut",
      },
    ] as SalonReview[]

    const stats = resolveTeamMemberRating(member, reviews)
    expect(stats.count).toBe(2)
    expect(stats.average).toBe(4)
    expect(stats.latest?.comment).toBe("Great cut")
  })

  it("does not attribute another staff member's review by name when staffId differs", () => {
    const reviews = [
      {
        staffId: "other-staff",
        staffMember: { name: "Bhavesh", role: "Stylist" },
      },
    ] as Pick<SalonReview, "staffId" | "staffMember">[]

    expect(resolveTeamMemberReviewCount(member, reviews)).toBe(0)
  })
})
