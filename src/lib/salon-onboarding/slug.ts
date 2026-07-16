export function slugifySalonName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export function withUniqueSlugSuffix(baseSlug: string) {
  const suffix = Math.random().toString(36).slice(2, 7)
  const trimmed = baseSlug.slice(0, Math.max(1, 60 - suffix.length - 1))
  return `${trimmed}-${suffix}`
}
