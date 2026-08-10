import { describe, expect, it } from "vitest"

import {
  buildSalonGalleryImages,
  getSalonCardImages,
} from "@/lib/salons/salon-card-images"

describe("salon image roles", () => {
  it("keeps gallery free of explore and cover photos", () => {
    const gallery = buildSalonGalleryImages({
      gallery: [
        "https://images.unsplash.com/cover.jpg",
        "https://images.unsplash.com/list.jpg",
        "https://images.unsplash.com/gallery-1.jpg",
        "https://images.unsplash.com/gallery-2.jpg",
      ],
      excludeUrls: [
        "https://images.unsplash.com/cover.jpg",
        "https://images.unsplash.com/list.jpg",
      ],
    })

    expect(gallery).toEqual([
      "https://images.unsplash.com/gallery-1.jpg",
      "https://images.unsplash.com/gallery-2.jpg",
    ])
  })

  it("builds explore card slider from list photo then up to 3 gallery photos", () => {
    const images = getSalonCardImages({
      imageUrl: "https://images.unsplash.com/list.jpg",
      coverImageUrl: "https://images.unsplash.com/cover.jpg",
      gallery: [
        "https://images.unsplash.com/gallery-1.jpg",
        "https://images.unsplash.com/gallery-2.jpg",
        "https://images.unsplash.com/gallery-3.jpg",
        "https://images.unsplash.com/gallery-4.jpg",
        "https://images.unsplash.com/cover.jpg",
      ],
    })

    expect(images).toEqual([
      "https://images.unsplash.com/list.jpg",
      "https://images.unsplash.com/gallery-1.jpg",
      "https://images.unsplash.com/gallery-2.jpg",
      "https://images.unsplash.com/gallery-3.jpg",
    ])
    expect(images).not.toContain("https://images.unsplash.com/cover.jpg")
  })
})
