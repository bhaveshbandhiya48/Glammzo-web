import { mockSmsProvider } from "@/lib/sms/mock-provider"
import { msg91SmsProvider } from "@/lib/sms/msg91-provider"
import { twilioSmsProvider } from "@/lib/sms/twilio-provider"
import type { SmsProvider } from "@/lib/sms/types"

export type SmsProviderName = "mock" | "twilio" | "msg91"

const providers: Record<SmsProviderName, SmsProvider> = {
  mock: mockSmsProvider,
  twilio: twilioSmsProvider,
  msg91: msg91SmsProvider,
}

let warnedMockInProduction = false

function warnMockInProductionOnce() {
  if (process.env.NODE_ENV !== "production" || warnedMockInProduction) {
    return
  }

  warnedMockInProduction = true
  console.warn(
    "[sms] Using mock SMS provider in production. Set SMS_FIXED_OTP=123456 for a staging login code, or configure MSG91 (SMS_PROVIDER=msg91) / Twilio for real SMS.",
  )
}

export function getActiveSmsProvider(): SmsProvider {
  const configured = process.env.SMS_PROVIDER?.trim().toLowerCase() as SmsProviderName | undefined

  if (configured === "msg91" || (!configured && process.env.MSG91_AUTH_KEY?.trim())) {
    return providers.msg91
  }

  if (configured === "twilio" || (!configured && process.env.TWILIO_ACCOUNT_SID?.trim())) {
    return providers.twilio
  }

  if (configured === "mock") {
    warnMockInProductionOnce()
    return providers.mock
  }

  warnMockInProductionOnce()
  return providers.mock
}
