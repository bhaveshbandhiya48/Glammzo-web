import { getSalons } from "@/lib/salons"

export async function GET() {
  const salons = await getSalons()
  return Response.json(salons, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  })
}
