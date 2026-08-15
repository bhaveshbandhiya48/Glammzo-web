import { issueAccessToken, jsonError, jsonOk } from "@/lib/auth/mobile-bearer"
import { verifyMobileOtp } from "@/lib/auth/mobile-otp"

export async function POST(request: Request) {
  let body: { challengeToken?: unknown; otp?: unknown }
  try {
    body = (await request.json()) as { challengeToken?: unknown; otp?: unknown }
  } catch {
    return jsonError(400, "Invalid JSON body.")
  }

  const challengeToken =
    typeof body.challengeToken === "string" ? body.challengeToken : ""
  const otp = typeof body.otp === "string" ? body.otp : ""

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

  const session = {
    sub: `phone:${result.phoneDigits}`,
    phone: result.phoneE164,
  }
  const { accessToken, expiresIn } = await issueAccessToken(session)

  return jsonOk({
    accessToken,
    expiresIn,
    user: {
      phone: result.phoneE164,
    },
  })
}
