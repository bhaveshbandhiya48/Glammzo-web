import Link from "next/link"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { LeaveReviewForm } from "@/components/reviews/leave-review-form"
import { Footer } from "@/components/sections/parts/footer"

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string; salonName?: string }>
}) {
  const params = await searchParams
  const appointmentId = params.appointmentId?.trim()
  const salonName = params.salonName?.trim() || "your salon"

  if (!appointmentId) {
    return (
      <>
        <main className="page-main">
          <PageHeader
            eyebrow="Review"
            title="Missing appointment"
            subtitle="We couldn&apos;t find an appointment to review. Please go back to your bookings."
          />

          <div className="mt-6">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/bookings">Go to bookings</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <main className="page-main">
        <PageHeader eyebrow="Review" title={`Rate your visit`} subtitle={`Leave feedback for ${salonName}.`} />
        <div className="mt-6 max-w-xl">
          <LeaveReviewForm appointmentId={appointmentId} salonName={salonName} />
        </div>
      </main>
      <Footer />
    </>
  )
}

