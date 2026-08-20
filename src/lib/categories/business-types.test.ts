import { describe, expect, it } from "vitest"

import {
  businessTypeSlugFromLabel,
  getBusinessTypePresentation,
  normalizeBusinessTypeSlug,
} from "./business-types"

describe("business-types", () => {
  it("normalizes CRM labels to slugs", () => {
    expect(normalizeBusinessTypeSlug("Nail Art Studio")).toBe("nail-art-studio")
    expect(businessTypeSlugFromLabel("Nail Art Studio")).toBe("nail-art-studio")
    expect(businessTypeSlugFromLabel("unisex-salon")).toBe("unisex-salon")
  })

  it("returns presentation for known types", () => {
    expect(getBusinessTypePresentation("Spa")?.label).toBe("Spa")
    expect(getBusinessTypePresentation("beauty-parlour")?.imageUrl).toContain("facial")
  })
})
