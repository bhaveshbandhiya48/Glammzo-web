"use server"

import { redirect } from "next/navigation"

import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session"

type AuthState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<Record<string, string>> }

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const nextPath = String(formData.get("next") ?? "/dashboard") || "/dashboard"

  const fieldErrors: Record<string, string> = {}
  if (!email) fieldErrors.email = "Email is required."
  else if (!isEmail(email)) fieldErrors.email = "Enter a valid email."
  if (!password) fieldErrors.password = "Password is required."
  else if (password.length < 8) fieldErrors.password = "Use at least 8 characters."

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please check the form.", fieldErrors }
  }

  // Demo auth logic (replace with real user lookup).
  // Any email + password >= 8 is accepted.
  await setSessionCookie({
    sub: "demo-user",
    email,
    name: email.split("@")[0]?.slice(0, 24) || "User",
  })

  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard")
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect("/")
}

export async function requestPasswordResetAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!email) return { ok: false, message: "Email is required.", fieldErrors: { email: "Email is required." } }
  if (!isEmail(email)) return { ok: false, message: "Enter a valid email.", fieldErrors: { email: "Enter a valid email." } }

  // In production, send email with reset link.
  return { ok: true }
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  const fieldErrors: Record<string, string> = {}
  if (!name) fieldErrors.name = "Name is required."
  if (!email) fieldErrors.email = "Email is required."
  else if (!isEmail(email)) fieldErrors.email = "Enter a valid email."
  if (!password) fieldErrors.password = "Password is required."
  else if (password.length < 8) fieldErrors.password = "Use at least 8 characters."

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please check the form.", fieldErrors }
  }

  // Demo auth logic (replace with DB insert).
  await setSessionCookie({
    sub: "demo-user",
    email,
    name: name.slice(0, 40),
  })

  redirect("/dashboard")
}

