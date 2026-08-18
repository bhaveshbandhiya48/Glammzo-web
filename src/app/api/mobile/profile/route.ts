import {
  isSelectableConsumerGender,
} from "@/lib/auth/consumer-profile-constants"
import {
  getConsumerProfile,
  syncConsumerProfileToSalonCustomers,
  upsertConsumerProfile,
} from "@/lib/auth/consumer-profile"
import { resolveSessionDisplayEmail, resolveSessionDisplayName } from "@/lib/auth/display"
import {
  issueAccessToken,
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import type { WebSession } from "@/lib/auth/session"
import { isValidEmail } from "@/lib/validations/email"

function profilePayload(session: WebSession, stored: Awaited<ReturnType<typeof getConsumerProfile>>) {
  return {
    name: stored?.fullName || resolveSessionDisplayName(session.name) || "",
    email: stored?.email || resolveSessionDisplayEmail(session.email) || "",
    phone: session.phone ?? "",
    gender: stored?.gender ?? "",
    dateOfBirth: stored?.dateOfBirth ?? "",
    address: stored?.address ?? "",
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireBearerSession(request)
    const stored = session.phone ? await getConsumerProfile(session.phone) : null
    return jsonOk({ profile: profilePayload(session, stored) })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/profile GET]", error)
    return jsonError(500, "Could not load profile.")
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return jsonError(400, "Invalid JSON body.")
    }

    const existing = await getConsumerProfile(session.phone)
    const lockedGender = existing?.gender?.trim() || ""

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const genderRaw = typeof body.gender === "string" ? body.gender.trim() : ""
    const dateOfBirthRaw =
      typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : ""
    const address = typeof body.address === "string" ? body.address.trim() : ""

    const fieldErrors: Record<string, string> = {}
    if (!name) fieldErrors.name = "Name is required."
    if (!email) fieldErrors.email = "Email is required."
    else if (!isValidEmail(email)) fieldErrors.email = "Enter a valid email address."

    if (lockedGender) {
      if (genderRaw && genderRaw !== lockedGender) {
        fieldErrors.gender = "Gender cannot be changed once saved."
      }
    } else if (genderRaw && !isSelectableConsumerGender(genderRaw)) {
      fieldErrors.gender = "Select Male or Female."
    }

    if (dateOfBirthRaw && Number.isNaN(Date.parse(dateOfBirthRaw))) {
      fieldErrors.dateOfBirth = "Enter a valid date of birth."
    }
    if (address.length > 500) {
      fieldErrors.address = "Address is too long (max 500 characters)."
    }

    if (Object.keys(fieldErrors).length > 0) {
      return jsonError(400, "Please check the form.", { fieldErrors })
    }

    const gender = lockedGender
      ? lockedGender
      : isSelectableConsumerGender(genderRaw)
        ? genderRaw
        : null
    const dateOfBirth =
      dateOfBirthRaw && !Number.isNaN(Date.parse(dateOfBirthRaw))
        ? dateOfBirthRaw
        : null

    const profile = {
      fullName: name,
      email,
      gender,
      dateOfBirth,
      address: address || null,
    }

    const savedToDb = await upsertConsumerProfile(session.phone, profile)
    if (!savedToDb) {
      return jsonError(
        500,
        "Profile could not be saved. Ensure consumer_profiles migration is applied on staging.",
      )
    }

    await syncConsumerProfileToSalonCustomers(session.phone, profile)

    // Return refreshed JWT with name/email so mobile session stays in sync
    // without touching the browser cookie path.
    const nextSession: WebSession = {
      sub: session.sub,
      phone: session.phone,
      name,
      email,
    }
    const { accessToken, expiresIn } = await issueAccessToken(nextSession)

    return jsonOk({
      profile: profilePayload(nextSession, profile),
      accessToken,
      expiresIn,
    })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/profile PATCH]", error)
    return jsonError(500, "Could not save profile.")
  }
}
