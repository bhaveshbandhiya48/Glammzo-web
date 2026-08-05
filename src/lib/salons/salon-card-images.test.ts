import { describe, expect, it } from "vitest"

import {
  buildSalonGalleryImages,
  getSalonCardImages,
} from "@/lib/salons/salon-card-images"

describe("salon image roles", () => {
  it("keeps gallery free of explore and cover photos", () => {
    const gallery = buildSalonGalleryImages({
      gallery: [
        "https://example.com/cover.jpg",
        "https://example.com/list.jpg",
        "https://example.com/gallery-1.jpg",
        "https://example.com/gallery-2.jpg",
      ],
      excludeUrls: [
        "https://example.com/cover.jpg",
        "https://example.com/list.jpg",
      ],
    })

    expect(gallery).toEqual([
      "https://example.com/gallery-1.jpg",
      "https://example.com/gallery-2.jpg",
    ])
  })

  it("builds explore card slider from list photo then up to 3 gallery photos", () => {
    const images = getSalonCardImages({
      imageUrl: "https://example.com/list.jpg",
      coverImageUrl: "https://example.com/cover.jpg",
      gallery: [
        "https://example.com/gallery-1.jpg",
        "https://example.com/gallery-2.jpg",
        "https://example.com/gallery-3.jpg",
        "https://example.com/gallery-4.jpg",
        "https://example.com/cover.jpg",
      ],
    })

    expect(images).toEqual([
      "https://example.com/list.jpg",
      "https://example.com/gallery-1.jpg",
      "https://example.com/gallery-2.jpg",
      "https://example.com/gallery-3.jpg",
    ])
    expect(images).not.toContain("https://example.com/cover.jpg")
  })
})
