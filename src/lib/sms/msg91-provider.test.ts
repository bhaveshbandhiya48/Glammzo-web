import { describe, expect, it } from "vitest"

import { extractOtpFromBody, toMsg91Mobile } from "@/lib/sms/msg91-provider"

describe("msg91 helpers", () => {
  it("normalizes Indian mobiles for MSG91", () => {
    expect(toMsg91Mobile("9876543210")).toBe("919876543210")
    expect(toMsg91Mobile("+919876543210")).toBe("919876543210")
    expect(toMsg91Mobile("919876543210")).toBe("919876543210")
  })

  it("extracts a 6-digit OTP from SMS body copy", () => {
    expect(
      extractOtpFromBody(
        "Your Glammzo verification code is 482913. It expires in 10 minutes.",
      ),
    ).toBe("482913")
    expect(extractOtpFromBody("No code here")).toBeNull()
  })
})
