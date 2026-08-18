import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import { validatePromoCode } from "@/lib/bookings/validate-promo-code"

export async function POST(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return jsonError(400, "Invalid JSON body.")
    }

    const salonId = typeof body.salonId === "string" ? body.salonId.trim() : ""
    const code = typeof body.code === "string" ? body.code : ""
    const packageId =
      typeof body.packageId === "string" && body.packageId.trim()
        ? body.packageId.trim()
        : null
    const serviceIds = Array.isArray(body.serviceIds)
      ? body.serviceIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : []

    if (!salonId) {
      return jsonError(400, "salonId is required.")
    }

    const result = await validatePromoCode({
      salonId,
      code,
      serviceIds,
      packageId,
      phone: session.phone,
    })

    if (!result.success) {
      return jsonError(400, result.error, { code: "promo" })
    }

    if (result.kind === "discount") {
      return jsonOk({
        kind: "discount",
        discount: result.discount,
      })
    }

    return jsonOk({
      kind: "cashback",
      code: result.code,
      cashbackRupees: result.cashbackRupees,
      message: result.message,
    })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/promo/validate]", error)
    return jsonError(500, "Could not validate promo code.")
  }
}
