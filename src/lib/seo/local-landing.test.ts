import { describe, expect, it } from "vitest"

import {
  buildAreaLandingPath,
  buildCityLandingPath,
  resolveSeoCity,
  slugifyLocalLabel,
} from "@/lib/seo/local-landing"

describe("local-landing", () => {
  it("resolves Bengaluru and Bangalore to the same SEO city", () => {
    expect(resolveSeoCity("bengaluru")?.displayName).toBe("Bengaluru")
    expect(resolveSeoCity("bangalore")?.slug).toBe("bengaluru")
  })

  it("slugifies area labels for URLs", () => {
    expect(slugifyLocalLabel("HSR Layout")).toBe("hsr-layout")
    expect(slugifyLocalLabel("MG Road")).toBe("mg-road")
  })

  it("builds stable landing paths", () => {
    expect(buildCityLandingPath("bengaluru")).toBe("/salons-in/bengaluru")
    expect(buildAreaLandingPath("bengaluru", "indiranagar")).toBe(
      "/salons-in/bengaluru/indiranagar",
    )
  })
})
