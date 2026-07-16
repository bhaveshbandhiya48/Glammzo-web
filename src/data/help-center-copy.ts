export type HelpTopic = {
  id: string
  title: string
  description: string
  href: string
  icon: "calendar" | "search" | "wallet" | "user" | "store" | "shield"
}

export type HelpArticle = {
  id: string
  title: string
  summary: string
  steps: string[]
  relatedHref?: string
  relatedLabel?: string
}

export const HELP_CENTER = {
  title: "Help Center",
  subtitle:
    "Guides for booking, managing appointments, payments, your account, and partnering with Glammzo.",
  supportEmail: "hello@glammzo.com",
  supportHours: "Monday to Saturday, 9:00 AM – 7:00 PM (IST)",
  topics: [
    {
      id: "booking",
      title: "Book an appointment",
      description: "Find salons, pick services, and send a booking request.",
      href: "#book-appointment",
      icon: "search",
    },
    {
      id: "manage",
      title: "Manage bookings",
      description: "Check status, reschedule, or cancel from My Appointments.",
      href: "#manage-bookings",
      icon: "calendar",
    },
    {
      id: "payments",
      title: "Payments & pricing",
      description: "Understand estimates, pay-at-salon, and packages.",
      href: "#payments",
      icon: "wallet",
    },
    {
      id: "account",
      title: "Account & privacy",
      description: "Sign in, update your profile, and review data sharing.",
      href: "#account",
      icon: "user",
    },
    {
      id: "partners",
      title: "For salon partners",
      description: "Start free, open CRM, and get discovered on Glammzo.",
      href: "#partners",
      icon: "store",
    },
    {
      id: "policies",
      title: "Policies & safety",
      description: "Cancellation, terms, privacy, and marketplace rules.",
      href: "#policies",
      icon: "shield",
    },
  ] satisfies HelpTopic[],
  articles: [
    {
      id: "book-appointment",
      title: "How to book an appointment",
      summary: "From discovery to confirmation in a few calm steps.",
      steps: [
        "Open Explore or Services and choose a salon that fits your needs.",
        "Add one or more services (or a package) and continue to booking.",
        "Pick an available date and time. Add notes if the salon should know anything.",
        "Submit your request. Many bookings stay pending until the salon confirms.",
        "Track the status anytime in My Appointments.",
      ],
      relatedHref: "/explore",
      relatedLabel: "Explore salons",
    },
    {
      id: "manage-bookings",
      title: "How to manage a booking",
      summary: "Cancel, reschedule, or review appointment details.",
      steps: [
        "Go to My Appointments and open the booking you want to change.",
        "To reschedule, choose Reschedule, pick a new slot, and confirm.",
        "To cancel, choose Cancel, select a reason, and confirm cancellation.",
        "Completed visits may allow leaving a review when prompted.",
        "If a salon declines or a request expires, you can book again anytime.",
      ],
      relatedHref: "/dashboard/bookings",
      relatedLabel: "Open My Appointments",
    },
    {
      id: "payments",
      title: "Payments and pricing on Glammzo",
      summary: "What estimated totals mean and how payment usually works.",
      steps: [
        "Service and package prices come from each salon’s catalogue.",
        "Totals shown during booking are estimates for the items you select.",
        "Unless checkout clearly says otherwise, pay at the salon for the visit.",
        "Final charges may change if you add services or the salon applies taxes/fees.",
        "For refund questions on pay-at-salon visits, contact the salon directly.",
      ],
      relatedHref: "/cancellation-policy#payments-refunds",
      relatedLabel: "Read payment notes",
    },
    {
      id: "account",
      title: "Account, contact details, and privacy",
      summary: "Keep your profile current and understand what salons receive.",
      steps: [
        "Sign in with your phone-based account to manage bookings securely.",
        "Update name, email, and other details from account Settings.",
        "When you book, we share needed details with that salon only.",
        "Manage location permissions in your browser or device settings.",
        "Read the Privacy Policy for cookies, retention, and data requests.",
      ],
      relatedHref: "/privacy",
      relatedLabel: "Privacy Policy",
    },
    {
      id: "partners",
      title: "Help for salon partners",
      summary: "Join Glammzo, use CRM, and go live on the marketplace.",
      steps: [
        "Visit For Salons and start free — no credit card needed.",
        "Create your account and open your CRM workspace.",
        "Add hours, services, staff, and photos in CRM.",
        "Publish your listing when ready. Marketplace visibility may need approval.",
        "Once live, customers can discover you in Explore and search.",
      ],
      relatedHref: "/for-salons",
      relatedLabel: "Partner with Glammzo",
    },
    {
      id: "policies",
      title: "Policies worth knowing",
      summary: "Key marketplace rules before you book or list.",
      steps: [
        "Cancellation Policy covers customer cancels, reschedules, declines, and no-shows.",
        "Terms of Service explain Glammzo’s role as a marketplace intermediary.",
        "Privacy Policy covers how booking and account data is used.",
        "FAQs answer the most common customer and partner questions quickly.",
        "Contact support if you cannot complete a change in My Appointments.",
      ],
      relatedHref: "/faqs",
      relatedLabel: "Browse FAQs",
    },
  ] satisfies HelpArticle[],
  quickLinks: [
    { label: "FAQs", href: "/faqs" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "For Salons", href: "/for-salons" },
    { label: "Explore Salons", href: "/explore" },
  ],
} as const
