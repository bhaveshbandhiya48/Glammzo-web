import type { Metadata } from "next"
import Link from "next/link"

import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Partner dashboard",
  robots: { index: false },
}

export default function PartnerDashboardPage() {
  return (
    <>
      <Navbar />
      <main className="page-main section-y">
        <Container className="max-w-2xl">
          <PageHeader
            eyebrow="Partner"
            title="Your partner hub"
            subtitle="This demo dashboard shows what verified partners will see after onboarding."
          />

          <Card className="mt-8 rounded-3xl">
            <CardContent className="space-y-4 px-6 py-8">
              <p className="font-heading text-lg font-semibold">Application in review</p>
              <p className="text-sm leading-relaxed text-foreground/65">
                Once your salon is verified, you&apos;ll manage services, availability, staff,
                and bookings here. Connect your account system to enable partner sign in.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild className="rounded-full">
                  <Link href="/partner-signup">Submit application</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
    </>
  )
}
