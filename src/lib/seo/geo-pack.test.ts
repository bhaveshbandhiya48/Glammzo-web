import { describe, expect, it } from "vitest"

import {
  buildAreaGeoAnswer,
  buildCityGeoAnswer,
  GEO_GLAMMZO_DEFINITION,
} from "@/lib/seo/geo-copy"
import {
  buildBreadcrumbJsonLd,
  buildHowToBookJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/seo/json-ld"

describe("GEO pack helpers", () => {
  it("builds quotable city and area answers", () => {
    expect(buildCityGeoAnswer("Bengaluru", 3)).toContain("3 bookable salons")
    expect(buildAreaGeoAnswer("Bengaluru", "Indiranagar", 1)).toContain(
      "Indiranagar",
    )
    expect(GEO_GLAMMZO_DEFINITION.toLowerCase()).toContain("glammzo")
  })

  it("emits Organization, HowTo, and Breadcrumb JSON-LD", () => {
    const org = buildOrganizationJsonLd()
    expect(org["@type"]).toBe("Organization")
    expect(org.description).toContain("Glammzo")
    expect(org.knowsAbout).toContain("salon near me")

    const howTo = buildHowToBookJsonLd()
    expect(howTo["@type"]).toBe("HowTo")
    expect(howTo.step).toHaveLength(3)

    const crumbs = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Salon near me", path: "/salons-near-me" },
    ])
    expect(crumbs["@type"]).toBe("BreadcrumbList")
    expect(crumbs.itemListElement).toHaveLength(2)
  })
})
