import { issueAccessToken, jsonError, jsonOk } from "@/lib/auth/mobile-bearer"
import { requestMobileOtp } from "@/lib/auth/mobile-otp"

export async function POST(request: Request) {
  let body: { phone?: unknown }
  try {
    body = (await request.json()) as { phone?: unknown }
  } catch {
    return jsonError(400, "Invalid JSON body.")
  }

  const phone = typeof body.phone === "string" ? body.phone : ""
  const result = await requestMobileOtp(phone)

  if (!result.ok) {
    return jsonError(400, result.error, {
      fieldErrors: result.fieldErrors,
    })
  }

  return jsonOk({
    challengeToken: result.challengeToken,
    message: result.message,
    ...(result.debugOtp ? { debugOtp: result.debugOtp } : {}),
  })
}
