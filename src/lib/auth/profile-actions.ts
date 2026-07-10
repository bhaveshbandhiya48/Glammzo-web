"use server"

import { redirect } from "next/navigation"

import { resolveSessionDisplayEmail, resolveSessionDisplayName } from "@/lib/auth/display"
import { getSession, updateSessionProfile } from "@/lib/auth/session"
import { isValidEmail } from "@/lib/validations/email"

export type ProfileActionState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<Record<"name" | "email", string>> }

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

  const fieldErrors: Partial<Record<"name" | "email", string>> = {}

  if (!name) {
    fieldErrors.name = "Name is required."
  }

  if (!email) {
    fieldErrors.email = "Email is required."
  } else if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid email address."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the form.", fieldErrors }
  }

  await updateSessionProfile({ name, email })
  return { ok: true }
}

export async function getProfileDefaults() {
  const session = await getSession()

  return {
    name: resolveSessionDisplayName(session?.name),
    email: resolveSessionDisplayEmail(session?.email),
    phone: session?.phone ?? "",
  }
}
