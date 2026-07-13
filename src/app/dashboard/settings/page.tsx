import { getProfileDefaults } from "@/lib/auth/profile-actions"
import { LogoutFormButton } from "@/components/auth/logout-form-button"
import { ProfileSettingsForm } from "@/components/auth/profile-settings-form"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"

export default async function SettingsPage() {
  const profile = await getProfileDefaults()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your account"
        title="Profile & settings"
        subtitle="Keep your contact details and personal info up to date for faster bookings."
      />

      <Card className="rounded-2xl">
        <CardContent className="px-6 py-8">
          <ProfileSettingsForm
            defaultName={profile.name}
            defaultEmail={profile.email}
            defaultPhone={profile.phone}
            defaultGender={profile.gender}
            defaultDateOfBirth={profile.dateOfBirth}
            defaultAddress={profile.address}
          />
        </CardContent>
      </Card>

      <LogoutFormButton variant="outline" className="rounded-full" pendingLabel="Signing out…">
        Sign out
      </LogoutFormButton>
    </div>
  )
}
