import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const protectedPrefixes = ["/dashboard", "/book"]

/** Phones only — iPad / Android tablets without "Mobile" keep the marketing homepage. */
function isMobilePhoneUserAgent(ua: string): boolean {
  if (/ipad/i.test(ua)) return false
  if (/iphone|ipod/i.test(ua)) return true
  if (/android/i.test(ua) && /mobile/i.test(ua)) return true
  if (/windows phone/i.test(ua)) return true
  return false
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Mobile phones land on Explore (filter / browse / book) instead of marketing home.
  if (pathname === "/") {
    const ua = req.headers.get("user-agent") ?? ""
    if (isMobilePhoneUserAgent(ua)) {
      const url = req.nextUrl.clone()
      url.pathname = "/explore"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get("glamzzo_session")?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.search = ""
    // Preserve booking query (services, package, promo) so apply-offer → continue still works after login.
    const next = pathname.startsWith("/book")
      ? `${pathname}${req.nextUrl.search}`
      : pathname.startsWith("/dashboard/")
        ? pathname
        : pathname === "/dashboard"
          ? "/dashboard/profile#bookings"
          : "/"
    url.searchParams.set("next", next)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/book/:path*"],
}
