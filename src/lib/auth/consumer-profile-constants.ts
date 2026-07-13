export const CONSUMER_GENDER_OPTIONS = [
  "female",
  "male",
  "non_binary",
  "prefer_not_to_say",
  "other",
] as const

export type ConsumerGender = (typeof CONSUMER_GENDER_OPTIONS)[number]
