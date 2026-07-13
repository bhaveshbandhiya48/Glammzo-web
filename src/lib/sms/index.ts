import { mockSmsProvider } from "@/lib/sms/mock-provider"
import { twilioSmsProvider } from "@/lib/sms/twilio-provider"
import type { SmsProvider } from "@/lib/sms/types"

export type SmsProviderName = "mock" | "twilio"

const providers: Record<SmsProviderName, SmsProvider> = {
  mock: mockSmsProvider,
  twilio: twilioSmsProvider,
}

function isProduction() {
  return process.env.NODE_ENV === "production"
}

export function getActiveSmsProvider(): SmsProvider {
  const configured = process.env.SMS_PROVIDER as SmsProviderName | undefined

  if (isProduction()) {
    if (configured === "mock") {
      throw new Error(
        "SMS_PROVIDER=mock is not allowed in production. Set SMS_PROVIDER=twilio and configure Twilio credentials.",
      )
    }

    if (configured === "twilio" || process.env.TWILIO_ACCOUNT_SID?.trim()) {
      return providers.twilio
    }

    throw new Error(
      "SMS is not configured for production. Set SMS_PROVIDER=twilio and TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SMS_FROM.",
    )
  }

  if (configured && configured in providers) {
    return providers[configured]
  }

  if (process.env.TWILIO_ACCOUNT_SID?.trim()) {
    return providers.twilio
  }

  return providers.mock
}
