import Link from "next/link"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { LeaveReviewForm } from "@/components/reviews/leave-review-form"
import { getAppointmentStaffNameForReview } from "@/lib/reviews/get-appointment-staff"
import { Footer } from "@/components/sections/parts/footer"

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string; salonName?: string }>
}) {
  const params = await searchParams
  const appointmentId = params.appointmentId?.trim()
  const salonName = params.salonName?.trim() || "your salon"
  const staffName = appointmentId
    ? await getAppointmentStaffNameForReview(appointmentId)
    : undefined

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
        <PageHeader
          eyebrow="Review"
          title={`How was ${salonName}?`}
          subtitle="Share your experience to help others discover great salons."
        />
        <div className="mt-6 max-w-lg rounded-3xl border border-border/70 bg-card p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <LeaveReviewForm
            appointmentId={appointmentId}
            salonName={salonName}
            staffName={staffName}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}

