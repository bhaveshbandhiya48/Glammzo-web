export function shouldUseSecureCookies() {
  if (process.env.COOKIE_SECURE === "true") return true
  if (process.env.COOKIE_SECURE === "false") return false
  return process.env.NODE_ENV === "production"
}

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}
