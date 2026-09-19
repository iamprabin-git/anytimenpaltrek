import type { UserRole } from "@/lib/auth";

export type HelpLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type HelpTopic = {
  title: string;
  summary?: string;
  steps?: string[];
  tips?: string[];
  links?: HelpLink[];
};

export type HelpSection = {
  title: string;
  topics: HelpTopic[];
};

export type PanelHelpGuide = {
  portalTitle: string;
  portalIntro: string;
  setup: HelpSection;
  usage: HelpSection;
  pageTopics: HelpTopic[];
};

const BACKEND_SETUP: HelpTopic[] = [
  {
    title: "Backend environment (.env)",
    summary: "Configure the Laravel API in backend/.env before going live.",
    steps: [
      "Copy backend/.env.example to backend/.env and run php artisan key:generate.",
      "Set APP_URL to your API URL (e.g. http://localhost:8000).",
      "Set FRONTEND_URL to your Next.js site URL (e.g. http://localhost:3000).",
      "Configure DB_CONNECTION and database credentials (or SQLite for local dev).",
      "Run php artisan migrate to create tables and seed initial data.",
    ],
  },
  {
    title: "Email notifications",
    summary: "Transactional emails are sent for registrations, bookings, payments, approvals, and more.",
    steps: [
      "Set MAIL_MAILER=smtp and your SMTP host, port, username, and password.",
      "Set MAIL_FROM_ADDRESS and MAIL_FROM_NAME to your company sender details.",
      "Use MAIL_MAILER=log during local development to inspect emails in storage/logs/laravel.log.",
    ],
    tips: [
      "Customers receive branded emails when they register, book, pay, or get approved.",
      "Staff receive email alerts for new registrations, bookings, inquiries, and reviews.",
    ],
  },
  {
    title: "Brevo email marketing",
    summary: "Connect CRM email campaigns to Brevo for delivery and contact sync.",
    steps: [
      "Add BREVO_API_KEY to backend/.env from your Brevo dashboard.",
      "In Admin → Company Settings → Brevo Email Marketing, enable Brevo.",
      "Set a verified sender email and optional Brevo List ID for contact sync.",
      "Click Send Test Email to confirm the integration.",
      "Send campaigns from Agent → CRM → Email Marketing.",
    ],
    links: [{ label: "Brevo API keys", href: "https://app.brevo.com/settings/keys/api", external: true }],
  },
  {
    title: "Payments (Stripe & manual)",
    summary: "Support online checkout, bank transfer, and cash on delivery bookings.",
    steps: [
      "Add STRIPE_KEY, STRIPE_SECRET, and STRIPE_WEBHOOK_SECRET for online payments.",
      "Configure bank/QR details in Agent → Payment QR & Bank (or admin approval flow).",
      "Customers upload payment proof for manual bookings; agents approve from Booking List.",
    ],
  },
  {
    title: "Google sign-in",
    summary: "Optional OAuth login for customers (and existing agents).",
    steps: [
      "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in backend/.env.",
      "Redirect URI should point to /api/auth/google/callback on your API domain.",
    ],
  },
];

const FRONTEND_SETUP: HelpTopic = {
  title: "Frontend environment",
  summary: "Point the Next.js app at your API.",
  steps: [
    "Copy frontend/.env.local.example to frontend/.env.local if present.",
    "Set NEXT_PUBLIC_API_URL to your Laravel API base (e.g. http://localhost:8000/api).",
    "Run npm install && npm run dev in the frontend folder.",
  ],
};

const ADMIN_USAGE: HelpTopic[] = [
  {
    title: "Dashboard",
    summary: "Overview of company stats and quick links to manage the site.",
    steps: ["Review key metrics at a glance.", "Use shortcuts to jump to agents, content, or settings."],
  },
  {
    title: "Agents",
    summary: "Create and manage agent accounts with roles and passwords.",
    steps: [
      "Click Add Agent and fill name, email, phone, role, and password.",
      "The new agent receives a welcome email with login instructions.",
      "Deactivate agents by editing their status instead of deleting when possible.",
    ],
  },
  {
    title: "Role permissions",
    summary: "Control what each agent role can access in the agent panel.",
    steps: [
      "Open Role Permissions and adjust capabilities per role (manager, reception, accountant, etc.).",
      "Changes apply immediately to agents with that role.",
      "Use this to restrict CRM, bookings, packages, or approvals by team function.",
    ],
  },
  {
    title: "Company settings",
    summary: "Logo, contact details, staff contacts, sister companies, and Brevo.",
    steps: [
      "Update company name, email, phone, and address — these appear on the website and in emails.",
      "Upload your logo for the site header and admin sidebar.",
      "Configure Brevo in the dedicated section below the main form.",
    ],
  },
  {
    title: "Appearance & content",
    summary: "Brand colors, site pages, footer, hero slides, and destinations.",
    steps: [
      "Appearance: theme colors, fonts, and social links.",
      "Site Content: legal pages, footer, navigation copy, team pages.",
      "Home Content: hero slider images and destination cards.",
    ],
  },
];

