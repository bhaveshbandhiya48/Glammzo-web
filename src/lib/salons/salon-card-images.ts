import type { Salon } from "@/types/salon"

const EXPLORE_CARD_GALLERY_LIMIT = 3

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

function normalizeUrlSet(urls: Array<string | null | undefined>): Set<string> {
  return new Set(
    urls
      .map((url) => url?.trim())
      .filter((url): url is string => Boolean(url)),
  )
}

/**
 * Gallery photos only — never include explore/list or cover images.
 * Cover belongs on the salon hero; explore/list belongs on listing cards.
 */
export function buildSalonGalleryImages(options: {
  gallery?: string[]
  settings?: unknown
  /** Explore / list / cover URLs that must stay out of the gallery. */
  excludeUrls?: Array<string | null | undefined>
}): string[] {
  const excluded = normalizeUrlSet(options.excludeUrls ?? [])
  const urls: string[] = []

  for (const url of options.gallery ?? []) {
    const trimmed = url?.trim()
    if (!trimmed || excluded.has(trimmed)) continue
    addUniqueUrl(urls, trimmed)
  }

  for (const url of parseGalleryUrlsFromSettings(options.settings)) {
    if (excluded.has(url)) continue
    addUniqueUrl(urls, url)
  }

  return urls
}

/**
 * Explore card slider: owner's explore/list photo first, then up to 3 gallery photos.
 * Cover is never included.
 */
export function getSalonCardImages(
  salon: Pick<Salon, "imageUrl" | "coverImageUrl" | "gallery">,
): string[] {
  const exploreUrl = salon.imageUrl?.trim() || null
  const coverUrl = salon.coverImageUrl?.trim() || null
  const urls: string[] = []

  if (exploreUrl) {
    addUniqueUrl(urls, exploreUrl)
  }

  for (const url of salon.gallery ?? []) {
    if (urls.length >= 1 + EXPLORE_CARD_GALLERY_LIMIT) break
    const trimmed = url?.trim()
    if (!trimmed) continue
    if (coverUrl && trimmed === coverUrl) continue
    if (exploreUrl && trimmed === exploreUrl) continue
    addUniqueUrl(urls, trimmed)
  }

  if (urls.length > 0) {
    return urls
  }

  // Last resort so cards never render blank when media is incomplete.
  return exploreUrl ? [exploreUrl] : coverUrl ? [coverUrl] : []
}
