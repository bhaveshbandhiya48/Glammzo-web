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

export function shouldExposeDebugOtp() {
  if (process.env.NODE_ENV === "production") {
    return false
  }

  return (
    process.env.SMS_PROVIDER === "mock" ||
    process.env.SMS_DEBUG_OTP === "true" ||
    !process.env.SMS_PROVIDER?.trim()
  )
}