const ADMIN_PAGE_HELP: Record<string, HelpTopic[]> = {
  "/admin/agents": [
    {
      title: "Creating agents",
      steps: [
        "Each agent needs a unique email and a secure password (min. 8 characters).",
        "Choose the correct agent role — it controls menu access and approval rights.",
        "Share login credentials securely; a welcome email is sent automatically.",
      ],
    },
  ],
  "/admin/settings": [
    {
      title: "Brevo setup on this page",
      steps: [
        "Enable Brevo, set sender email (must be verified in Brevo), and optional list ID.",
        "Keep BREVO_API_KEY in server .env only — never commit secrets to git.",
        "Use Send Test Email after saving to verify delivery.",
      ],
    },
  ],
  "/admin/roles": [
    {
      title: "Permission tips",
      tips: [
        "Managers usually need approvals.review and full CRM access.",
        "Reception staff often need users.approve and inquiries.view only.",
        "Accountants may need bookings and payment settings without package editing.",
      ],
    },
  ],
};

const AGENT_USAGE: HelpTopic[] = [
  {
    title: "Dashboard & analytics",
    summary: "Monitor operations and business performance.",
    steps: [
      "Dashboard shows pending users, bookings, inquiries, and CRM stats.",
      "Analytics (if enabled) shows sales, conversion, revenue trends, and top packages.",
    ],
  },
  {
    title: "Customer management",
    summary: "Approve registrations, create customers, and open CRM timelines.",
    steps: [
      "Pending website registrations appear here — approve or reject to activate accounts.",
      "Create customers manually with contact details and optional password.",
      "Use CRM Timeline from the customer row for full interaction history.",
    ],
  },
  {
    title: "CRM & marketing",
    summary: "Campaigns, email marketing, and WhatsApp outreach.",
    steps: [
      "Build campaigns by segment (active customers, loyalty members, by country, etc.).",
      "Email Marketing sends via Brevo when configured; otherwise uses server mail.",
      "WhatsApp Marketing generates ready-to-send wa.me links per customer.",
    ],
  },
  {
    title: "Bookings & payments",
    summary: "Review, approve, export, and print booking requests.",
    steps: [
      "New bookings appear as Pending Approval until confirmed or rejected.",
      "Customers receive email updates at each stage (submitted, confirmed, paid).",
      "Export CSV for accounting; print receipts from booking detail views.",
    ],
  },
  {
    title: "Change approvals",
    summary: "Junior roles submit changes; managers approve them here.",
    steps: [
      "Reception/accountant changes to packages, users, or payment settings may require approval.",
      "Review the summary, add a note, then approve or reject.",
      "The requesting agent is notified by email and in-app notification.",
    ],
  },
  {
    title: "Packages, blog & reviews",
    summary: "Manage treks, tours, blog posts, and customer reviews.",
    steps: [
      "Treks/Tours: create packages with pricing, dates, galleries, and availability.",
      "Blog: draft and publish articles for the public site.",
      "Reviews: approve customer reviews before they appear on the website.",
    ],
  },
];

const AGENT_PAGE_HELP: Record<string, HelpTopic[]> = {
  "/agent/users": [
    {
      title: "Approving customers",
      steps: [
        "Filter by Pending to see new registrations.",
        "Click Approve to activate — customer receives an approval email.",
        "Reject sends a polite rejection email; use CRM for follow-up notes.",
      ],
    },
  ],
  "/agent/payments": [
    {
      title: "Booking workflow",
      steps: [
        "Confirm legitimate bookings after checking payment proof or COD details.",
        "Add an optional review note visible in customer communication.",
        "Paid status updates automatically for Stripe; manual payments need agent review.",
      ],
    },
  ],
  "/agent/crm/email-marketing": [
    {
      title: "Email campaigns",
      steps: [
        "Check the Brevo status banner — green means campaigns send through Brevo.",
        "Use placeholders like {name}, {email}, {loyalty_points}, {company_name} in messages.",
        "Send a draft first, then review recipient delivery status in campaign details.",
      ],
    },
  ],
  "/agent/payment-settings": [
    {
      title: "Bank & QR setup",
      steps: [
        "Upload QR code and enter bank name, account number, and payment instructions.",
        "Changes may require manager approval depending on your role.",
        "Customers see these details during manual payment checkout.",
      ],
    },
  ],
};

