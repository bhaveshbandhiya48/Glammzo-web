import type { Metadata } from "next"
import Link from "next/link"

import { DeleteAccountButton } from "@/components/auth/delete-account-button"
import { LegalDocument } from "@/components/legal/legal-document"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { Button } from "@/components/ui/button"
import { ACCOUNT_DELETION_GUIDE, LEGAL_ENTITY } from "@/data/legal-copy"
import { getSession } from "@/lib/auth/session"
import { PageSection } from "@/components/layout/page-section"

export const metadata: Metadata = {
  title: "Delete account",
  description: `How to delete your Glammzo account and personal data, operated by ${LEGAL_ENTITY.companyName}.`,
  robots: { index: true, follow: true },
}

export default async function DeleteAccountPage() {
  const session = await getSession()
  const signedIn = Boolean(session?.phone)

  return (
    <>
      <Navbar />
      <main className="page-main">
        <LegalDocument
          eyebrow="Privacy"
          title={ACCOUNT_DELETION_GUIDE.title}
          lastUpdated={ACCOUNT_DELETION_GUIDE.lastUpdated}
          intro={ACCOUNT_DELETION_GUIDE.intro}
          sections={ACCOUNT_DELETION_GUIDE.sections}
          relatedHref="/privacy"
          relatedLabel="View Privacy Policy"
        />

        <PageSection tone="base" className="pt-0">
          <div className="mx-auto max-w-3xl space-y-4">
            {signedIn ? (
              <DeleteAccountButton />
            ) : (
              <div className="rounded-2xl border border-border bg-background p-5">
                <h3 className="text-base font-semibold text-foreground">Sign in to delete</h3>
                <p className="mt-1.5 text-sm text-foreground/65">
                  Sign in with your registered mobile number, then confirm deletion by typing
                  DELETE.
                </p>
                <Button asChild className="mt-4 rounded-full">
                  <Link href="/login?next=/delete-account">Sign in</Link>
                </Button>
              </div>
            )}
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
