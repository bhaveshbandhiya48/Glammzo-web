import { describe, expect, it } from "vitest"

import {
  canViewerSeeDemoSalons,
  filterDemoSalonsForViewer,
  isRestrictedDemoSalonIdentifier,
} from "@/lib/salons/demo-salon-access"

describe("demo-salon-access", () => {
  it("recognizes the production demo salon id and slug", () => {
    expect(
      isRestrictedDemoSalonIdentifier("560a8a2a-94cf-4cdf-b117-f67d1a822da8"),
    ).toBe(true)
    expect(isRestrictedDemoSalonIdentifier("glammzo-salon")).toBe(true)
    expect(isRestrictedDemoSalonIdentifier("some-other-salon")).toBe(false)
  })

  it("allows only the demo viewer phone", () => {
    expect(canViewerSeeDemoSalons("9484516500")).toBe(true)
    expect(canViewerSeeDemoSalons("+919484516500")).toBe(true)
    expect(canViewerSeeDemoSalons("919484516500")).toBe(true)
    expect(canViewerSeeDemoSalons("9876543210")).toBe(false)
    expect(canViewerSeeDemoSalons(null)).toBe(false)
  })

  it("hides demo salons from other viewers", () => {
    const salons = [
      { id: "glammzo-salon", crmSalonId: "560a8a2a-94cf-4cdf-b117-f67d1a822da8" },
      { id: "other", crmSalonId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" },
    ]

    expect(filterDemoSalonsForViewer(salons, null)).toHaveLength(1)
    expect(filterDemoSalonsForViewer(salons, "9484516500")).toHaveLength(2)
    expect(filterDemoSalonsForViewer(salons, "9999999999")).toHaveLength(1)
  })
})
