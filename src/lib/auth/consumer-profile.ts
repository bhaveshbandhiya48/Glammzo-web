import "server-only"

import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

import {
  CONSUMER_GENDER_OPTIONS,
  type ConsumerGender,
} from "@/lib/auth/consumer-profile-constants"

export type ConsumerProfileRecord = {
  fullName: string
  email: string
  gender: ConsumerGender | null
  dateOfBirth: string | null
  address: string | null
}

type ConsumerProfileRow = {
  full_name: string | null
  email: string | null
  gender: string | null
  date_of_birth: string | null
  address: string | null
}

function isConsumerGender(value: string | null | undefined): value is ConsumerGender {
  return Boolean(value && CONSUMER_GENDER_OPTIONS.includes(value as ConsumerGender))
}

function mapProfileRow(row: ConsumerProfileRow | null | undefined): ConsumerProfileRecord | null {
  if (!row) {
    return null
  }

  return {
    fullName: row.full_name?.trim() ?? "",
    email: row.email?.trim() ?? "",
    gender: isConsumerGender(row.gender) ? row.gender : null,
    dateOfBirth: row.date_of_birth ?? null,
    address: row.address?.trim() ?? null,
  }
}

function isMissingConsumerProfilesTable(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    Boolean(error.message?.includes("consumer_profiles")) ||
    Boolean(error.message?.includes("schema cache"))
  )
}

export async function getConsumerProfile(phone: string): Promise<ConsumerProfileRecord | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) {
    return null
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("consumer_profiles")
    .select("full_name, email, gender, date_of_birth, address")
    .eq("consumer_phone_normalized", phoneDigits)
    .maybeSingle()

  if (error) {
    if (!isMissingConsumerProfilesTable(error)) {
      console.error("[profile] fetch consumer profile failed:", error.message)
    }
    return null
  }

  return mapProfileRow(data as ConsumerProfileRow | null)
}

export async function upsertConsumerProfile(
  phone: string,
  input: ConsumerProfileRecord,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false
  }

  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) {
    return false
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { error } = await supabase.from("consumer_profiles").upsert(
    {
      consumer_phone_normalized: phoneDigits,
      full_name: input.fullName.trim() || null,
      email: input.email.trim() || null,
      gender: input.gender,
      date_of_birth: input.dateOfBirth || null,
      address: input.address?.trim() || null,
      updated_at: now,
    },
    { onConflict: "consumer_phone_normalized" },
  )

  if (error) {
    if (isMissingConsumerProfilesTable(error)) {
      console.warn(
        "[profile] consumer_profiles table is missing, run scripts/apply-consumer-profiles-migration.sql in Supabase.",
      )
    } else {
      console.error("[profile] upsert consumer profile failed:", error.message)
    }
    return false
  }

  return true
}

export async function syncConsumerProfileToSalonCustomers(
  phone: string,
  input: ConsumerProfileRecord,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }

  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) {
    return
  }

  const [firstName, ...rest] = input.fullName.trim().split(/\s+/)
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("customers")
    .update({
      full_name: input.fullName.trim() || null,
      first_name: firstName || input.fullName.trim() || null,
      last_name: rest.join(" ") || null,
      email: input.email.trim() || null,
      gender: input.gender,
      date_of_birth: input.dateOfBirth || null,
      address: input.address?.trim() || null,
    })
    .eq("phone_normalized", phoneDigits)
    .is("deleted_at", null)

  if (error) {
    console.error("[profile] sync salon customers failed:", error.message)
  }
}
