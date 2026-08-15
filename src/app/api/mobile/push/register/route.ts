import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import {
  deleteMobilePushToken,
  upsertMobilePushToken,
  type MobilePushPlatform,
} from "@/lib/push/mobile-push-tokens"

function asPlatform(value: unknown): MobilePushPlatform | null {
  if (value === "ios" || value === "android" || value === "web" || value === "unknown") {
    return value
  }
  return null
}

export async function POST(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return jsonError(400, "Invalid JSON body.")
    }

    const expoPushToken =
      typeof body.expoPushToken === "string" ? body.expoPushToken.trim() : ""
    if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) {
      return jsonError(400, "Valid Expo push token required.")
    }

    const result = await upsertMobilePushToken({
      phone: session.phone,
      expoPushToken,
      platform: asPlatform(body.platform),
      deviceId: typeof body.deviceId === "string" ? body.deviceId : null,
    })

    if (result.missingTable) {
      return jsonError(
        503,
        "Push registration is not configured yet. Apply mobile_push_tokens migration.",
      )
    }
    if (!result.ok) {
      return jsonError(500, "Could not register push token.")
    }

    return jsonOk({ registered: true })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/push/register]", error)
    return jsonError(500, "Could not register push token.")
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")

    let expoPushToken: string | undefined
    try {
      const body = (await request.json()) as { expoPushToken?: unknown }
      if (typeof body.expoPushToken === "string") {
        expoPushToken = body.expoPushToken.trim()
      }
    } catch {
      // optional body
    }

    await deleteMobilePushToken({ phone: session.phone, expoPushToken })
    return jsonOk({ unregistered: true })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/push/register DELETE]", error)
    return jsonError(500, "Could not unregister push token.")
  }
}
