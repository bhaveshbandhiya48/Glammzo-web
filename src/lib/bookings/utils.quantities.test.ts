import { describe, expect, it } from "vitest"

import { quantitiesFromCartLines, type BookingCartLine } from "./cart"
import {
  parseServiceQuantities,
  parseServicePriceOptions,
  serializeServiceQuantities,
  serializeServicePriceOptions,
  buildBookHref,
  sumServiceDuration,
  sumServicePrice,
} from "./utils"
import type { SalonService } from "@/types/salon"

describe("service quantity serialization", () => {
  it("parses id:qty pairs and ignores qty of 1 when serializing", () => {
    expect(parseServiceQuantities("gel:3,cut:2")).toEqual({ gel: 3, cut: 2 })
    expect(parseServiceQuantities("  uuid-1:10 ")).toEqual({ "uuid-1": 10 })
    expect(parseServiceQuantities("")).toEqual({})
    expect(serializeServiceQuantities({ gel: 3, cut: 1, spa: 2 })).toBe("gel:3,spa:2")
  })
})

describe("cart line quantities", () => {
  it("restores quantities above 1 from cart lines", () => {
    const lines: BookingCartLine[] = [
      { id: "gel", name: "Gel", price: 149, durationMin: 20, quantity: 4 },
      { id: "cut", name: "Cut", price: 500, durationMin: 30, quantity: 1 },
    ]
    expect(quantitiesFromCartLines(lines)).toEqual({ gel: 4 })
  })
})

describe("qty-aware totals", () => {
  const gel = {
    id: "gel",
    name: "Gel refill",
    price: 149,
    durationMin: 20,
    pricingUnit: "per_finger",
  } as SalonService

  it("multiplies price and duration by finger count", () => {
    expect(sumServicePrice([gel], { gel: 3 })).toBe(447)
    expect(sumServiceDuration([gel], { gel: 3 })).toBe(60)
    expect(sumServicePrice([gel], {})).toBe(149)
  })
})

describe("named price options", () => {
  it("round-trips service option ids in the booking URL", () => {
    expect(parseServicePriceOptions("cut:regular,spa:rica")).toEqual({
      cut: "regular",
      spa: "rica",
    })
    expect(serializeServicePriceOptions({ cut: "regular", spa: "" })).toBe("cut:regular")

    const href = buildBookHref(
      "teqnoman",
      ["cut"],
      true,
      null,
      null,
      null,
      "men",
      { cut: "regular" },
    )
    expect(href).toContain("opts=cut%3Aregular")
  })
})
