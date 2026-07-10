import { getProfileDefaults } from "@/lib/auth/profile-actions"
import { logoutAction } from "@/lib/auth/auth-actions"
import { ProfileSettingsForm } from "@/components/auth/profile-settings-form"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function SettingsPage() {
  const profile = await getProfileDefaults()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your account"
        title="Profile & settings"
        subtitle="Your name and email are saved when you book. Update them here anytime."
      />

      <Card className="rounded-2xl">
        <CardContent className="px-6 py-8">
          <ProfileSettingsForm
            defaultName={profile.name}
            defaultEmail={profile.email}
            defaultPhone={profile.phone}
          />
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
