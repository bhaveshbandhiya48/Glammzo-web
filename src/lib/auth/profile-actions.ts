"use server"

import { redirect } from "next/navigation"

import {
  getConsumerProfile,
  syncConsumerProfileToSalonCustomers,
  upsertConsumerProfile,
} from "@/lib/auth/consumer-profile"
import {
  CONSUMER_GENDER_OPTIONS,
  type ConsumerGender,
} from "@/lib/auth/consumer-profile-constants"
import { resolveSessionDisplayEmail, resolveSessionDisplayName } from "@/lib/auth/display"
import { getSession, updateSessionProfile } from "@/lib/auth/session"
import { isValidEmail } from "@/lib/validations/email"

export type ProfileActionState =
  | { ok: true; saved?: boolean }
  | {
      ok: false
      message: string
      fieldErrors?: Partial<
        Record<"name" | "email" | "gender" | "dateOfBirth" | "address", string>
      >
    }

function parseGender(value: FormDataEntryValue | null): ConsumerGender | null {
  const raw = String(value ?? "").trim()
  if (!raw) {
    return null
  }

  return CONSUMER_GENDER_OPTIONS.includes(raw as ConsumerGender)
    ? (raw as ConsumerGender)
    : null
}

function parseDateOfBirth(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim()
  if (!raw) {
    return null
  }

  if (Number.isNaN(Date.parse(raw))) {
    return null
  }

  return raw
}

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await getSession()
  if (!session) {
    redirect("/login?next=/dashboard/settings")
  }

  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const genderRaw = String(formData.get("gender") ?? "").trim()
  const dateOfBirthRaw = String(formData.get("dateOfBirth") ?? "").trim()
  const address = String(formData.get("address") ?? "").trim()

  const fieldErrors: NonNullable<Extract<ProfileActionState, { ok: false }>["fieldErrors"]> = {}

  if (!name) {
    fieldErrors.name = "Name is required."
  }

  if (!email) {
    fieldErrors.email = "Email is required."
  } else if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid email address."
  }

  if (genderRaw && !CONSUMER_GENDER_OPTIONS.includes(genderRaw as ConsumerGender)) {
    fieldErrors.gender = "Select a valid gender option."
  }

  if (dateOfBirthRaw && Number.isNaN(Date.parse(dateOfBirthRaw))) {
    fieldErrors.dateOfBirth = "Enter a valid date of birth."
  }

  if (address.length > 500) {
    fieldErrors.address = "Address is too long (max 500 characters)."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the form.", fieldErrors }
  }

  const profile = {
    fullName: name,
    email,
    gender: parseGender(genderRaw),
    dateOfBirth: parseDateOfBirth(dateOfBirthRaw),
    address: address || null,
  }

  await updateSessionProfile({ name, email })

  const savedToDb = await upsertConsumerProfile(session.phone, profile)
  if (!savedToDb) {
    return {
      ok: false,
      message:
        "Profile could not be saved. Run scripts/apply-consumer-profiles-migration.sql in the Supabase SQL Editor, then try again.",
    }
  }

  await syncConsumerProfileToSalonCustomers(session.phone, profile)

  return { ok: true, saved: true }
}

export async function getProfileDefaults() {
  const session = await getSession()
  const stored = session?.phone ? await getConsumerProfile(session.phone) : null

  return {
    name: stored?.fullName || resolveSessionDisplayName(session?.name),
    email: stored?.email || resolveSessionDisplayEmail(session?.email),
    phone: session?.phone ?? "",
    gender: stored?.gender ?? "",
    dateOfBirth: stored?.dateOfBirth ?? "",
    address: stored?.address ?? "",
  }
}
