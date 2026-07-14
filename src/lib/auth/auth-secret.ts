export function resolveAuthSecret():
  | { ok: true; secret: Uint8Array }
  | { ok: false; message: string } {
  const configured = process.env.AUTH_SECRET?.trim()
  if (configured) {
    return { ok: true, secret: new TextEncoder().encode(configured) }
  }

  if (process.env.NODE_ENV !== "production") {
    return { ok: true, secret: new TextEncoder().encode("glamzzo-dev-auth-secret") }
  }

  return {
    ok: false,
    message:
      "Sign-in is not configured on the server. Add AUTH_SECRET to your environment and restart the app.",
  }
}

/**
 * When true, the request/verify OTP actions return `debugOtp` so the UI can show it.
 * - Local: mock/unset SMS provider always exposes it.
 * - Production/staging: only when SMS_DEBUG_OTP=true (opt-in; never by mock alone).
 */
export function shouldExposeDebugOtp() {
  if (process.env.SMS_DEBUG_OTP === "true") {
    return true
  }

  if (process.env.NODE_ENV === "production") {
    return false
  }

  return (
    process.env.SMS_PROVIDER === "mock" || !process.env.SMS_PROVIDER?.trim()
  )
}
