import type { SendSmsInput, SendSmsResult, SmsProvider } from "@/lib/sms/types"

const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow/"

function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

/** MSG91 expects mobiles as country+number without +, e.g. 9198XXXXXXXX. */
export function toMsg91Mobile(phone: string, country = "91") {
  const digits = digitsOnly(phone)
  if (digits.length === 10) return `${country}${digits}`
  if (digits.startsWith(country) && digits.length >= 10 + country.length) return digits
  if (phone.trim().startsWith("+") && digits.length >= 10) return digits
  return digits
}

export function extractOtpFromBody(body: string): string | null {
  const match = body.match(/\b(\d{6})\b/)
  return match?.[1] ?? null
}

function readConfig() {
  const authKey = process.env.MSG91_AUTH_KEY?.trim()
  const flowId =
    process.env.MSG91_FLOW_ID?.trim() || process.env.MSG91_TEMPLATE_ID?.trim()
  const sender =
    process.env.MSG91_SENDER?.trim() || process.env.MSG91_SENDER_ID?.trim()
  const country = process.env.MSG91_COUNTRY?.trim() || "91"
  const route = process.env.MSG91_ROUTE?.trim()
  const otpVar = process.env.MSG91_OTP_VAR?.trim() || "number"

  return { authKey, flowId, sender, country, route, otpVar }
}

export class Msg91SmsProvider implements SmsProvider {
  readonly name = "msg91"

  async sendSms(input: SendSmsInput): Promise<SendSmsResult> {
    const { authKey, flowId, sender, country, route, otpVar } = readConfig()

    if (!authKey) {
      return { success: false, error: "MSG91 auth key is not configured." }
    }
    if (!flowId) {
      return { success: false, error: "MSG91 flow/template id is not configured." }
    }
    if (!sender) {
      return { success: false, error: "MSG91 sender id is not configured." }
    }

    const otp = extractOtpFromBody(input.body)
    if (!otp) {
      return {
        success: false,
        error:
          "MSG91 Flow SMS is configured for OTP templates only. Non-OTP messages need a separate template.",
      }
    }

    const mobiles = toMsg91Mobile(input.to, country)
    if (mobiles.length < 12) {
      return { success: false, error: "Invalid mobile number for MSG91." }
    }

    const payload: Record<string, unknown> = {
      template_id: flowId,
      flow_id: flowId,
      sender,
      short_url: "0",
      recipients: [
        {
          mobiles,
          [otpVar]: otp,
        },
      ],
    }
    if (route) payload.route = route

    try {
      const response = await fetch(MSG91_FLOW_URL, {
        method: "POST",
        headers: {
          authkey: authKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      const text = await response.text()
      type Msg91FlowResponse = {
        type?: string
        message?: string | number
        request_id?: string
      }
      let parsed: Msg91FlowResponse | null = null
      try {
        parsed = JSON.parse(text) as Msg91FlowResponse
      } catch {
        parsed = null
      }

      const type = (parsed?.type ?? "").toLowerCase()
      const messageText =
        typeof parsed?.message === "string"
          ? parsed.message
          : typeof parsed?.message === "number"
            ? String(parsed.message)
            : text

      // MSG91 still returns request_id on failures (e.g. 418 IP not whitelisted).
      // Only treat explicit success as OK.
      const ok = response.ok && type === "success"

      if (!ok) {
        console.error("[sms:msg91] send failed:", response.status, text)
        // Only treat explicit IP / 418 responses as whitelist failures.
        // Do not map every MSG91 `type: "error"` to whitelist — that hides the real cause.
        const ipBlocked =
          response.status === 418 ||
          /whitelist|not\s*whitelisted|ip\s*security|418/i.test(messageText) ||
          /whitelist|not\s*whitelisted|ip\s*security|418/i.test(text)
        const detail = messageText.trim().slice(0, 180)
        return {
          success: false,
          error: ipBlocked
            ? "MSG91 blocked this request: server egress IP is not whitelisted on the Authkey. On the VPS run `curl -s https://api.ipify.org` and whitelist that exact IP (not your laptop IP)."
            : detail
              ? `Could not send SMS via MSG91: ${detail}`
              : "Could not send SMS via MSG91.",
        }
      }

      console.info(
        "[sms:msg91] sent OTP to",
        mobiles,
        parsed?.request_id ? `request_id=${parsed.request_id}` : "",
      )

      return {
        success: true,
        externalId:
          typeof parsed?.request_id === "string" ? parsed.request_id : undefined,
      }
    } catch (error) {
      console.error("[sms:msg91] request error:", error)
      return { success: false, error: "Could not reach MSG91." }
    }
  }
}

export const msg91SmsProvider = new Msg91SmsProvider()
