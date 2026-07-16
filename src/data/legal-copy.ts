export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export const LEGAL_ENTITY = {
  companyName: "Fixxzo Technologies Private Limited",
  brandName: "Glammzo",
  contactEmail: "hello@glammzo.com",
  supportHours: "Monday to Saturday, 9:00 AM – 7:00 PM (IST)",
  governingLaw: "laws of India",
  jurisdiction: "courts in India",
} as const

export const PRIVACY_POLICY = {
  title: "Privacy Policy",
  lastUpdated: "15 July 2026",
  intro: [
    `This Privacy Policy explains how ${LEGAL_ENTITY.companyName} (“Fixxzo”, “we”, “us”, or “our”), operating the Glammzo platform (“Glammzo”, “Platform”, “Service”), collects, uses, shares, and protects personal information when you use our website, mobile experiences, and related services.`,
    "Glammzo is a salon discovery and appointment booking marketplace. Customers can browse salons, compare services and prices, request bookings, manage appointments, leave reviews, and interact with salon partners. Salon partners may list their businesses, manage availability, and receive booking requests through Glammzo and related CRM tools.",
    "By using Glammzo, you agree to this Privacy Policy. If you do not agree, please do not use the Platform.",
  ],
  sections: [
    {
      id: "who-we-are",
      title: "1. Who We Are",
      paragraphs: [
        `${LEGAL_ENTITY.companyName} operates Glammzo as a technology intermediary that connects customers with independent salon and beauty partners.`,
        `For privacy-related questions, contact us at ${LEGAL_ENTITY.contactEmail}. Support is available ${LEGAL_ENTITY.supportHours}.`,
      ],
    },
    {
      id: "information-we-collect",
      title: "2. Information We Collect",
      paragraphs: [
        "We collect information that you provide directly, information generated through your use of the Platform, and limited information from salon partners and service providers.",
      ],
      bullets: [
        "Account and profile details: name, phone number, email address, password or authentication credentials, and profile preferences.",
        "Booking details: selected salon, services or packages, preferred stylist (if any), appointment date and time, notes you share with the salon, booking status, reschedule history, and cancellation reasons.",
        "Location information: city, area, or approximate location you choose for discovery and nearby salon recommendations. Precise device location is used only if you grant permission.",
        "Reviews and feedback: ratings, written reviews, and related content you submit after completed visits.",
        "Partner and business information: salon name, address, services, pricing, staff details, operating hours, media, and related listing/CRM data provided by salon partners.",
        "Device and usage data: IP address, browser type, device identifiers, pages viewed, referring URLs, session activity, and similar technical diagnostics.",
        "Communications: messages you send to support, and transactional notices related to bookings, account security, or platform updates.",
      ],
    },
    {
      id: "how-we-use",
      title: "3. How We Use Information",
      paragraphs: [
        "We use personal information to operate, improve, and protect Glammzo, and to support customer and salon partner experiences.",
      ],
      bullets: [
        "Create and manage customer and partner accounts.",
        "Enable salon discovery, search, filters, maps, favorites, and recommendations.",
        "Process booking requests, confirmations, reschedules, cancellations, reminders, and appointment history.",
        "Share necessary booking details with the relevant salon partner so they can fulfil the appointment.",
        "Display service catalogues, packages, offers, estimated totals, and related booking information.",
        "Support payments where enabled, including pay-at-salon or third-party payment flows.",
        "Send transactional messages about bookings, account activity, and important service updates.",
        "Moderate reviews, prevent fraud/abuse, and investigate safety or trust issues.",
        "Analyse platform performance, fix bugs, and improve product features.",
        "Comply with applicable law and enforce our Terms of Service.",
      ],
    },
    {
      id: "marketplace-sharing",
      title: "4. Sharing Information in a Marketplace",
      paragraphs: [
        "Because Glammzo connects customers and salons, some information must be shared to complete a booking.",
      ],
      bullets: [
        "With salon partners: when you request or manage a booking, we share relevant details such as your name, phone number, selected services, appointment timing, notes, and booking status with the salon you chose.",
        "With service providers: hosting, analytics, messaging, mapping, authentication, and similar vendors who process data on our behalf under contractual safeguards.",
        "With payment providers: if online payments are enabled, limited payment-related information may be processed by authorised payment partners.",
        "For legal and safety reasons: when required by law, regulation, court order, or to protect Fixxzo, users, partners, or the public.",
        "Business transfers: if we undergo a merger, acquisition, restructuring, or similar transaction, information may be transferred as part of that process, subject to appropriate protections.",
      ],
    },
    {
      id: "payments",
      title: "5. Payments and Pricing",
      paragraphs: [
        "Glammzo may display estimated prices based on information provided by salon partners. Unless clearly stated otherwise, customers typically pay at the salon for services received.",
        "If Glammzo enables online payments, coupons, or other payment features in the future, related payment data will be handled through secure processors and only as needed to complete the transaction and prevent fraud.",
        "Salon partners are independent businesses. Final amounts, taxes, and additional charges at the salon may depend on services actually provided and the salon’s own policies.",
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies and Similar Technologies",
      paragraphs: [
        "We use cookies, local storage, and similar technologies to keep you signed in, remember preferences (such as city or cart selections), measure performance, and improve the Platform.",
        "You can control cookies through your browser settings. Disabling certain cookies may affect account sessions, booking flows, or personalisation features.",
      ],
    },
    {
      id: "data-retention",
      title: "7. Data Retention",
      paragraphs: [
        "We retain personal information for as long as needed to provide the Service, maintain booking records, resolve disputes, enforce agreements, meet legal obligations, and support legitimate business needs.",
        "Booking, cancellation, and communication records may be retained for operational, accounting, dispute-resolution, and compliance purposes even after an account becomes inactive.",
      ],
    },
    {
      id: "security",
      title: "8. Security",
      paragraphs: [
        "We use reasonable technical and organisational measures to protect personal information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
        "Please protect your login credentials and notify us promptly if you suspect unauthorised access to your account.",
      ],
    },
    {
      id: "your-choices",
      title: "9. Your Choices and Rights",
      paragraphs: [
        "Depending on applicable law, you may request access to, correction of, or deletion of certain personal information, or ask us to restrict or review how we process it.",
      ],
      bullets: [
        "Update profile details from your account settings where available.",
        "Manage booking actions such as cancellation or rescheduling through My Appointments, subject to Platform and salon rules.",
        "Withdraw location permissions through your device/browser settings.",
        "Contact us at hello@glammzo.com to request support with privacy preferences or data requests.",
      ],
    },
    {
      id: "children",
      title: "10. Children’s Privacy",
      paragraphs: [
        "Glammzo is not directed to children under 18. We do not knowingly collect personal information from children. If you believe a child has provided personal information, please contact us so we can take appropriate action.",
      ],
    },
    {
      id: "changes",
      title: "11. Changes to This Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. The “Last updated” date at the top of the page will reflect the latest version. Continued use of Glammzo after changes means you accept the updated Policy.",
      ],
    },
    {
      id: "contact",
      title: "12. Contact Us",
      paragraphs: [
        `If you have questions about this Privacy Policy or how ${LEGAL_ENTITY.companyName} handles personal information on Glammzo, contact us at:`,
        `${LEGAL_ENTITY.contactEmail}`,
        `Support hours: ${LEGAL_ENTITY.supportHours}`,
      ],
    },
  ] satisfies LegalSection[],
}

