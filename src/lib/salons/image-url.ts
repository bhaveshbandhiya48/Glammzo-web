/** Hosts that must never be passed to next/image (placeholders / invalid CDN data). */
const BLOCKED_IMAGE_HOSTS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "www.example.com",
  "www.example.org",
  "www.example.net",
  // Google Drive share links are not a stable image CDN for next/image.
  "drive.google.com",
  "docs.google.com",
])

/**
 * Returns a usable image URL for next/image, or null for placeholders / invalid values.
 * Local public paths (`/images/...`) are always allowed.
 */
export function sanitizeSalonImageUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("/")) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }

    const host = parsed.hostname.toLowerCase()
    if (
      BLOCKED_IMAGE_HOSTS.has(host) ||
      host.endsWith(".example.com") ||
      host.endsWith(".example.org") ||
      host.endsWith(".example.net")
    ) {
      return null
    }

    return trimmed
  } catch {
    return null
  }
}
