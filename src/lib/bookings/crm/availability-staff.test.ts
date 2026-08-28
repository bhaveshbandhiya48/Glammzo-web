import { describe, expect, it } from "vitest"

import {
  formatUnstaffedServicesMessage,
  hasEligibleStaffForServices,
  servicesWithoutEligibleStaff,
  staffedServiceIdsForBooking,
} from "@/lib/bookings/crm/availability"
import type { SalonBookingContext } from "@/lib/bookings/crm/types"

function context(overrides: Partial<SalonBookingContext> = {}): SalonBookingContext {
  return {
    crmSalonId: "salon-1",
    salonName: "Glow",
    timezone: "Asia/Kolkata",
    businessHours: {
      weeklySchedule: {
        monday: { enabled: true, open: "10:00", close: "18:00" },
        tuesday: { enabled: true, open: "10:00", close: "18:00" },
        wednesday: { enabled: true, open: "10:00", close: "18:00" },
        thursday: { enabled: true, open: "10:00", close: "18:00" },
        friday: { enabled: true, open: "10:00", close: "18:00" },
        saturday: { enabled: true, open: "10:00", close: "18:00" },
        sunday: { enabled: false, open: "10:00", close: "18:00" },
      },
    },
    businessClosures: [],
    staffIds: ["staff-a", "staff-b"],
    staffMembers: [],
    staffServiceMap: {},
    staffCategoryMap: {
      "staff-a": ["cat-hair"],
      "staff-b": ["cat-hair"],
    },
    serviceCategoryMap: {
      haircut: "cat-hair",
      color: "cat-hair",
      facial: "cat-skin",
    },
    categoryAssignmentsEnabled: true,
    staffSchedules: {},
    webBooking: {
      confirmationMode: "AUTO_CONFIRM",
      confirmationRequired: false,
      responseSlaMinutes: 30,
    },
    booked: [],
    ...overrides,
  }
}

describe("servicesWithoutEligibleStaff", () => {
  it("flags only services with no assigned staff", () => {
    const booking = context()

    expect(servicesWithoutEligibleStaff(booking, ["haircut", "color", "facial"])).toEqual([
      "facial",
    ])
    expect(staffedServiceIdsForBooking(booking, ["haircut", "color", "facial"])).toEqual([
      "haircut",
      "color",
    ])
    expect(hasEligibleStaffForServices(booking, ["haircut", "color", "facial"])).toBe(false)
    expect(hasEligibleStaffForServices(booking, ["haircut", "color"])).toBe(true)
  })

  it("names the service to remove", () => {
    expect(formatUnstaffedServicesMessage(["Facial"])).toBe(
      "Remove Facial — this service has no staff assigned.",
    )
    expect(formatUnstaffedServicesMessage(["Facial", "Wax"])).toBe(
      "Remove Facial, Wax — these services have no staff assigned.",
    )
  })
})
