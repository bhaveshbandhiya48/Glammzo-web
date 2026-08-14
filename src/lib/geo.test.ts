import { describe, expect, it } from "vitest"

import { getNearestKnownAreas, resolveNearestArea } from "./geo"

describe("resolveNearestArea", () => {
  it("maps Marathahalli GPS to Marathahalli instead of Indiranagar", () => {
    const result = resolveNearestArea(12.9591, 77.6974)
    expect(result?.areaLabel).toBe("Marathahalli")
  })

  it("maps Indiranagar GPS to Indiranagar", () => {
    const result = resolveNearestArea(12.9784, 77.6408)
    expect(result?.areaLabel).toBe("Indiranagar")
  })

  it("returns null when far from every known neighbourhood centroid", () => {
    // Roughly Airport / far north — outside 3.5km of listed areas
    const result = resolveNearestArea(13.1989, 77.7068)
    expect(result).toBeNull()
  })
})

describe("getNearestKnownAreas", () => {
  it("returns Marathahalli and Whitefield ahead of Indiranagar for east Bengaluru GPS", () => {
    // Near Munnenkolalu / Whitefield corridor
    const nearest = getNearestKnownAreas(12.97, 77.74, 3).map((area) => area.areaLabel)
    expect(nearest[0]).toBe("Whitefield")
    expect(nearest).toContain("Marathahalli")
    expect(nearest).not.toContain("Indiranagar")
  })
})
