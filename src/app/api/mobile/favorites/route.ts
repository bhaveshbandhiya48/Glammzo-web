import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import {
  getConsumerFavoriteSalons,
} from "@/lib/favorites/server"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { getSalonById } from "@/lib/salons"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

/** Public/mobile salon ids (slug or id) for the consumer's favorites. */
async function favoritePublicSalonIds(phone: string): Promise<string[]> {
  const salons = await getConsumerFavoriteSalons(phone)
  return salons.map((salon) => salon.id)
}

export async function GET(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }
    const salonIds = await favoritePublicSalonIds(session.phone)
    return jsonOk({ salonIds })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/favorites GET]", error)
    return jsonError(500, "Could not load favorites.")
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }
    if (!isSupabaseConfigured()) {
      return jsonError(503, "Favorites are not available right now.")
    }

    const body = (await request.json().catch(() => null)) as {
      salonId?: unknown
    } | null
    const salonId = typeof body?.salonId === "string" ? body.salonId.trim() : ""
    if (!salonId) {
      return jsonError(400, "salonId is required.")
    }

    const salon = await getSalonById(salonId)
    const crmSalonId = salon?.crmSalonId?.trim()
    if (!crmSalonId) {
      return jsonError(404, "Salon not found.")
    }

    const phoneDigits = normalizeCustomerPhoneDigits(session.phone)
    if (!phoneDigits) {
      return jsonError(400, "Invalid phone number on your account.")
    }

    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from("consumer_favorite_salons")
      .select("id")
      .eq("consumer_phone_normalized", phoneDigits)
      .eq("salon_id", crmSalonId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("consumer_favorite_salons")
        .delete()
        .eq("id", (existing as { id: string }).id)
      if (error) {
        return jsonError(500, "Could not remove favorite.")
      }
      const salonIds = await favoritePublicSalonIds(session.phone)
      return jsonOk({ favorited: false, salonIds })
    }

    const { error } = await supabase.from("consumer_favorite_salons").insert({
      consumer_phone_normalized: phoneDigits,
      salon_id: crmSalonId,
    })
    if (error) {
      console.error("[mobile/favorites POST] insert failed:", error.message)
      return jsonError(500, "Could not save favorite.")
    }

    const salonIds = await favoritePublicSalonIds(session.phone)
    return jsonOk({ favorited: true, salonIds })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/favorites POST]", error)
    return jsonError(500, "Could not update favorite.")
  }
}
