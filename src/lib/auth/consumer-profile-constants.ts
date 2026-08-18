export const CONSUMER_GENDER_OPTIONS = ["female", "male"] as const

export type ConsumerGender = (typeof CONSUMER_GENDER_OPTIONS)[number]

export function isSelectableConsumerGender(
  value: string | null | undefined,
): value is ConsumerGender {
  return Boolean(value && CONSUMER_GENDER_OPTIONS.includes(value as ConsumerGender))
}