export const TERMS_OF_SERVICE = {
  title: "Terms of Service",
  lastUpdated: "15 July 2026",
  intro: [
    `These Terms of Service (“Terms”) govern your access to and use of the Glammzo platform operated by ${LEGAL_ENTITY.companyName} (“Fixxzo”, “we”, “us”, or “our”).`,
    "Glammzo helps customers discover salons and beauty professionals, compare services and prices, request appointments, manage bookings, and leave reviews. Glammzo also helps salon partners list their businesses, receive booking requests, and manage related salon operations through the Platform and connected tools.",
    "By accessing or using Glammzo, you agree to these Terms. If you do not agree, do not use the Platform.",
  ],
  sections: [
    {
      id: "definitions",
      title: "1. Definitions",
      paragraphs: [
        "“Customer” means a person using Glammzo to browse salons, request bookings, or manage appointments.",
        "“Salon Partner” or “Partner” means an independent salon, studio, or beauty business listed on Glammzo or using Glammzo tools.",
        "“Booking” means a customer request for an appointment with a salon partner for one or more services or packages.",
        "“Platform” means the Glammzo website, related applications, CRM tools, and associated services operated by Fixxzo.",
      ],
    },
    {
      id: "role",
      title: "2. Our Role as a Marketplace",
      paragraphs: [
        "Fixxzo operates Glammzo as a technology marketplace and intermediary. We do not own or operate the independent salons listed on the Platform, and we do not directly provide salon, spa, grooming, or beauty services unless expressly stated.",
        "Salon partners are responsible for the quality, safety, legality, timing, pricing accuracy, and fulfilment of services they offer. Customers contract with the salon partner for the service itself.",
        "Glammzo may show booking statuses such as pending confirmation, confirmed, completed, cancelled, declined, or expired based on partner responses and Platform rules.",
      ],
    },
    {
      id: "eligibility",
      title: "3. Eligibility and Accounts",
      paragraphs: [
        "You must be at least 18 years old and capable of entering a binding contract under applicable Indian law to create an account and use booking features.",
        "You agree to provide accurate information, keep your contact details up to date, and safeguard your account credentials. You are responsible for activity that occurs under your account.",
        "We may suspend or terminate accounts that appear fraudulent, abusive, inaccurate, or in violation of these Terms.",
      ],
    },
    {
      id: "customer-bookings",
      title: "4. Customer Bookings",
      paragraphs: [
        "When you submit a booking request, you ask the selected salon partner to reserve an appointment for the chosen services, date, time, and any preferred stylist.",
        "A booking may require salon confirmation. Until confirmed by the partner (or by Platform rules that expressly confirm automatically), an appointment request may remain pending.",
        "Displayed prices are estimates based on partner-listed information and selected services. Final charges may vary based on services actually received, add-ons, taxes, or the salon’s own pricing practices.",
        "Unless the Platform clearly states otherwise for a specific booking, payment is generally made at the salon.",
      ],
    },
    {
      id: "cancellations",
      title: "5. Cancellations, Reschedules, and No-Shows",
      paragraphs: [
        "Customers may cancel or reschedule eligible appointments through Glammzo subject to Platform availability features and partner constraints.",
        "When cancelling, you may be asked to provide a reason so the salon can update its schedule. We may retain cancellation and reschedule records for operational and trust purposes.",
        "Salon partners may decline, expire, or cancel booking requests based on availability, capacity, business hours, closures, or operational needs.",
        "Repeated late cancellations, no-shows, or abusive behaviour may lead to restrictions on future bookings.",
        "Any partner-specific cancellation fees, advance payment rules, or refund practices are set by the salon and should be confirmed with the partner. Glammzo is not responsible for partner refund decisions unless we expressly state otherwise for a Glammzo-controlled payment.",
      ],
    },
    {
      id: "partners",
      title: "6. Salon Partners and Listings",
      paragraphs: [
        "Partners are responsible for providing accurate salon information, services, prices, durations, staff availability, images, and opening hours.",
        "Partners must fulfil confirmed appointments professionally and lawfully, maintain needed licences/permissions for their business, and handle customer service for in-salon experiences.",
        "Partners must not misuse customer information obtained through Glammzo. Customer data should be used only to fulfil bookings and related legitimate business communications.",
        "Fixxzo may edit, pause, or remove listings, and may suspend partner access, if information is misleading, harmful, non-compliant, or otherwise inconsistent with Platform standards.",
      ],
    },
    {
      id: "reviews",
      title: "7. Reviews and User Content",
      paragraphs: [
        "Customers may submit reviews, ratings, notes, or other content. You retain ownership of content you create, but grant Fixxzo a non-exclusive, royalty-free, worldwide licence to host, display, moderate, and use that content in connection with Glammzo.",
        "Content must be honest, lawful, and free of abusive, discriminatory, defamatory, deceptive, or infringing material. We may remove or refuse content that violates these standards.",
      ],
    },
    {
      id: "acceptable-use",
      title: "8. Acceptable Use",
      paragraphs: [
        "You agree not to misuse Glammzo, including by:",
      ],
      bullets: [
        "Providing false identity or contact information.",
        "Attempting to scrape, reverse engineer, disrupt, or overload the Platform.",
        "Interfering with bookings, availability systems, or another user’s account.",
        "Using the Platform for unlawful, fraudulent, or harmful activity.",
        "Harassing salon staff, customers, or Fixxzo team members.",
      ],
    },
    {
      id: "intellectual-property",
      title: "9. Intellectual Property",
      paragraphs: [
        "Glammzo branding, software, design, logos, and Platform content (excluding partner and user content) are owned by Fixxzo Technologies Private Limited or its licensors and are protected by applicable intellectual property laws.",
        "You may not copy, modify, distribute, or commercially exploit Platform materials without our prior written permission, except as allowed by law.",
      ],
    },
    {
      id: "disclaimers",
      title: "10. Disclaimers",
      paragraphs: [
        "The Platform is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, Fixxzo disclaims warranties regarding uninterrupted availability, error-free operation, or fitness for a particular purpose.",
        "We do not guarantee that a requested slot will be confirmed, that partner information will always be complete or current, or that a salon experience will meet your expectations.",
        "Any health, allergy, or service suitability concerns should be raised directly with the salon before treatment.",
      ],
    },
    {
      id: "liability",
      title: "11. Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by applicable law, Fixxzo shall not be liable for indirect, incidental, special, consequential, punitive, or exemplary damages, or for loss of profits, data, goodwill, or business opportunities arising from your use of Glammzo.",
        "Fixxzo is not liable for acts, omissions, services, delays, cancellations, pricing disputes, injuries, or damages caused by independent salon partners or third parties.",
        "Where liability cannot be excluded, Fixxzo’s aggregate liability relating to your use of the Platform shall be limited to the greater of (a) the fees (if any) you paid to Fixxzo for the specific Glammzo-controlled transaction giving rise to the claim in the three months preceding the claim, or (b) INR 2,000.",
      ],
    },
    {
      id: "indemnity",
      title: "12. Indemnity",
      paragraphs: [
        "You agree to indemnify and hold harmless Fixxzo Technologies Private Limited and its directors, officers, employees, and agents from claims, losses, liabilities, and expenses arising out of your misuse of the Platform, violation of these Terms, or infringement of any third-party rights.",
      ],
    },
    {
      id: "termination",
      title: "13. Suspension and Termination",
      paragraphs: [
        "We may suspend or terminate access to Glammzo if you breach these Terms, create risk for other users or partners, or if required for legal, security, or operational reasons.",
        "You may stop using the Platform at any time. Provisions that by nature should survive termination (including intellectual property, disclaimers, liability limits, and indemnity) will continue to apply.",
      ],
    },
    {
      id: "governing-law",
      title: "14. Governing Law and Disputes",
      paragraphs: [
        `These Terms are governed by the ${LEGAL_ENTITY.governingLaw}. Subject to applicable law, courts located in India shall have exclusive jurisdiction over disputes arising out of or relating to these Terms or the Platform.`,
        "Before formal proceedings, we encourage you to contact us so we can attempt to resolve concerns amicably.",
      ],
    },
    {
      id: "changes-terms",
      title: "15. Changes to These Terms",
      paragraphs: [
        "We may update these Terms from time to time. The “Last updated” date indicates the latest version. Continued use of Glammzo after changes constitutes acceptance of the revised Terms.",
      ],
    },
    {
      id: "contact-terms",
      title: "16. Contact",
      paragraphs: [
        `For questions about these Terms, contact ${LEGAL_ENTITY.companyName} at ${LEGAL_ENTITY.contactEmail}. Support hours: ${LEGAL_ENTITY.supportHours}.`,
      ],
    },
  ] satisfies LegalSection[],
}

