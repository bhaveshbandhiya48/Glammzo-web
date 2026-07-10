import { getSalons } from "@/lib/salons"

export async function GET() {
  const salons = await getSalons()
  return Response.json(salons)
}
