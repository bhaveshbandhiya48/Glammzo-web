import "server-only"

import { createHmac } from "crypto"

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

function getInvoiceShareSecret() {
  const fromEnv = process.env.INVOICE_SHARE_SECRET?.trim()
  if (fromEnv) return fromEnv
  if (process.env.NODE_ENV !== "production") {
    return "glamzzo-invoice-share-dev"
  }
  return null
}

/** Same token format as glamzzo-crm `createInvoiceShareToken`. */
export function createInvoiceShareToken(invoiceId: string, salonId: string) {
  const secret = getInvoiceShareSecret()
  if (!secret) return null

  const exp = Date.now() + TOKEN_TTL_MS
  const body = `${invoiceId}|${salonId}|${exp}`
  const signature = createHmac("sha256", secret).update(body).digest("base64url")
  return Buffer.from(`${body}|${signature}`, "utf8").toString("base64url")
}

export function isInvoiceShareConfigured() {
  return Boolean(getInvoiceShareSecret())
}