const CUSTOMER_USAGE: HelpTopic[] = [
  {
    title: "Your profile",
    summary: "Update personal details, avatar, and password.",
    steps: ["Keep phone, country, and WhatsApp updated for booking confirmations.", "Change password from profile if needed."],
  },
  {
    title: "Bookings & payments",
    summary: "Track trek and tour reservations.",
    steps: [
      "View booking status: pending, confirmed, rejected, or paid.",
      "Print booking receipts from the bookings page.",
      "Payment history appears under My Payment.",
    ],
  },
  {
    title: "Contact & feedback",
    summary: "Reach staff, send suggestions, and write reviews.",
    steps: [
      "Contact to Staff sends a direct message to your operations team.",
      "Suggestions share ideas for improving service.",
      "Write Review after trips; reviews are moderated before publishing.",
    ],
  },
  {
    title: "Wishlist & photos",
    summary: "Save packages and upload trip photos.",
    steps: ["Wishlist helps you track packages for future booking.", "Upload photos to share memories from your adventures."],
  },
];

const CUSTOMER_PAGE_HELP: Record<string, HelpTopic[]> = {
  "/account/bookings": [
    {
      title: "Booking statuses",
      tips: [
        "Pending Approval — waiting for agent review.",
        "Confirmed — your trip is approved.",
        "Paid — payment received successfully.",
      ],
    },
  ],
  "/account/contact-staff": [
    {
      title: "Messaging staff",
      steps: ["Use a clear subject line.", "Include booking reference if your message is about a specific trip.", "You receive an email confirmation when your message is sent."],
    },
  ],
};

function matchPageTopics(pathname: string, map: Record<string, HelpTopic[]>): HelpTopic[] {
  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);

  for (const [prefix, topics] of entries) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return topics;
    }
  }

  return [];
}

export function getPanelHelp(role: UserRole, pathname: string): PanelHelpGuide {
  if (role === "admin") {
    return {
      portalTitle: "Admin Panel Help",
      portalIntro: "Manage company settings, agents, permissions, branding, and integrations.",
      setup: { title: "Setup & configuration", topics: [FRONTEND_SETUP, ...BACKEND_SETUP] },
      usage: { title: "How to use the admin panel", topics: ADMIN_USAGE },
      pageTopics: matchPageTopics(pathname, ADMIN_PAGE_HELP),
    };
  }

  if (role === "agent") {
    return {
      portalTitle: "Agent Panel Help",
      portalIntro: "Run daily operations: customers, bookings, CRM, packages, and approvals.",
      setup: { title: "Setup & configuration", topics: [FRONTEND_SETUP, ...BACKEND_SETUP.filter((t) => !t.title.includes("Google"))] },
      usage: { title: "How to use the agent panel", topics: AGENT_USAGE },
      pageTopics: matchPageTopics(pathname, AGENT_PAGE_HELP),
    };
  }

  return {
    portalTitle: "My Account Help",
    portalIntro: "Manage your profile, bookings, payments, and communication with our team.",
    setup: {
      title: "Getting started",
      topics: [
        {
          title: "Account approval",
          summary: "New registrations require agent approval before you can book.",
          steps: [
            "Register on the login page or sign in with Google.",
            "Wait for the approval email before attempting to book.",
            "Contact us via the Contact page if approval takes longer than expected.",
          ],
        },
        {
          title: "Booking a trip",
          steps: [
            "Browse Treks or Tours on the public website.",
            "Choose a date with available seats and complete checkout.",
            "Track status and receipts under My Bookings.",
          ],
        },
      ],
    },
    usage: { title: "Account features", topics: CUSTOMER_USAGE },
    pageTopics: matchPageTopics(pathname, CUSTOMER_PAGE_HELP),
  };
}
