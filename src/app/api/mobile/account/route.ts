import { deleteConsumerAccount } from "@/lib/auth/delete-consumer-account"
import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"

const CONFIRM_WORD = "DELETE"

export async function DELETE(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")

    let confirm = ""
    try {
      const body = (await request.json()) as { confirm?: unknown }
      if (typeof body.confirm === "string") confirm = body.confirm.trim()
    } catch {
      return jsonError(400, `Type ${CONFIRM_WORD} to confirm account deletion.`)
    }

    if (confirm.toUpperCase() !== CONFIRM_WORD) {
      return jsonError(400, `Type ${CONFIRM_WORD} to confirm account deletion.`)
    }

    const result = await deleteConsumerAccount(session.phone)
    if (!result.ok) {
      return jsonError(500, result.message || "Could not delete account.")
    }

    return jsonOk({ deleted: true })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/account DELETE]", error)
    return jsonError(500, "Could not delete account.")
  }
}
