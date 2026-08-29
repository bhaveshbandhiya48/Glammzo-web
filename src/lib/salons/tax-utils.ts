import type { SalonTaxInfo } from "@/types/salon"

/** Match CRM `calculateDefaultTaxAmount`: GST on (subtotal − discounts). */
export function calculateGstAmount(taxableAmount: number, ratePercent: number): number {
  if (!(ratePercent > 0)) return 0
  const taxable = Math.max(0, taxableAmount)
  return Math.round(taxable * (ratePercent / 100) * 100) / 100
}

/**
 * Consumer-facing GST only when the salon enabled GST and saved a GSTIN.
 * Rate still comes from salon tax settings (default 5%).
 */
export function resolveSalonTaxInfo(tax: SalonTaxInfo | null | undefined): SalonTaxInfo | null {
  if (!tax) return null
  if (!tax.enabled || !(tax.ratePercent > 0) || !tax.gstNumber.trim()) return null
  return tax
}

export function formatGstLineLabel(tax: SalonTaxInfo): string {
  const rate = Number.isInteger(tax.ratePercent)
    ? String(tax.ratePercent)
    : tax.ratePercent.toFixed(2).replace(/\.?0+$/, "")
  return `GST (${rate}%)`
}
