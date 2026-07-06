import { getSession } from "@/lib/auth/session"
import { logoutAction } from "@/lib/auth/auth-actions"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function SettingsPage() {
  const session = await getSession()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Account"
        subtitle="Profile details are stored in your session for this demo."
      />

      <Card className="rounded-2xl">
        <CardContent className="space-y-5 px-6 py-8">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              defaultValue={session?.name ?? ""}
              disabled
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={session?.email ?? ""}
              disabled
              className="rounded-xl"
            />
          </div>
          <p className="text-sm text-foreground/60">
            Connect a database to enable profile edits and email verification.
          </p>
        </CardContent>
      </Card>

      <form action={logoutAction}>
        <Button variant="outline" className="rounded-full">
          Sign out
        </Button>
      </form>
    </div>
  )
}
