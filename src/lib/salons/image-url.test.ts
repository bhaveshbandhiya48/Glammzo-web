import { describe, expect, it } from "vitest"

import { sanitizeSalonImageUrl } from "@/lib/salons/image-url"

describe("sanitizeSalonImageUrl", () => {
  it("allows local public paths and configured remote hosts", () => {
    expect(sanitizeSalonImageUrl("/images/categories/spa.png")).toBe(
      "/images/categories/spa.png",
    )
    expect(
      sanitizeSalonImageUrl("https://images.unsplash.com/photo-123"),
    ).toBe("https://images.unsplash.com/photo-123")
  })

  it("rejects example.com placeholders used in bad CRM data", () => {
    expect(sanitizeSalonImageUrl("https://example.com/images/massage.jpg")).toBeNull()
    expect(sanitizeSalonImageUrl("https://www.example.com/cover.jpg")).toBeNull()
  })

  it("rejects Google Drive links (including YOUR_FILE_ID placeholders)", () => {
    expect(
      sanitizeSalonImageUrl(
        "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID",
      ),
    ).toBeNull()
    expect(
      sanitizeSalonImageUrl(
        "https://drive.google.com/uc?export=view&id=1AbCDefRealLookingId",
      ),
    ).toBeNull()
  })
})
