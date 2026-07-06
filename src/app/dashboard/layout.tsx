import { redirect } from "next/navigation"

import { AppShell } from "@/components/layout/app-shell"
import { getSession } from "@/lib/auth/session"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login?next=/dashboard")

  return <AppShell>{children}</AppShell>
}
