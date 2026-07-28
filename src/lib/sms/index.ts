import { mockSmsProvider } from "@/lib/sms/mock-provider"
import { twilioSmsProvider } from "@/lib/sms/twilio-provider"
import type { SmsProvider } from "@/lib/sms/types"

export type SmsProviderName = "mock" | "twilio"

const providers: Record<SmsProviderName, SmsProvider> = {
  mock: mockSmsProvider,
  twilio: twilioSmsProvider,
}

let warnedMockInProduction = false

function warnMockInProductionOnce() {
  if (process.env.NODE_ENV !== "production" || warnedMockInProduction) {
    return
  }

  warnedMockInProduction = true
  console.warn(
    "[sms] Using mock SMS provider in production. Set SMS_FIXED_OTP=123456 for a staging login code, or configure Twilio (SMS_PROVIDER=twilio) for real SMS.",
  )
}

export function getActiveSmsProvider(): SmsProvider {
  const configured = process.env.SMS_PROVIDER as SmsProviderName | undefined

  if (configured === "twilio" || (!configured && process.env.TWILIO_ACCOUNT_SID?.trim())) {
    return providers.twilio
  }

  // Temporary: allow mock (or unset) until Twilio is wired last.
  warnMockInProductionOnce()
  return providers.mock
}
