import { redirect } from "next/navigation"

import { SitePageShell } from "@/components/layout/site-page-shell"
import { getSession } from "@/lib/auth/session"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login?next=/dashboard/bookings")

  return <SitePageShell>{children}</SitePageShell>
}
