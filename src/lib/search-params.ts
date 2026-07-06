/** Normalize Next.js searchParams values (string | string[] | undefined). */
export function getSearchParam(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback
  return value ?? fallback
}
