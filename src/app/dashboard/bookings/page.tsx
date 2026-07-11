import { BookingsSection } from "@/components/booking/bookings-section"
import { getCustomerBookings } from "@/lib/bookings/customer-bookings"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { getSession } from "@/lib/auth/session"

type SearchParams = Promise<{
  error?: string
  rescheduled?: string
  filter?: string
}>

export default async function BookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const error = params.error
  const rescheduled = params.rescheduled === "1"
  const session = await getSession()

  const bookings = await getCustomerBookings()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your account"
        title="Your appointments"
        subtitle="Track pending requests, confirmed visits, and past bookings."
        className="[&_h1]:mb-3 [&_p]:mt-0"
      />

      {rescheduled ? (
        <Card className="rounded-2xl border-primary/30 bg-primary/5">
          <CardContent className="px-6 py-4">
            <p className="text-sm text-foreground/80">
              Your appointment was rescheduled. The salon will see your new time.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {error === "cancel" ? (
        <Card className="rounded-2xl">
          <CardContent className="px-6 py-4">
            <p className="text-sm text-destructive/90">
              We couldn&apos;t cancel this booking. Please try again or contact the salon.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {error === "reschedule" ? (
        <Card className="rounded-2xl">
          <CardContent className="px-6 py-4">
            <p className="text-sm text-destructive/90">
              We couldn&apos;t reschedule this booking. Please try again or contact the salon.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {error === "review" ? (
        <Card className="rounded-2xl">
          <CardContent className="px-6 py-4">
            <p className="text-sm text-destructive/90">
              We couldn&apos;t save your review. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <BookingsSection
        bookings={bookings}
        authenticated={Boolean(session)}
        initialFilter={params.filter}
      />
    </div>
  )
}
