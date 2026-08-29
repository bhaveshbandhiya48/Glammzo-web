import { describe, expect, it } from "vitest"

import {
  calculateGstAmount,
  formatGstLineLabel,
  resolveSalonTaxInfo,
} from "@/lib/salons/tax-utils"

describe("tax-utils", () => {
  it("calculates GST like CRM on taxable amount", () => {
    expect(calculateGstAmount(239, 5)).toBe(11.95)
    expect(calculateGstAmount(0, 5)).toBe(0)
    expect(calculateGstAmount(100, 0)).toBe(0)
  })

  it("only resolves tax when enabled with GSTIN and rate", () => {
    expect(
      resolveSalonTaxInfo({
        enabled: true,
        ratePercent: 5,
        gstNumber: "22AAAAA0000A1Z5",
      }),
    ).toEqual({
      enabled: true,
      ratePercent: 5,
      gstNumber: "22AAAAA0000A1Z5",
    })

    expect(
      resolveSalonTaxInfo({
        enabled: true,
        ratePercent: 5,
        gstNumber: "",
      }),
    ).toBeNull()

    expect(
      resolveSalonTaxInfo({
        enabled: false,
        ratePercent: 5,
        gstNumber: "22AAAAA0000A1Z5",
      }),
    ).toBeNull()
  })

  it("formats GST line labels", () => {
    expect(
      formatGstLineLabel({
        enabled: true,
        ratePercent: 5,
        gstNumber: "22AAAAA0000A1Z5",
      }),
    ).toBe("GST (5%)")
  })
})
