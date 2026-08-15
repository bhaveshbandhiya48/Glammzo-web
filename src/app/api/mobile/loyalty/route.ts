import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import { getCustomerLoyalty } from "@/lib/wallet/customer-wallet"

export async function GET(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }

    const loyalty = await getCustomerLoyalty(session.phone)

    return jsonOk({
      loyalty: loyalty ?? {
        completedVisits: 0,
        freeServiceCredits: 0,
        stampsTowardNextFree: 0,
      },
    })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/loyalty]", error)
    return jsonError(500, "Could not load loyalty.")
  }
}
