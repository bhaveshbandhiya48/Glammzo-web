import { describe, expect, it } from "vitest"

import {
  buildExploreAreaDirectory,
  getExploreAreasForCity,
  resolveExploreDirectoryCity,
} from "./local-directory"
import type { Salon } from "@/types/salon"

function salon(partial: Partial<Salon> & Pick<Salon, "id" | "name" | "city">): Salon {
  return {
    slug: partial.id,
    area: partial.area ?? "",
    rating: 4.5,
    reviewCount: 10,
    startingPrice: 499,
    categories: ["hair"],
    imageUrl: "/images/salons/s1.jpg",
    tags: [],
    ...partial,
  } as Salon
}

describe("explore local directory", () => {
  it("prefers published salon areas over curated fallbacks", () => {
    const areas = getExploreAreasForCity(
      [
        salon({ id: "1", name: "A", city: "Bengaluru", area: "Indiranagar" }),
        salon({ id: "2", name: "B", city: "Bengaluru", area: "Hebbal" }),
      ],
      "Bengaluru",
    )
    expect(areas).toEqual(["Hebbal", "Indiranagar"])
  })

  it("uses curated Ajmer areas when no salons exist there", () => {
    const areas = getExploreAreasForCity([], "Ajmer")
    expect(areas).toContain("Vaishali Nagar")
    expect(areas).toContain("Civil Lines")
  })

  it("builds a city map keyed by normalized city", () => {
    const { areasByCity, cityLabels } = buildExploreAreaDirectory([
      salon({ id: "1", name: "A", city: "Bengaluru", area: "Indiranagar" }),
    ])
    expect(cityLabels.bengaluru).toBe("Bengaluru")
    expect(areasByCity.bengaluru).toContain("Indiranagar")
    expect(areasByCity.ahmedabad?.length).toBeGreaterThan(0)
  })

  it("resolves directory city from explore params", () => {
    expect(
      resolveExploreDirectoryCity({
        city: "Ahmedabad",
        area: null,
        fallbackCity: "Bengaluru",
      }),
    ).toBe("Ahmedabad")
    expect(
      resolveExploreDirectoryCity({
        city: null,
        area: null,
        fallbackCity: "Bengaluru",
      }),
    ).toBe("Bengaluru")
  })
})
