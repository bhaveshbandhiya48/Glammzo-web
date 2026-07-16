export const SUCCESS_STORIES_PAGE = {
  title: "Success Stories",
  subtitle:
    "How early salon partners use Glammzo to get discovered, fill quieter slots, and run appointments with less phone tag.",
  eyebrow: "For businesses",
  highlights: [
    { value: "Under 5 min", label: "Average partner setup" },
    { value: "24/7", label: "Online booking requests" },
    { value: "One CRM", label: "Schedule, staff & clients" },
  ],
  stories: [
    {
      id: "weekday-fill",
      salon: "Aura Hair Studio",
      city: "Ahmedabad",
      category: "Hair & styling",
      quote:
        "Weekday afternoons used to stay quiet. Once we listed clear prices and open slots on Glammzo, those hours started filling without a single cold call.",
      owner: "Salon owner",
      outcomes: [
        "More discovery from customers nearby",
        "Fewer back-and-forth calls for availability",
        "Service menu and pricing kept in one place",
      ],
    },
    {
      id: "crm-first",
      salon: "Bloom Skin Lab",
      city: "Surat",
      category: "Skin & facials",
      quote:
        "We opened the CRM the same day we signed up. Even before marketplace approval, our team was managing services and appointments from one calm workspace.",
      owner: "Studio lead",
      outcomes: [
        "CRM usable from day one",
        "Cleaner staff and service setup",
        "Marketplace listing published when ready",
      ],
    },
    {
      id: "transparent-menu",
      salon: "Northline Grooming",
      city: "Vadodara",
      category: "Men’s grooming",
      quote:
        "Customers already know the price and duration before they request a slot. That alone cut down awkward conversations at reception.",
      owner: "Partner stylist",
      outcomes: [
        "Transparent pricing on every listing",
        "Clearer booking requests with notes",
        "Easier confirmations and reschedules",
      ],
    },
  ],
  takeaways: [
    {
      title: "Get discovered locally",
      description:
        "Approved listings appear in Explore, search, and nearby browsing so new clients can find you without ads.",
    },
    {
      title: "Let the calendar work overnight",
      description:
        "Customers request appointments around the clock. Your team confirms when ready — no missed WhatsApp threads.",
    },
    {
      title: "Run operations in one CRM",
      description:
        "Hours, services, staff, and appointments live together so marketplace bookings stay connected to daily salon work.",
    },
  ],
  cta: {
    title: "Ready to write your Glammzo story?",
    subtitle: "Start free, open your CRM instantly, and publish when your listing is ready.",
    primaryLabel: "Start free",
    primaryHref: "/for-salons/start",
    secondaryLabel: "See how partnering works",
    secondaryHref: "/for-salons",
  },
} as const

export const WHY_GLAMMZO_PAGE = {
  title: "Why Glammzo",
  subtitle:
    "A calmer way to discover salons, compare prices, and book with confidence — built for customers and the partners who serve them.",
  eyebrow: "Trust",
  pillars: [
    {
      id: "verified-salons",
      title: "Verified Salons",
      summary: "Partners complete their profile and go live once listings meet Glammzo standards.",
      points: [
        "Salon partners publish hours, services, and photos from their CRM.",
        "Marketplace visibility follows profile completion and approval checks.",
        "You can review ratings, location, and service details before you book.",
        "Independent salons fulfil appointments — Glammzo connects the experience.",
      ],
    },
    {
      id: "transparent-pricing",
      title: "Transparent Pricing",
      summary: "See estimated service and package prices before you request a slot.",
      points: [
        "Catalogues show upfront pricing from partner-listed services.",
        "Booking summaries include estimated totals for selected items.",
        "Duration estimates help you plan your visit.",
        "Final amounts may include salon add-ons or taxes — shown clearly as pay-at-salon when applicable.",
      ],
    },
    {
      id: "secure-booking",
      title: "Secure Booking",
      summary: "Account-based booking with clear statuses and protected appointment records.",
      points: [
        "Sign in to request, track, reschedule, or cancel appointments.",
        "Statuses like pending, confirmed, declined, and completed stay visible in My Appointments.",
        "Only the salon you book with receives the details needed to fulfil your visit.",
        "Privacy and Terms explain how marketplace data is handled by Fixxzo Technologies Private Limited.",
      ],
    },
    {
      id: "customer-support",
      title: "Customer Support",
      summary: "Help when booking tools are unclear — from guides to direct email support.",
      points: [
        "Use the Help Center for step-by-step booking and account guides.",
        "Browse FAQs for common customer and partner questions.",
        "Read the Cancellation Policy before you change an appointment.",
        "Email hello@glammzo.com Mon–Sat, 9:00 AM – 7:00 PM (IST).",
      ],
    },
  ],
  principles: [
    {
      title: "Marketplace clarity",
      description:
        "Glammzo is the discovery and booking layer. Salons own the service experience — and that split is always clear.",
    },
    {
      title: "Less phone tag",
      description:
        "Search, compare, and request slots in minutes instead of coordinating availability by call or chat.",
    },
    {
      title: "Built for both sides",
      description:
        "Customers get a calm booking journey. Partners get CRM tools and a path to local discovery.",
    },
  ],
  cta: {
    customerTitle: "Find your next salon visit",
    customerHref: "/explore",
    customerLabel: "Explore salons",
    partnerTitle: "Grow with Glammzo",
    partnerHref: "/for-salons",
    partnerLabel: "Partner with us",
  },
} as const
