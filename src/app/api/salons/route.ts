import { getSession } from "@/lib/auth/session"
import { getSalons } from "@/lib/salons"

export async function GET() {
  // Session-aware: demo salon must not enter a shared public CDN cache.
  await getSession()
  const salons = await getSalons()
  return Response.json(salons, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  })
}
