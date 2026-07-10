export const SALON_REVIEW_TYPES = [
  "Skill & technique",
  "Professionalism",
  "Communication",
  "Hospitality",
  "Overall experience",
] as const

export type SalonReviewType = (typeof SALON_REVIEW_TYPES)[number]

