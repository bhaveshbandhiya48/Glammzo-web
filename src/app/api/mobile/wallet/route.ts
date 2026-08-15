import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import {
  getCustomerWallet,
  getFirst200Campaign,
  listWalletLedger,
} from "@/lib/wallet/customer-wallet"

export async function GET(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }

    const [wallet, ledger, campaign] = await Promise.all([
      getCustomerWallet(session.phone),
      listWalletLedger(session.phone, 30),
      getFirst200Campaign(),
    ])

    return jsonOk({
      wallet: wallet ?? { balancePaise: 0, balanceRupees: 0 },
      ledger,
      campaign,
    })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/wallet]", error)
    return jsonError(500, "Could not load wallet.")
  }
}
