import { mockSmsProvider } from "@/lib/sms/mock-provider"
import { twilioSmsProvider } from "@/lib/sms/twilio-provider"
import type { SmsProvider } from "@/lib/sms/types"

export type SmsProviderName = "mock" | "twilio"

const providers: Record<SmsProviderName, SmsProvider> = {
  mock: mockSmsProvider,
  twilio: twilioSmsProvider,
}

export function getActiveSmsProvider(): SmsProvider {
  const configured = process.env.SMS_PROVIDER as SmsProviderName | undefined

  if (configured && configured in providers) {
    return providers[configured]
  }

  if (process.env.NODE_ENV === "production" && process.env.TWILIO_ACCOUNT_SID) {
    return providers.twilio
  }

  return providers.mock
}