export const CANCELLATION_POLICY = {
  title: "Cancellation Policy",
  lastUpdated: "15 July 2026",
  intro: [
    `This Cancellation Policy explains how cancellations, reschedules, declines, and related booking changes work on Glammzo, operated by ${LEGAL_ENTITY.companyName}.`,
    "Glammzo is a salon booking marketplace. Customers request appointments with independent salon partners. Booking outcomes depend on Platform tools and salon partner responses.",
    "This Policy should be read together with our Terms of Service and Privacy Policy. By requesting or managing a booking on Glammzo, you agree to this Policy.",
  ],
  sections: [
    {
      id: "overview",
      title: "1. Overview",
      paragraphs: [
        "Most Glammzo bookings start as a request that a salon reviews and confirms. Until a salon confirms, your request may remain pending.",
        "Customers can cancel or reschedule eligible bookings from My Appointments. Salon partners may confirm, decline, expire, or cancel requests based on availability and business operations.",
        "Unless Glammzo clearly states otherwise for a specific payment feature, service payment is typically collected at the salon. Glammzo does not automatically refund in-salon payments made directly to partners.",
      ],
    },
    {
      id: "customer-cancel",
      title: "2. Customer Cancellations",
      paragraphs: [
        "You may cancel an eligible booking while it is pending, confirmed, or upcoming, subject to Platform availability and the appointment still being open for cancellation.",
        "To cancel:",
      ],
      bullets: [
        "Open My Appointments on Glammzo.",
        "Select the booking you want to cancel.",
        "Choose Cancel and provide a cancellation reason.",
        "Confirm the cancellation.",
      ],
    },
    {
      id: "cancellation-reasons",
      title: "3. Why We Ask for a Cancellation Reason",
      paragraphs: [
        "When you cancel, Glammzo asks for a reason such as a change of plans, need for a different time, personal reasons, or other details.",
        "These reasons help salon partners free up slots for other customers and help Glammzo improve reliability across the marketplace.",
        "Cancellation reasons may be stored with your booking record and shared with the relevant salon partner as part of appointment management.",
      ],
    },
    {
      id: "reschedule",
      title: "4. Customer Reschedules",
      paragraphs: [
        "If a booking is still eligible, you can request a new date and time from the reschedule flow in My Appointments.",
        "Rescheduling depends on salon availability, service duration, staffing, and open time slots. Selecting a new slot does not guarantee confirmation if the partner must reconfirm or if the slot becomes unavailable.",
        "Your services stay the same when you reschedule. If you need different services, cancel the current booking (if eligible) and create a new request, or contact the salon.",
      ],
    },
    {
      id: "when-you-cannot",
      title: "5. When You Cannot Cancel or Reschedule",
      paragraphs: [
        "Cancellation or reschedule options may be unavailable when:",
      ],
      bullets: [
        "The appointment is already completed.",
        "The booking has already been cancelled, declined, or expired.",
        "The salon has marked the visit as no-show or otherwise closed the booking.",
        "Technical or operational restrictions prevent further changes.",
      ],
    },
    {
      id: "salon-actions",
      title: "6. Salon Partner Actions",
      paragraphs: [
        "Salon partners manage capacity independently. A partner may:",
      ],
      bullets: [
        "Confirm a pending request.",
        "Decline a request if the slot, stylist, or services cannot be fulfilled.",
        "Allow a request to expire if no response is provided within Platform timing rules.",
        "Cancel an appointment due to closures, emergencies, staffing limits, or operational issues.",
      ],
    },
    {
      id: "after-decline",
      title: "7. After a Decline, Expiry, or Partner Cancellation",
      paragraphs: [
        "If a salon declines or cancels your booking, or the request expires, the appointment will no longer be held for you.",
        "You may book again with the same salon or choose another salon on Glammzo.",
        "Where a partner shares a note (for example, a decline reason), Glammzo may display it in your appointment details for clarity.",
      ],
    },
    {
      id: "payments-refunds",
      title: "8. Payments and Refunds",
      paragraphs: [
        "Estimated totals shown on Glammzo are based on partner-listed service prices and selected items. Final amounts depend on services received at the salon.",
        "For pay-at-salon bookings, any payment, advance, or refund is handled by the salon partner according to their own policies unless Glammzo expressly processes that payment.",
        "If Glammzo enables prepaid, deposit, coupon, or online payment features in the future, refund eligibility for those Glammzo-controlled charges will follow the payment rules shown at checkout and any then-current Platform terms.",
        "Repeated late cancellations or no-shows may lead to booking restrictions to protect partners and other customers.",
      ],
    },
    {
      id: "no-shows",
      title: "9. No-Shows",
      paragraphs: [
        "If you do not arrive for a confirmed appointment and do not cancel in time, the salon may mark the booking as a no-show.",
        "No-show handling, including any partner fees or future booking limits, is determined by the salon’s policies and Platform trust rules.",
      ],
    },
    {
      id: "partner-expectations",
      title: "10. Partner Expectations",
      paragraphs: [
        "Salon partners using Glammzo should respond to booking requests promptly, keep availability accurate, and communicate declines or cancellations clearly.",
        "Partners should not misuse customer information obtained through cancellations or reschedules, and should use it only for fulfilling and managing appointments.",
      ],
    },
    {
      id: "how-to-help",
      title: "11. Need Help?",
      paragraphs: [
        "For help with a cancellation or reschedule that you cannot complete in the app:",
      ],
      bullets: [
        `Email ${LEGAL_ENTITY.contactEmail}`,
        `Support hours: ${LEGAL_ENTITY.supportHours}`,
        "Include your booking reference, salon name, and appointment date/time so we can assist faster.",
      ],
    },
    {
      id: "changes-policy",
      title: "12. Changes to This Policy",
      paragraphs: [
        "We may update this Cancellation Policy from time to time. The “Last updated” date on this page reflects the latest version.",
        "Continued use of Glammzo booking features after updates means you accept the revised Policy.",
      ],
    },
  ] satisfies LegalSection[],
}
