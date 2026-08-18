import type { Metadata } from "next"

import { ProfileWorkspace } from "@/components/account/profile-workspace"
import { Card, CardContent } from "@/components/ui/card"
import { getProfileDefaults } from "@/lib/auth/profile-actions"
import { getSession } from "@/lib/auth/session"
import { getCustomerBookings } from "@/lib/bookings/customer-bookings"
import {
  getCustomerLoyalty,
  getCustomerWallet,
  listWalletLedger,
} from "@/lib/wallet/customer-wallet"

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false },
}

type SearchParams = Promise<{
  error?: string
  rescheduled?: string
  reschedule_requested?: string
  filter?: string
}>

export default async function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const session = await getSession()
  const phone = session?.phone ?? ""

  const [profile, wallet, loyalty, ledger, bookings] = await Promise.all([
    getProfileDefaults(),
    getCustomerWallet(phone),
    getCustomerLoyalty(phone),
    listWalletLedger(phone),
    getCustomerBookings(),
  ])

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {params.reschedule_requested === "1" || params.rescheduled === "1" ? (
        <Card className="rounded-xl border-primary/30 bg-primary/5">
          <CardContent className="px-5 py-3.5 sm:px-6">
            <p className="text-sm text-foreground/80">
              Your reschedule request was sent. The salon will confirm soon — your original
              appointment stays until they accept.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {params.error === "cancel" ? (
        <Card className="rounded-xl">
          <CardContent className="px-5 py-3.5 sm:px-6">
            <p className="text-sm text-destructive/90">
              We couldn&apos;t cancel this booking. Please try again or contact the salon.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {params.error === "cancel_too_soon" ? (
        <Card className="rounded-xl">
          <CardContent className="px-5 py-3.5 sm:px-6">
            <p className="text-sm text-destructive/90">
              This booking is too close to the appointment time to cancel online. Please
              contact the salon if you need help.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {params.error === "reschedule" ? (
        <Card className="rounded-xl">
          <CardContent className="px-5 py-3.5 sm:px-6">
            <p className="text-sm text-destructive/90">
              We couldn&apos;t reschedule this booking. Please try again or contact the salon.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {params.error === "reschedule_too_soon" ? (
        <Card className="rounded-xl">
          <CardContent className="px-5 py-3.5 sm:px-6">
            <p className="text-sm text-destructive/90">
              Reschedules must be made at least 4 hours before your appointment. Please contact
              the salon if you need help.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {params.error === "review" ? (
        <Card className="rounded-xl">
          <CardContent className="px-5 py-3.5 sm:px-6">
            <p className="text-sm text-destructive/90">
              We couldn&apos;t save your review. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <ProfileWorkspace
        bookings={bookings}
        authenticated={Boolean(session)}
        bookingsFilter={params.filter}
        balanceRupees={wallet?.balanceRupees ?? 0}
        completedVisits={loyalty?.completedVisits ?? 0}
        freeServiceCredits={loyalty?.freeServiceCredits ?? 0}
        stampsTowardNextFree={loyalty?.stampsTowardNextFree ?? 0}
        ledger={ledger}
        profile={{
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth,
          address: profile.address,
        }}
      />
    </div>
  )
}
