"use server"

import { shouldExposeDebugOtp } from "@/lib/auth/auth-secret"
import { normalizeCustomerPhone, normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import {
  BUSINESS_TYPES,
  maskIndianMobile,
  type BusinessType,
  type OnboardingActionState,
  type SalonOnboardingProgress,
} from "@/lib/salon-onboarding/constants"
import {
  clearOnboardingOtp,
  clearOnboardingProgress,
  readOnboardingOtp,
  readOnboardingProgress,
  writeOnboardingOtp,
  writeOnboardingProgress,
} from "@/lib/salon-onboarding/cookies"
import { getSignupCityOptions } from "@/lib/salon-onboarding/india"
import {
  lookupOwnerByMobile,
  provisionSalonWorkspace,
} from "@/lib/salon-onboarding/provision-salon"
import { getActiveSmsProvider } from "@/lib/sms"

const CITY_OPTIONS = getSignupCityOptions()
const CITY_SET = new Set(CITY_OPTIONS.map((c) => c.toLowerCase()))

function now() {
  return Date.now()
}

export async function submitSalonDetailsAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  try {
    const businessName = String(formData.get("businessName") ?? "").trim()
    const ownerName = String(formData.get("ownerName") ?? "").trim()
    const mobile = String(formData.get("mobile") ?? "").trim()
    const city = String(formData.get("city") ?? "").trim()
    const businessType = String(formData.get("businessType") ?? "").trim() as BusinessType

    const fieldErrors: Record<string, string> = {}
    if (!businessName || businessName.length < 2) {
      fieldErrors.businessName = "Business name is required."
    }
    if (!ownerName || ownerName.length < 2) {
      fieldErrors.ownerName = "Owner name is required."
    }

    const phoneDigits = normalizeCustomerPhoneDigits(mobile)
    if (!/^91[6-9]\d{9}$/.test(phoneDigits)) {
      fieldErrors.mobile = "Enter a valid 10-digit mobile number."
    }

    if (!city || !CITY_SET.has(city.toLowerCase())) {
      fieldErrors.city = "Select a valid city."
    }

    if (!(BUSINESS_TYPES as readonly string[]).includes(businessType)) {
      fieldErrors.businessType = "Select your business type."
    }

    if (Object.keys(fieldErrors).length) {
      return { ok: false, message: "Please check the form.", fieldErrors, step: "details" }
    }

    if (await lookupOwnerByMobile(mobile)) {
      return {
        ok: false,
        message: "An account with this mobile already exists. Please sign in to the CRM.",
        step: "details",
      }
    }

    const mobileE164 = normalizeCustomerPhone(mobile)
    const timestamp = now()
    const progress: SalonOnboardingProgress = {
      step: "otp",
      businessName,
      ownerName,
      mobile: mobileE164,
      city,
      businessType,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await writeOnboardingProgress(progress)

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    await writeOnboardingOtp({ phoneDigits, otp })

    const sms = getActiveSmsProvider()
    await sms.sendSms({
      to: mobileE164,
      body: `Your Glammzo verification code is ${otp}. It expires in 10 minutes.`,
    })

    return {
      ok: true,
      message: "We sent a 6-digit code to your mobile number.",
      step: "otp",
      maskedMobile: maskIndianMobile(mobileE164),
      debugOtp: shouldExposeDebugOtp() ? otp : undefined,
    }
  } catch (error) {
    console.error("[onboarding] submitSalonDetailsAction:", error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not start signup.",
      step: "details",
    }
  }
}

export async function verifyOnboardingOtpAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  try {
    const otp = String(formData.get("otp") ?? "").trim()
    const progress = await readOnboardingProgress()
    if (!progress) {
      return {
        ok: false,
        message: "Your session expired. Please start again.",
        step: "details",
      }
    }

    if (!/^\d{6}$/.test(otp)) {
      return {
        ok: false,
        message: "Enter the 6-digit code.",
        fieldErrors: { otp: "Enter the 6-digit code." },
        step: "otp",
      }
    }

    const challenge = await readOnboardingOtp()
    if (!challenge) {
      return {
        ok: false,
        message: "That code expired. Go back and request a new one.",
        step: "otp",
      }
    }

    if (otp !== challenge.otp) {
      return {
        ok: false,
        message: "Incorrect code. Try again.",
        fieldErrors: { otp: "Incorrect code. Try again." },
        step: "otp",
        debugOtp: shouldExposeDebugOtp() ? challenge.otp : undefined,
      }
    }

    const provisioned = await provisionSalonWorkspace(progress)
    if (!provisioned.ok) {
      return { ok: false, message: provisioned.error, step: "otp" }
    }

    await clearOnboardingOtp()
    await clearOnboardingProgress()

    return {
      ok: true,
      message: "Your CRM workspace is ready.",
      step: "done",
      crmHandoffUrl: provisioned.handoffUrl,
      welcomePath: `/for-salons/welcome?salon=${provisioned.salonId}`,
    }
  } catch (error) {
    console.error("[onboarding] verifyOnboardingOtpAction:", error)
    return {
      ok: false,
      message: "Could not verify that code. Please try again.",
      step: "otp",
    }
  }
}

export async function resendOnboardingOtpAction(): Promise<OnboardingActionState> {
  try {
    const progress = await readOnboardingProgress()
    if (!progress?.mobile) {
      return { ok: false, message: "Your session expired. Please start again.", step: "details" }
    }

    const phoneDigits = normalizeCustomerPhoneDigits(progress.mobile)
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    await writeOnboardingOtp({ phoneDigits, otp })

    const sms = getActiveSmsProvider()
    await sms.sendSms({
      to: progress.mobile,
      body: `Your Glammzo verification code is ${otp}. It expires in 10 minutes.`,
    })

    return {
      ok: true,
      message: "A new code is on the way.",
      step: "otp",
      maskedMobile: maskIndianMobile(progress.mobile),
      debugOtp: shouldExposeDebugOtp() ? otp : undefined,
    }
  } catch (error) {
    console.error("[onboarding] resendOnboardingOtpAction:", error)
    return { ok: false, message: "Could not resend the code.", step: "otp" }
  }
}

export async function getOnboardingProgressAction(): Promise<SalonOnboardingProgress | null> {
  return readOnboardingProgress()
}

export async function resetOnboardingAction(): Promise<void> {
  await clearOnboardingProgress()
  await clearOnboardingOtp()
}

/** @deprecated Use submitSalonDetailsAction */
export const submitOwnerStepAction = submitSalonDetailsAction
/** @deprecated */
export async function submitBusinessStepAction(): Promise<OnboardingActionState> {
  return { ok: false, message: "This step was removed.", step: "details" }
}
/** @deprecated */
export async function submitLocationAndProvisionAction(): Promise<OnboardingActionState> {
  return { ok: false, message: "This step was removed.", step: "details" }
}
