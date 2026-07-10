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
    // If user hits dashboard while logged out, send them to home after login.
    // For booking pages, preserve the exact path so they can continue.
    const next = pathname.startsWith("/book")
      ? pathname
      : pathname.startsWith("/dashboard/")
        ? pathname
        : pathname === "/dashboard"
          ? "/dashboard/bookings"
          : "/"
    url.searchParams.set("next", next)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/book/:path*"],
}
