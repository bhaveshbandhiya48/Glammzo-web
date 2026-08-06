import { redirect } from "next/navigation"

import { SitePageShell } from "@/components/layout/site-page-shell"
import { getSession } from "@/lib/auth/session"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login?next=/dashboard/profile#bookings")

  return (
    <SitePageShell mainClassName="max-lg:!pt-[calc(4.25rem+0.75rem)] max-lg:!pb-8">
      {children}
    </SitePageShell>
  )
}
