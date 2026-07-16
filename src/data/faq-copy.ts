export type FaqItem = {
  question: string
  answer: string
}

export type FaqCategory = {
  id: string
  title: string
  description: string
  items: FaqItem[]
}

export const FAQ_PAGE = {
  title: "Frequently Asked Questions",
  subtitle:
    "Answers about booking salons, managing appointments, payments, and partnering with Glammzo.",
  contactPrompt: "Still need help?",
  contactEmail: "hello@glammzo.com",
  categories: [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Finding salons and creating your first booking.",
      items: [
        {
          question: "What is Glammzo?",
          answer:
            "Glammzo is a salon booking marketplace. You can discover nearby salons, compare services and prices, request appointments, and manage bookings in one place. Independent salon partners fulfil the actual services.",
        },
        {
          question: "How do I find a salon?",
          answer:
            "Use Explore to browse salons by area, or open Services to browse by category. You can also search from the home page and filter by what you need.",
        },
        {
          question: "Do I need an account to book?",
          answer:
            "Yes. Signing in helps us save your bookings, send updates, and let you cancel or reschedule from My Appointments. Create an account with your phone number and contact details to get started.",
        },
        {
          question: "How does booking work?",
          answer:
            "Choose a salon, add services or a package, pick a date and time, then send your request. Many bookings stay pending until the salon confirms. You’ll see the latest status in My Appointments.",
        },
      ],
    },
    {
      id: "appointments",
      title: "Appointments & Changes",
      description: "Confirmation, cancellation, and rescheduling.",
      items: [
        {
          question: "Why is my booking pending?",
          answer:
            "Pending means your request was sent and the salon is reviewing availability. Once they confirm, the status updates. If they can’t take it, the booking may be declined or expire.",
        },
        {
          question: "How do I cancel a booking?",
          answer:
            "Open My Appointments, select the booking, tap Cancel, choose a reason, and confirm. Eligible pending, confirmed, or upcoming bookings can usually be cancelled from there.",
        },
        {
          question: "Can I reschedule instead of cancelling?",
          answer:
            "Yes, when the booking is still eligible. Use Reschedule in My Appointments, pick a new date and time from available slots, and confirm. Services stay the same.",
        },
        {
          question: "What if the salon declines or the request expires?",
          answer:
            "The slot is no longer held for you. You can book again with the same salon or choose another. If the salon left a note, it may appear on the booking details.",
        },
        {
          question: "Where can I read the full cancellation rules?",
          answer:
            "See our Cancellation Policy for customer cancels, partner actions, no-shows, and payment notes.",
        },
      ],
    },
    {
      id: "pricing-payments",
      title: "Pricing & Payments",
      description: "Estimates, pay-at-salon, and offers.",
      items: [
        {
          question: "Are the prices on Glammzo final?",
          answer:
            "Prices shown are estimates from salon-listed services and packages. The final amount depends on what you receive at the salon, plus any add-ons or taxes the salon applies.",
        },
        {
          question: "Do I pay online?",
          answer:
            "Most bookings are pay at the salon unless a listing or checkout screen clearly says otherwise. Always check the payment note on your booking confirmation.",
        },
        {
          question: "Can I use offers or packages?",
          answer:
            "Where a salon publishes packages or offers, you can select them during booking. Package inclusions and pricing come from the salon’s catalogue.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Privacy",
      description: "Profile, data, and security basics.",
      items: [
        {
          question: "How do I update my profile?",
          answer:
            "Go to account Settings to update your name, email, and related contact details used for faster bookings.",
        },
        {
          question: "What information is shared with the salon?",
          answer:
            "When you book, we share what the salon needs to fulfil the visit — typically your name, phone number, selected services, appointment time, notes, and booking status.",
        },
        {
          question: "How is my data protected?",
          answer:
            "We use reasonable safeguards to protect account and booking information. Details are in our Privacy Policy, including cookies, retention, and your choices.",
        },
      ],
    },
    {
      id: "for-salons",
      title: "For Salon Partners",
      description: "Listing, CRM, and getting discovered.",
      items: [
        {
          question: "How can my salon join Glammzo?",
          answer:
            "Visit For Salons and start free. Create your account, open the CRM, complete your profile, and publish when you’re ready. Marketplace visibility may require approval.",
        },
        {
          question: "Is partnering free?",
          answer:
            "Getting started is free and does not require a credit card. Your CRM is available from day one. Check For Salons for the latest partner details.",
        },
        {
          question: "How do customers find my salon?",
          answer:
            "After your listing is approved and published, customers can discover you through Explore, search, maps, and category browsing near their selected area.",
        },
        {
          question: "Who handles the in-salon service quality?",
          answer:
            "Salon partners are responsible for the service experience, timing, pricing accuracy, and in-salon fulfilment. Glammzo provides the booking and discovery platform.",
        },
      ],
    },
  ] satisfies FaqCategory[],
}
