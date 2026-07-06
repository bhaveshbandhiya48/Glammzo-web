import Link from "next/link"

import { logoutAction } from "@/lib/auth/auth-actions"
import { getSession } from "@/lib/auth/session"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { Logo } from "@/components/layout/logo"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="rounded-full text-sm">
              <Link href="/explore">Explore</Link>
            </Button>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" className="rounded-full">
                Log out
              </Button>
            </form>
          </div>
        </Container>
      </header>

      <Container className="section-y grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          {session ? (
            <p className="text-sm text-foreground/60">
              Hi, <span className="font-medium text-foreground">{session.name ?? session.email}</span>
            </p>
          ) : null}
          <DashboardNav />
        </aside>
        <div>{children}</div>
      </Container>
    </div>
  )
}
