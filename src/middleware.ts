import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const protectedPrefixes = ["/dashboard", "/book"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
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
  matcher: ["/dashboard/:path*", "/book/:path*"],
}
