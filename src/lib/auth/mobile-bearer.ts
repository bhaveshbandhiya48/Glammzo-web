import "server-only"

import { createSessionToken, verifySessionToken, type WebSession } from "@/lib/auth/session"

export class MobileAuthError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return Response.json({ ok: false, error, ...extra }, { status })
}

export function jsonOk(body: Record<string, unknown>, status = 200) {
  return Response.json({ ok: true, ...body }, { status })
}

/** Parse `Authorization: Bearer <token>` and verify session JWT. */
export async function requireBearerSession(request: Request): Promise<WebSession> {
  const header = request.headers.get("authorization") ?? ""
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match?.[1]) {
    throw new MobileAuthError(401, "Sign in required.")
  }

  try {
    return await verifySessionToken(match[1].trim())
  } catch {
    throw new MobileAuthError(401, "Session expired. Please sign in again.")
  }
}

export async function issueAccessToken(session: WebSession) {
  const accessToken = await createSessionToken(session)
  return {
    accessToken,
    /** Matches createSessionToken expiration ("14d"). */
    expiresIn: 60 * 60 * 24 * 14,
  }
}
