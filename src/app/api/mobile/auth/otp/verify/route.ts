import { issueAccessToken, jsonError, jsonOk } from "@/lib/auth/mobile-bearer"
import {
  getConsumerProfile,
  syncConsumerProfileToSalonCustomers,
  upsertConsumerProfile,
} from "@/lib/auth/consumer-profile"
import { verifyMobileOtp } from "@/lib/auth/mobile-otp"

export async function POST(request: Request) {
  let body: { challengeToken?: unknown; otp?: unknown; name?: unknown }
  try {
    body = (await request.json()) as {
      challengeToken?: unknown
      otp?: unknown
      name?: unknown
    }
  } catch {
    return jsonError(400, "Invalid JSON body.")
  }

  const challengeToken =
    typeof body.challengeToken === "string" ? body.challengeToken : ""
  const otp = typeof body.otp === "string" ? body.otp : ""
  const name = typeof body.name === "string" ? body.name.trim() : ""

  if (!challengeToken) {
    return jsonError(400, "That code expired. Request a new one.")
  }

  const result = await verifyMobileOtp(challengeToken, otp)
  if (!result.ok) {
    return jsonError(400, result.error, {
      fieldErrors: result.fieldErrors,
      step: result.step,
      ...(result.debugOtp ? { debugOtp: result.debugOtp } : {}),
    })
  }

  const existing = await getConsumerProfile(result.phoneE164)
  const fullName = name || existing?.fullName?.trim() || ""
  const email = existing?.email?.trim() || ""

  if (fullName) {
    const profile = {
      fullName,
      email,
      gender: existing?.gender ?? null,
      dateOfBirth: existing?.dateOfBirth ?? null,
      address: existing?.address ?? null,
    }
    const saved = await upsertConsumerProfile(result.phoneE164, profile)
    if (saved) {
      await syncConsumerProfileToSalonCustomers(result.phoneE164, profile)
    }
  }

  const session = {
    sub: `phone:${result.phoneDigits}`,
    phone: result.phoneE164,
    ...(fullName ? { name: fullName } : {}),
    ...(email ? { email } : {}),
  }
  const { accessToken, expiresIn } = await issueAccessToken(session)

  return jsonOk({
    accessToken,
    expiresIn,
    needsName: !fullName,
    user: {
      phone: result.phoneE164,
      ...(fullName ? { name: fullName } : {}),
      ...(email ? { email } : {}),
    },
  })
}
