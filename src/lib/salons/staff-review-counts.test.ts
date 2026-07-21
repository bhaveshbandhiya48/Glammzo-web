import { describe, expect, it } from "vitest"

import {
  buildStaffReviewCounts,
  formatStaffReviewCount,
  resolveTeamMemberReviewCount,
} from "@/lib/salons/staff-review-counts"
import type { SalonReview, SalonTeamMember } from "@/types/salon"

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
    const member: SalonTeamMember = {
      id: "staff-1",
      name: "Bhavesh",
      role: "Stylist",
      imageUrl: "",
      specialties: [],
      reviewCount: 0,
    }
    const reviews = [
      { staffId: "staff-1", staffMember: { name: "Bhavesh", role: "Stylist" } },
    ] as Pick<SalonReview, "staffId" | "staffMember">[]

    expect(resolveTeamMemberReviewCount(member, reviews)).toBe(1)
  })
})
