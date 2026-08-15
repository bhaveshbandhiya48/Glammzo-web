import { getConsumerProfile } from "@/lib/auth/consumer-profile"
import { resolveSessionDisplayEmail, resolveSessionDisplayName } from "@/lib/auth/display"
import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"

export async function GET(request: Request) {
  try {
    const session = await requireBearerSession(request)
    const profile = session.phone ? await getConsumerProfile(session.phone) : null
    const name =
      resolveSessionDisplayName(profile?.fullName) ||
      resolveSessionDisplayName(session.name) ||
      undefined
    const email =
      profile?.email || resolveSessionDisplayEmail(session.email) || undefined

    return jsonOk({
      authenticated: true,
      user: {
        phone: session.phone,
        email,
        name,
      },
    })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/me]", error)
    return jsonError(500, "Could not load session.")
  }
}
