import type { Salon } from "@/types/salon"

function addUniqueUrl(urls: string[], url: string | null | undefined) {
  const trimmed = url?.trim()
  if (!trimmed || urls.includes(trimmed)) {
    return
  }

  urls.push(trimmed)
}

function extractGalleryUrls(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.startsWith("http") ? [trimmed] : []
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractGalleryUrls)
  }

  if (!value || typeof value !== "object") {
    return []
  }

  const record = value as Record<string, unknown>
  if (typeof record.url === "string") {
    return extractGalleryUrls(record.url)
  }

  if (typeof record.src === "string") {
    return extractGalleryUrls(record.src)
  }

  return Object.values(record).flatMap(extractGalleryUrls)
}

export function parseGalleryUrlsFromSettings(settings: unknown): string[] {
  if (!settings || typeof settings !== "object") {
    return []
  }

  const root = settings as Record<string, unknown>
  const media = root.media
  const buckets = [
    root.gallery,
    root.photos,
    root.images,
    media && typeof media === "object"
      ? (media as Record<string, unknown>).gallery
      : undefined,
    media && typeof media === "object"
      ? (media as Record<string, unknown>).photos
      : undefined,
  ]

  const urls: string[] = []
  for (const bucket of buckets) {
    for (const url of extractGalleryUrls(bucket)) {
      addUniqueUrl(urls, url)
    }
  }

  return urls
}

export function buildSalonGalleryImages(options: {
  imageUrl: string
  coverImageUrl?: string | null
  listImageUrl?: string | null
  gallery?: string[]
  settings?: unknown
  serviceImageUrls?: Array<string | null | undefined>
}): string[] {
  const urls: string[] = []

  addUniqueUrl(urls, options.coverImageUrl)
  addUniqueUrl(urls, options.listImageUrl)
  addUniqueUrl(urls, options.imageUrl)

  for (const url of options.gallery ?? []) {
    addUniqueUrl(urls, url)
  }

  for (const url of parseGalleryUrlsFromSettings(options.settings)) {
    addUniqueUrl(urls, url)
  }

  for (const url of options.serviceImageUrls ?? []) {
    addUniqueUrl(urls, url)
  }

  return urls
}

export function getSalonCardImages(
  salon: Pick<Salon, "imageUrl" | "coverImageUrl" | "gallery">,
): string[] {
  const urls = buildSalonGalleryImages({
    imageUrl: salon.imageUrl,
    coverImageUrl: salon.coverImageUrl,
    gallery: salon.gallery,
  })

  if (urls.length > 0) {
    return urls
  }

  const fallback = salon.imageUrl?.trim() || salon.coverImageUrl?.trim()
  return fallback ? [fallback] : []
}
