import { redirect } from "next/navigation"

type SearchParams = Promise<{
  error?: string
  rescheduled?: string
  filter?: string
}>

export default async function BookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const query = new URLSearchParams()

  if (params.error) query.set("error", params.error)
  if (params.rescheduled) query.set("rescheduled", params.rescheduled)
  if (params.filter) query.set("filter", params.filter)

  const qs = query.toString()
  redirect(`/dashboard/profile${qs ? `?${qs}` : ""}#bookings`)
}
