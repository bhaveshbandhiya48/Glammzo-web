import { getConsumerProfile } from "@/lib/auth/consumer-profile"
import { resolveSessionDisplayName } from "@/lib/auth/display"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ authenticated: false, session: null })
  }

  const profile = session.phone ? await getConsumerProfile(session.phone) : null
  const name =
    resolveSessionDisplayName(profile?.fullName) ||
    resolveSessionDisplayName(session.name) ||
    undefined

  return Response.json({
    authenticated: true,
    session: {
      phone: session.phone,
      email: profile?.email || session.email || undefined,
      name,
    },
  })
}
