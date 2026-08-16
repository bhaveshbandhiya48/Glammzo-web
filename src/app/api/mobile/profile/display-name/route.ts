import {
  getConsumerProfile,
  syncConsumerProfileToSalonCustomers,
  upsertConsumerProfile,
} from "@/lib/auth/consumer-profile"
import {
  issueAccessToken,
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"

/** First-time display name after OTP — name only, email optional later. */
export async function POST(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")

    let body: { name?: unknown }
    try {
      body = (await request.json()) as { name?: unknown }
    } catch {
      return jsonError(400, "Invalid JSON body.")
    }

    const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : ""
    if (name.length < 2) {
      return jsonError(400, "Please enter your name.")
    }
    if (name.length > 40) {
      return jsonError(400, "Please keep your name under 40 characters.")
    }

    const existing = await getConsumerProfile(session.phone)
    const profile = {
      fullName: name,
      email: existing?.email?.trim() || "",
      gender: existing?.gender ?? null,
      dateOfBirth: existing?.dateOfBirth ?? null,
      address: existing?.address ?? null,
    }

    const saved = await upsertConsumerProfile(session.phone, profile)
    if (!saved) {
      return jsonError(
        500,
        "Could not save your name. Please try again.",
      )
    }

    await syncConsumerProfileToSalonCustomers(session.phone, profile)

    const nextSession = {
      sub: session.sub,
      phone: session.phone,
      name,
      ...(profile.email ? { email: profile.email } : {}),
    }
    const { accessToken, expiresIn } = await issueAccessToken(nextSession)

    return jsonOk({
      name,
      accessToken,
      expiresIn,
    })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/profile/display-name]", error)
    return jsonError(500, "Could not save your name.")
  }
}
