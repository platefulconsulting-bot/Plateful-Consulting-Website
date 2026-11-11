/**
 * Site content model
 * ---------------------------------------------------------------------------
 * Every piece of marketing copy, service definition, statistic and contact
 * detail lives here rather than being scattered through JSX. One file to edit
 * when the business changes; pages stay pure presentation.
 *
 * `relatedPosts` on each service and `relatedServices` on each topic cluster
 * are what wire the site together — services pull in supporting articles, and
 * articles push back toward the service that solves the problem.
 */

export const site = {
  name: "Plateful Consulting",
  shortName: "Plateful",
  legalName: "Plateful Consulting",
  tagline: "We don't manage platforms. We drive sales.",
  description:
    "Specialist Swiggy and Zomato restaurant sales consultants across India. Listing, onboarding, menu optimisation, aggregator ads management and structured growth systems for delivery and dine-in.",
  /** Homepage search snippet: ≤155 characters, ends on a full sentence. */
  metaDescription:
    "Swiggy and Zomato sales consultants for restaurants across India: listing, menu optimisation, aggregator ads and growth systems for delivery and dine-in.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://platefulconsulting.com",
  founded: 2019,
  locale: "en_IN",
} as const;

export const contact = {
  // One number, used everywhere on the site — header, footer, CTAs, WhatsApp
  // and the LocalBusiness schema all read from here.
  phones: [{ label: "+91 81300 32195", href: "tel:+918130032195" }],
  primaryPhone: { label: "+91 81300 32195", href: "tel:+918130032195" },
  emails: [
    { label: "info@platefulconsulting.com", href: "mailto:info@platefulconsulting.com" },
    { label: "plateful.consulting@gmail.com", href: "mailto:plateful.consulting@gmail.com" },
  ],
  primaryEmail: { label: "info@platefulconsulting.com", href: "mailto:info@platefulconsulting.com" },
  whatsapp: "https://wa.me/918130032195",
  address: {
    line1: "225, Alt F Coworking",
    line2: "Sector 142, Noida Expressway",
    city: "Noida",
    state: "Uttar Pradesh",
    postalCode: "201304",
    country: "IN",
    countryName: "India",
  },
  // Straight from Google Maps: `link` is the share link behind the directions
  // button, `embed` the query form the iframe needs — a short link will not
  // render inside an embed.
  maps: {
    link: "https://maps.app.goo.gl/eYxpTqocvvxyHqbr5",
    embed:
      "https://www.google.com/maps?q=Alt+F+Coworking,+Sector+142,+Noida+Expressway,+Noida&output=embed",
  },
  hours: "Monday – Saturday, 10:00 – 19:00 IST",
  socials: [
    { name: "Instagram", href: "https://www.instagram.com/platefulconsulting.pfc/", handle: "@platefulconsulting.pfc" },
    { name: "YouTube", href: "https://www.youtube.com/@PlatefulConsulting", handle: "@PlatefulConsulting" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/97416455/", handle: "Plateful Consulting" },
  ],
  /** Google Business Profile (knowledge panel). Used in schema sameAs, not shown as an icon. */
  googleBusinessProfile: "https://www.google.com/search?kgmid=/g/11vby1v2tp",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "Results", href: "/results" },
  { label: "Blogs", href: "/blogs" },
  { label: "What's New", href: "/whats-new" },
  { label: "Contact Us", href: "/contact-us" },
] as const;

// ---------------------------------------------------------------------------
// Proof points. These are the figures the business publishes; keep them here
// so a single edit updates the homepage, about page and schema markup at once.
// ---------------------------------------------------------------------------

export type Stat = {
  label: string;
  detail: string;
  /** Counted up from zero when it scrolls into view. */
  value?: number;
  suffix?: string;
  decimals?: number;
  /** Printed as written, for a figure that is not a number. */
  display?: string;
};

export const stats: Stat[] = [
  { value: 650, suffix: "+", label: "Restaurants scaled", detail: "QSR, cloud kitchens, casual and fine dine" },
  { display: "PAN India", label: "Where we work", detail: "Delhi NCR, Mumbai, Bengaluru, Pune and every major market" },
  { value: 7, suffix: "+", label: "Years on the platforms", detail: "Hands-on inside Swiggy and Zomato dashboards" },
  { value: 4.5, suffix: "★", label: "Target rating we build toward", detail: "The threshold where visibility compounds", decimals: 1 },
];

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  /** One-line summary, as it appears on the original site. */
  summary: string;
  /** Expanded positioning for the service detail card. */
  description: string;
  outcome: string;
  deliverables: string[];
  icon: IconKey;
  accent: string;
  /** Blog slugs that support this service — powers cross-linking. */
  relatedPosts: string[];
};

export type IconKey =
  | "rocket"
  | "menu"
  | "store"
  | "truck"
  | "camera"
  | "calendar"
  | "target"
  | "shield";

export const services: Service[] = [
  {
    slug: "swiggy-zomato-onboarding",
    name: "Swiggy & Zomato Onboarding",
    shortName: "Onboarding",
    summary:
      "Complete support to help your restaurant start smoothly and get faster visibility on platforms.",
    description:
      "Most restaurants lose their first ninety days to a badly configured listing. We handle the full launch — documentation, catalogue build, serviceability, tax and payout setup — then push for early visibility while the platform's new-restaurant boost is still live.",
    outcome: "Live, discoverable and taking orders without the usual launch dead zone.",
    deliverables: [
      "Documentation, FSSAI and GST setup end to end",
      "Catalogue build with descriptions, variants and add-ons",
      "Serviceability radius and delivery-time configuration",
      "New-launch visibility push while the boost window is open",
      "Payout, tax and commission structure verified before go-live",
    ],
    icon: "rocket",
    accent: "#F7D045",
    relatedPosts: [
      "how-to-start-a-cloud-kitchen-on-swiggy-and-zomato-2026-guide",
      "swiggy-listing-optimization-the-complete-guide-for-restaurant-owners",
      "zomato-listing-optimization-the-complete-guide-for-restaurant-owners",
      "should-your-restaurant-be-on-both-swiggy-and-zomato",
      "how-to-read-your-swiggy-and-zomato-payout-statement",
    ],
  },
  {
    slug: "menu-optimization",
    name: "Menu Optimization",
    shortName: "Menu",
    summary:
      "Improving menu layout and item placement to make dishes look attractive and sell better effortlessly.",
    description:
      "Your menu is the conversion surface. We restructure category order, rewrite item names and descriptions for search, engineer combos toward higher average order value, and cut the long tail of items that dilute the listing without earning their place.",
    outcome: "Higher conversion on the same traffic, and a bigger basket per order.",
    deliverables: [
      "Category and item sequencing rebuilt around demand",
      "Search-aware item naming and descriptions",
      "Combo and add-on engineering to lift average order value",
      "Bestseller and recommended-section strategy",
      "Loss-making and low-velocity items identified and retired",
    ],
    icon: "menu",
    accent: "#E0A82E",
    relatedPosts: [
      "menu-optimization-for-delivery-how-to-design-a-menu-that-sells-on-swiggy-and-zomato",
      "restaurant-menu-pricing-strategy-for-online-delivery-in-india",
      "food-cost-control-for-restaurants-how-to-protect-margins-on-delivery",
    ],
  },
  {
    slug: "delivery-sales-growth",
    name: "Sales Growth — Delivery",
    shortName: "Delivery growth",
    summary:
      "Easy delivery improvements that increase online visibility, customer clicks, and overall monthly sales growth.",
    description:
      "A structured programme against the signals the aggregator algorithms actually reward: acceptance rate, prep-time accuracy, rating velocity and menu conversion. We fix the operational inputs first, then buy visibility — in that order, because ads on a broken listing just cost more.",
    outcome: "Compounding organic rank, then paid spend that returns instead of leaks.",
    deliverables: [
      "Full ranking-signal audit across both platforms",
      "Acceptance rate, prep time and availability remediation",
      "Rating recovery programme toward the 4.2+ visibility threshold",
      "Discount and offer architecture that protects contribution margin",
      "Weekly reporting against orders, AOV and net realisation",
    ],
    icon: "truck",
    accent: "#EA552B",
    relatedPosts: [
      // The 30-day guide redirects here since the November 2026 merge.
      "how-to-increase-swiggy-orders",
      "how-to-increase-zomato-orders-a-data-driven-guide-for-restaurants",
      "how-swiggy-ranking-algorithm-works-for-restaurants-2026",
      "why-most-restaurants-fail-on-swiggy-and-zomato-and-how-to-fix-it",
      "swiggy-zomato-discounts-which-offers-make-money",
    ],
  },
  {
    slug: "dine-in-sales-growth",
    name: "Sales Growth — Dine-In",
    shortName: "Dine-in growth",
    summary:
      "Simple strategies that increase dine-in orders, improve guest flow, and boost daily restaurant revenue.",
    description:
      "Dineout and Zomato Dine-In are their own discovery engines with their own rules. We build the listing, structure the offer ladder so it fills weak day-parts rather than discounting your peak, and turn walk-ins into a reviewing, returning base.",
    outcome: "Fuller tables on the days that were quiet, without cannibalising Friday night.",
    deliverables: [
      "Dineout and Zomato Dine-In listing build and optimisation",
      "Day-part-specific offer ladder to shift demand, not discount it",
      "Table booking funnel and walk-in conversion tracking",
      "Review generation loop from the floor",
      "Ambience, footfall and event calendar planning",
    ],
    icon: "store",
    accent: "#5FB37A",
    relatedPosts: [
      "zomato-dine-in-growth-how-to-increase-table-bookings-and-walk-ins",
      "swiggy-dineout-vs-zomato-dine-in",
      "how-to-improve-zomato-ratings-7-proven-tactics-that-work",
    ],
  },
  {
    slug: "aggregator-ads",
    name: "Aggregator Ads Management",
    shortName: "Ads management",
    summary:
      "Swiggy and Zomato ads managed around return on ad spend, rupee by rupee.",
    description:
      "We manage aggregator ads as a media buy with a P&L attached to it. Budgets are allocated by hour and day-part against observed conversion, bids are managed against contribution margin, and every rupee is reported against the orders it actually produced.",
    outcome: "Ad spend that pays for itself and a ranking lift that outlasts the campaign.",
    deliverables: [
      "Hour-by-hour and day-part budget allocation",
      "Bid management against contribution margin",
      "Creative, banner and offer testing cycles",
      "Cannibalisation checks between organic and paid placement",
      "ROAS reporting tied to net realisation after commission",
    ],
    icon: "target",
    accent: "#F0A63C",
    relatedPosts: [
      "swiggy-ads-strategy-how-to-get-5x-roas-without-wasting-budget",
      "zomato-ads-for-restaurants-complete-strategy-and-budget-guide",
      "best-time-to-run-ads-on-swiggy-hour-by-hour-breakdown",
      "swiggy-vs-zomato-ads-where-should-you-spend-your-ad-budget",
    ],
  },
  {
    slug: "food-photography",
    name: "Food Photography",
    shortName: "Photography",
    summary:
      "Professional food photos that make your dishes look appealing and attract more online customers.",
    description:
      "The thumbnail is the advertisement. We shoot to aggregator specification — correct crop, correct plating, correct light — so that dishes hold their appeal at the size a customer actually sees them, on a phone, in a list of forty competitors.",
    outcome: "A listing that earns the tap before anyone has read a word.",
    deliverables: [
      "On-site or studio shoot with food styling",
      "Aggregator-spec crops and resolutions for both platforms",
      "Hero, category banner and offer creative sets",
      "Retouching and consistent colour grade across the catalogue",
      "Social-ready cutdowns for Meta campaigns",
    ],
    icon: "camera",
    accent: "#C2557F",
    relatedPosts: [
      "menu-optimization-for-delivery-how-to-design-a-menu-that-sells-on-swiggy-and-zomato",
      "swiggy-listing-optimization-the-complete-guide-for-restaurant-owners",
    ],
  },
  {
    slug: "meta-ads",
    name: "Meta Ads",
    shortName: "Meta ads",
    summary:
      "Running targeted Meta Ads on Facebook and Instagram to promote your restaurant and reach more customers online.",
    description:
      "Aggregators own the transaction; Meta is where you build the demand that arrives pre-sold. We run geo-fenced campaigns around your delivery radius to drive both direct orders and branded search on the platforms — the traffic that converts best and costs least.",
    outcome: "Demand you own, feeding the channel that charges you the least to serve it.",
    deliverables: [
      "Geo-fenced campaigns matched to your delivery radius",
      "Creative production from the photography library",
      "Direct-ordering and WhatsApp conversion funnels",
      "Retargeting pools built from engagement and order data",
      "Blended CAC reporting across Meta and aggregator channels",
    ],
    icon: "rocket",
    accent: "#8ED1FC",
    relatedPosts: [
      "restaurant-aggregator-dependency-how-to-build-a-profitable-channel-mix",
      "how-to-reduce-swiggy-commission-impact-on-restaurant-margins",
    ],
  },
  {
    slug: "event-consulting",
    name: "Event Consulting & Management",
    shortName: "Events",
    summary:
      "Planning engaging restaurant events that increase customer visits, improve ambience, and boost footfall.",
    description:
      "Events are the fastest way to fill a dead Tuesday and the cheapest content you will ever produce. We plan the calendar, handle the execution, and make sure the night converts into reviews, reels and repeat covers rather than a one-off spike.",
    outcome: "A reason to visit on the nights nobody was visiting.",
    deliverables: [
      "Quarterly event calendar built around weak day-parts",
      "Concept, artist and vendor coordination",
      "Promotion across Meta, aggregator banners and community channels",
      "On-night content capture for the following month's campaigns",
      "Post-event review and repeat-visit measurement",
    ],
    icon: "calendar",
    accent: "#9B51E0",
    relatedPosts: ["zomato-dine-in-growth-how-to-increase-table-bookings-and-walk-ins"],
  },
  {
    slug: "food-licensing",
    name: "Food Licensing",
    shortName: "Licensing",
    summary:
      "Helping you complete all restaurant licenses smoothly with correct documents and faster approval support.",
    description:
      "FSSAI, GST, trade licence, fire clearance — the paperwork that blocks a launch and, when it lapses, silently delists you mid-season. We prepare, file and track every application, and keep a renewal calendar so nothing expires without warning.",
    outcome: "Compliant, uninterrupted, and never delisted over an expired certificate.",
    deliverables: [
      "FSSAI registration and licence upgrades",
      "GST registration and aggregator tax configuration",
      "Trade licence, fire and health clearance coordination",
      "Document preparation and application tracking",
      "Renewal calendar with advance reminders",
    ],
    icon: "shield",
    accent: "#5FB37A",
    relatedPosts: ["how-to-start-a-cloud-kitchen-on-swiggy-and-zomato-2026-guide"],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);

// ---------------------------------------------------------------------------
// Engagement model
// ---------------------------------------------------------------------------

export const processSteps = [
  {
    step: "01",
    name: "Consultation",
    headline: "Swiggy & Zomato growth audit",
    body: "We go inside your live dashboards and read the numbers that decide your rank — acceptance rate, prep-time accuracy, rating velocity, menu conversion, funnel drop-off. You get the real diagnosis before anyone talks about a retainer.",
    duration: "Week 1",
  },
  {
    step: "02",
    name: "Strategy",
    headline: "An aggregator-first growth plan",
    body: "A written plan with sequencing, owners and targets. What gets fixed operationally, what gets rebuilt on the listing, what gets spent on ads, and the order it happens in — because ads on a broken listing only buy expensive impressions.",
    duration: "Week 2",
  },
  {
    step: "03",
    name: "Execution",
    headline: "Menu, ads and listing optimisation",
    body: "We do the work, not just the deck. Menus restructured, descriptions rewritten, photography refreshed, campaigns built and bid-managed, operational leaks closed with your kitchen team.",
    duration: "Weeks 3–8",
  },
  {
    step: "04",
    name: "Results",
    headline: "Sales that actually scale",
    body: "Weekly reporting against orders, average order value and net realisation after commission. Ranking improvements typically show within two to four weeks of the operational fixes landing.",
    duration: "Ongoing",
  },
] as const;

// ---------------------------------------------------------------------------
// Social proof — client-supplied testimonials from the existing site.
// ---------------------------------------------------------------------------

export const testimonials = [
  {
    quote:
      "Sales grew from ₹12 lakh to ₹70 lakh a month within four months. The change was in how the listing and menu were structured — the demand was always there, we just weren't visible to it.",
    author: "Ivoryy Fusion Bar",
    role: "Delhi NCR",
    highlight: "10L → 50L in 2 months",
  },
  {
    quote:
      "Our search ranking improved and the quality of order flow changed completely. Fewer cancellations, better baskets, more repeat customers.",
    author: "Giani Ice Cream",
    role: "Multi-outlet brand",
    highlight: "Ranking + order quality",
  },
  {
    quote:
      "Consistent growth in orders and repeat customers, month after month. It stopped being a guessing game.",
    author: "Punjabi Rasoi",
    role: "Casual dining",
    highlight: "Consistent monthly growth",
  },
  {
    quote:
      "The menu improvements and targeted campaigns made the difference. We finally understood which items were carrying the business and which were quietly costing us.",
    author: "Stories Bar & Kitchen",
    role: "Bar & kitchen",
    highlight: "Menu + campaign strategy",
  },
] as const;

/**
 * Client logo wall. These are the brands the business already displays, with
 * their own marks — far stronger proof than a list of names set in type.
 *
 * `invert` flags a logo that is dark-on-light and would otherwise disappear
 * against the site's ground; those get a light plate behind them.
 */
export const clients = [
  { name: "Giani Ice Cream", logo: "/clients/giani.jpeg", type: "Ice cream · Multi-outlet" },
  { name: "Ivoryy Fusion Bar", logo: "/clients/ivoryy.png", type: "Fusion bar · Delhi NCR" },
  { name: "Chai Sutta Bar", logo: "/clients/chai-sutta-bar.png", type: "Café chain" },
  { name: "Punjabi Rasoi", logo: "/clients/punjabi-rasoi.png", type: "Casual dining" },
  { name: "Stories Bar & Kitchen", logo: "/clients/stories-bar-kitchen.png", type: "Bar & kitchen" },
  { name: "Drama", logo: "/clients/drama.png", type: "Bar & lounge" },
  { name: "Snowberry", logo: "/clients/snowberry.png", type: "Desserts" },
  { name: "Honey & Dough", logo: "/clients/honey-and-dough.png", type: "Bakery & café" },
] as const;

// ---------------------------------------------------------------------------
// The platforms the whole practice is built around. Their brand colours are
// used deliberately and sparingly — as identification, so a restaurant owner
// recognises within a second that this is a Swiggy and Zomato specialist.
// ---------------------------------------------------------------------------

export const platforms = [
  {
    slug: "swiggy",
    name: "Swiggy",
    color: "#FC8019",
    tagline: "Listing, ranking, ads & Dineout",
    points: [
      "Acceptance rate and prep-time accuracy",
      "Menu conversion and bestseller placement",
      "Ads bid-managed against contribution margin",
    ],
  },
  {
    slug: "zomato",
    name: "Zomato",
    color: "#E23744",
    tagline: "Rank, ratings, ads & Dine-In",
    points: [
      "Rating recovery past the 4.2 visibility threshold",
      "Commission and net-realisation modelling",
      "Dine-In offers that fill weak day-parts",
    ],
  },
] as const;

export const cities = [
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Chandigarh",
  "Jaipur",
  "Lucknow",
  "Ahmedabad",
] as const;

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

/**
 * Deepak leads the practice and is the name the business goes to market with —
 * he is the default byline on articles, the person named on the about page, and
 * the contact a prospect is introduced to. Saurav is listed alongside him.
 */
export const founders = [
  {
    slug: "deepak-desh-bandhu",
    name: "Deepak Desh Bandhu",
    role: "Founder & Lead Consultant",
    lead: true,
    bio: "Deepak leads every engagement at Plateful. He has worked closely with restaurants across every format the Indian market runs — QSRs, cloud kitchens, casual dining and premium dine-in brands — and his work centres on Swiggy and Zomato platform strategy, menu design and ad optimisation: the levers that decide whether a listing is found, tapped and ordered from. If you work with Plateful, you work with Deepak.",
    focus: ["Swiggy & Zomato strategy", "Menu engineering", "Ad optimisation"],
  },
  {
    slug: "saurav-gosain",
    name: "Saurav Gosain",
    role: "Co-Founder — Growth Systems",
    lead: false,
    bio: "Saurav supports the practice on performance analytics and operational alignment, building the measurement layer that makes each strategy repeatable across outlets.",
    focus: ["Performance analytics", "Operational alignment"],
  },
] as const;

/** The lead consultant, referenced wherever a single person is named. */
export const leadFounder = founders[0];

// ---------------------------------------------------------------------------
// Blog taxonomy. Mirrors the categories created by the migration script.
// ---------------------------------------------------------------------------

export const categories = [
  {
    slug: "platform-ranking",
    name: "Platform & Ranking",
    description: "How the Swiggy and Zomato algorithms decide who gets seen — and how to move up them.",
    accent: "#F7D045",
    order: 1,
  },
  {
    slug: "ads-and-roas",
    name: "Ads & ROAS",
    description: "Budget allocation, bidding and creative strategy for aggregator and Meta advertising.",
    accent: "#EA552B",
    order: 2,
  },
  {
    slug: "menu-strategy",
    name: "Menu Strategy",
    description: "Menu engineering, item sequencing and descriptions that convert browsers into orders.",
    accent: "#E0A82E",
    order: 3,
  },
  {
    slug: "margins-and-pricing",
    name: "Margins & Pricing",
    description: "Commission structures, food cost and pricing so that growth in orders is growth in profit.",
    accent: "#5FB37A",
    order: 4,
  },
  {
    slug: "ratings-and-reviews",
    name: "Ratings & Reviews",
    description: "Rating recovery, review velocity and complaint handling — the fastest lever on visibility.",
    accent: "#C2557F",
    order: 5,
  },
  {
    slug: "dine-in-growth",
    name: "Dine-In Growth",
    description: "Dineout, Zomato Dine-In, table bookings and turning walk-ins into regulars.",
    accent: "#8ED1FC",
    order: 6,
  },
  {
    slug: "consulting-and-growth",
    name: "Consulting & Growth",
    description: "Choosing a consultant, cloud-kitchen launches and city-specific market notes.",
    accent: "#9B51E0",
    order: 7,
  },
] as const;

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

// ---------------------------------------------------------------------------
// FAQ — used on the contact page and emitted as FAQPage structured data.
// ---------------------------------------------------------------------------

export const faqs = [
  {
    q: "How quickly do results usually show?",
    a: "Operational fixes — acceptance rate, prep-time accuracy, availability — typically move ranking within two to four weeks. Menu and listing changes show up in conversion almost immediately. Rating recovery is the slowest lever and generally takes six to eight weeks of consistent review velocity.",
  },
  {
    q: "Do you work with single outlets or only chains?",
    a: "Both. A large share of our work is single-outlet restaurants and cloud kitchens where one person is making every decision. The diagnosis is the same; the difference is how much of the execution we take on directly.",
  },
  {
    q: "Do you need access to our Swiggy and Zomato dashboards?",
    a: "Yes. The audit is built from your live partner dashboards — that is where the ranking signals, funnel data and net realisation actually live. We work with restricted access and never change pricing or offers without written approval.",
  },
  {
    q: "Is this just running ads for us?",
    a: "No, and we usually recommend against starting there. Ads amplify whatever your listing already does. If conversion, ratings or prep times are broken, advertising buys the same problem at a higher price. Ads come after the operational and listing work.",
  },
  {
    q: "Which cities do you cover?",
    a: "We work PAN India — Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai and every other major market. Aggregator work is largely remote; photography and event execution are scheduled on site.",
  },
  {
    q: "What does engagement cost?",
    a: "It depends on outlet count, the services in scope and whether we are executing or advising. The growth audit is where every engagement starts — get in touch and we will scope it against your current numbers rather than quote blind.",
  },
] as const;

// ---------------------------------------------------------------------------
// Author profiles. Only people listed here get an /author/<slug> page; every
// other byline links to the about page.
// ---------------------------------------------------------------------------

export const authorProfiles = {
  "deepak-desh-bandhu": {
    slug: "deepak-desh-bandhu",
    name: "Deepak Desh Bandhu",
    role: "Founder & Lead Consultant",
    linkedin: "https://www.linkedin.com/in/deepakdeshbandhu/",
    /** Search snippet for the profile page: ≤155 characters, full sentence. */
    metaDescription:
      "Deepak Desh Bandhu, founder of Plateful Consulting, has spent 7+ years inside Swiggy and Zomato dashboards and worked with 650+ restaurants.",
    summary:
      "Deepak Desh Bandhu is the founder and lead consultant of Plateful Consulting. He has spent 7+ years working inside Swiggy and Zomato partner dashboards, has worked with 650+ restaurants and has managed ₹8Cr+ in aggregator ad spend.",
    story: [
      "Deepak learned the delivery platforms as an operator before he advised anyone on them. Around 2019 he bootstrapped his own cloud kitchen, serving Chinese and Continental food, and grew it to roughly ₹5 lakh a month in sales within six months.",
      "He kept that kitchen running through COVID, when delivery was the channel most restaurants depended on and every listing decision showed up in the next payout. He later relocated to Bangalore and took a job.",
      "He then co-founded Plateful Consulting with a couple of friends who had also run their own kitchens. The practice is built on that operator experience: the work starts in the partner dashboards, and every recommendation is measured against what reaches the restaurant after commission.",
    ],
    credentials: [
      { value: "7+", label: "Years on Swiggy and Zomato" },
      { value: "650+", label: "Restaurants worked with" },
      { value: "₹8Cr+", label: "Swiggy and Zomato ad spend managed" },
      { value: "2019", label: "Launched his own cloud kitchen" },
    ],
    knowsAbout: [
      "Swiggy restaurant growth",
      "Zomato restaurant growth",
      "Swiggy and Zomato ads",
      "Restaurant menu engineering",
      "Cloud kitchen operations",
      "Aggregator commission and payouts",
      "Restaurant ratings and reviews",
    ],
  },
} as const;

export type AuthorProfileSlug = keyof typeof authorProfiles;

/** Where a byline should link: the author's profile page if they have one. */
export function authorHref(slug: string | null | undefined) {
  return slug && slug in authorProfiles ? `/author/${slug}` : "/about-us";
}

// ---------------------------------------------------------------------------
// Answer-first copy. Short, direct answers placed high on a page so search
// engines and AI assistants can lift them verbatim.
// ---------------------------------------------------------------------------

export const homeDefinition =
  "Plateful Consulting is a Swiggy and Zomato restaurant sales consultancy based in Noida and working with restaurants across India. Since 2019 it has helped 650+ restaurants — QSRs, cloud kitchens, cafés, casual and fine dining — grow delivery and dine-in sales through listing optimisation, menu engineering, aggregator ads management and rating recovery.";

export const servicesAnswer = {
  question: "What does a Swiggy and Zomato consultant do?",
  answer:
    "A Swiggy and Zomato consultant improves how a restaurant performs on the delivery platforms. That means auditing the partner dashboards, fixing the ranking signals (acceptance rate, prep time, ratings), rebuilding the menu and listing so they convert, managing aggregator ads against margin, and reporting on net realisation after commission, so more orders also mean more profit.",
} as const;

export const servicesFaqs = [
  {
    q: "Which services does Plateful Consulting offer?",
    a: "Nine: Swiggy and Zomato onboarding, menu optimisation, delivery sales growth, dine-in sales growth, aggregator ads management, food photography, Meta ads, event consulting and food licensing. Most restaurants start with the growth audit, and the audit decides which of these are worth doing first.",
  },
  {
    q: "How is pricing decided?",
    a: "Engagements are scoped rather than sold from a rate card. The fee depends on outlet count, the services in scope and whether we execute the work or advise your team. Every engagement starts with a growth audit of your live dashboards, and the proposal is built from what that audit finds.",
  },
  {
    q: "How does an engagement work?",
    a: "In four stages: a growth audit of your Swiggy and Zomato dashboards in week one, a written plan with owners and targets in week two, execution across menu, listing, ads and operations in weeks three to eight, then ongoing weekly reporting on orders, average order value and net realisation.",
  },
  {
    q: "How long before we see results?",
    a: "Operational fixes such as acceptance rate and prep-time accuracy typically move ranking within two to four weeks. Menu and listing changes show up in conversion almost immediately. Rating recovery is the slowest lever and generally takes six to eight weeks of consistent review velocity.",
  },
  {
    q: "Do you guarantee a number of orders?",
    a: "No. Results depend on your city, cuisine, price point and starting position, and no one outside Swiggy and Zomato controls their algorithms. What we commit to is the diagnosis, the execution and weekly reporting against the numbers that matter.",
  },
  {
    q: "Can you reduce what we pay Swiggy and Zomato?",
    a: "Often, through legitimate levers: reviewing contract terms at renewal, restructuring the discounts you fund, pricing the delivery menu correctly and building direct-ordering channels. The saving typically shows in net realisation per order rather than in the headline commission rate, and it varies by contract.",
  },
  {
    q: "Which cities do you work in?",
    a: "PAN India, including Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai, Chandigarh, Jaipur, Lucknow and Ahmedabad. Aggregator work is largely remote; photography and event execution are scheduled on site.",
  },
  {
    q: "Do you work with single outlets and cloud kitchens?",
    a: "Yes. A large share of our work is single-outlet restaurants and cloud kitchens, alongside multi-outlet chains. The diagnosis is the same; the difference is how much of the execution we take on directly.",
  },
] as const;

// ---------------------------------------------------------------------------
// Topic hubs. Each hub groups existing articles by slug; any slug that is not
// published is skipped, and newer articles whose titles match `keywords` are
// listed under "More on this topic".
// ---------------------------------------------------------------------------

export type TopicHub = {
  slug: string;
  title: string;
  /** Short name for links and breadcrumbs. */
  shortName: string;
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  groups: { name: string; description: string; slugs: string[] }[];
  keywords: string[];
  /** Service the hub points readers toward. */
  service: string;
};

export const topicHubs: TopicHub[] = [
  {
    slug: "swiggy-growth-guide",
    title: "Swiggy growth guide for restaurants",
    shortName: "Swiggy growth guide",
    eyebrow: "Topic hub · Swiggy",
    metaTitle: "Swiggy Growth Guide for Restaurants",
    metaDescription:
      "How to grow restaurant sales on Swiggy: ranking signals, listing and menu optimisation, Swiggy ads, ratings and margins, grouped by lever.",
    intro:
      "How do you grow restaurant sales on Swiggy? Swiggy ranks restaurants on signals it can measure: how reliably you accept orders, how accurate your prep times are, how well your menu turns browsers into orders, and how your rating moves over time. Growth usually comes from fixing those inputs first, with a complete listing, a cleaner menu, realistic prep times and a rating above the 4.2 visibility threshold, and only then buying visibility with Swiggy ads budgeted by hour against contribution margin. The guides below walk through each lever in the order we apply them with restaurant partners.",
    groups: [
      {
        name: "Ranking and visibility",
        description: "How Swiggy decides who gets seen, and the listing work that moves you up.",
        slugs: [
          "how-swiggy-ranking-algorithm-works-for-restaurants-2026",
          "swiggy-listing-optimization-the-complete-guide-for-restaurant-owners",
          "how-to-increase-swiggy-orders",
        ],
      },
      {
        name: "Swiggy ads",
        description: "Budgets, timing and bids that return more than they cost.",
        slugs: [
          "swiggy-ads-strategy-how-to-get-5x-roas-without-wasting-budget",
          "best-time-to-run-ads-on-swiggy-hour-by-hour-breakdown",
          "swiggy-vs-zomato-ads-where-should-you-spend-your-ad-budget",
        ],
      },
      {
        name: "Ratings, offers and margins",
        description: "Rating recovery, discounts and commission, so more orders mean more profit.",
        slugs: [
          "swiggy-restaurant-rating-how-to-go-from-3-8-to-4-5-in-60-days",
          "swiggy-zomato-discounts-which-offers-make-money",
          "how-to-reduce-swiggy-commission-impact-on-restaurant-margins",
        ],
      },
      {
        name: "Swiggy vs Zomato",
        description: "Choosing where to list, where to spend and how to run both.",
        slugs: [
          "should-your-restaurant-be-on-both-swiggy-and-zomato",
          "swiggy-dineout-vs-zomato-dine-in",
        ],
      },
      {
        name: "Getting expert help",
        description: "When to bring in a consultant, and what to check before you hire one.",
        slugs: [
          "best-restaurant-consultant-in-delhi-ncr-what-to-look-for",
          "what-does-a-restaurant-consultant-actually-do-roles-cost-roi",
          "is-hiring-a-swiggy-and-zomato-consultant-worth-it-roi-case-study",
        ],
      },
    ],
    keywords: ["Swiggy"],
    service: "delivery-sales-growth",
  },
  {
    slug: "zomato-growth-guide",
    title: "Zomato growth guide for restaurants",
    shortName: "Zomato growth guide",
    eyebrow: "Topic hub · Zomato",
    metaTitle: "Zomato Growth Guide for Restaurants",
    metaDescription:
      "How to get more orders on Zomato: ranking, listing optimisation, Zomato ads, ratings and reviews, Dine-In and commission, grouped by lever.",
    intro:
      "How do restaurants get more orders on Zomato? Zomato decides who gets seen using signals such as rating and review velocity, delivery and prep-time reliability, listing completeness and how often people who open your menu go on to order. Restaurants that grow consistently fix those signals first: accurate cuisine tags, strong photography, a menu sequenced around bestsellers and a rating that clears the 4.2 mark. Ads come after, once the listing already converts. Zomato Dine-In runs on its own rules for table bookings and walk-ins. The guides below cover ranking, ads, ratings, dine-in and commission in turn.",
    groups: [
      {
        name: "Ranking and listing",
        description: "How the Zomato algorithm ranks restaurants, and how to build a listing it rewards.",
        slugs: [
          "zomato-restaurant-ranking-how-the-algorithm-decides-who-gets-seen",
          "zomato-listing-optimization-the-complete-guide-for-restaurant-owners",
          "how-to-increase-zomato-orders-a-data-driven-guide-for-restaurants",
        ],
      },
      {
        name: "Zomato ads",
        description: "Strategy and budgets for Zomato advertising.",
        slugs: [
          "zomato-ads-for-restaurants-complete-strategy-and-budget-guide",
          "swiggy-vs-zomato-ads-where-should-you-spend-your-ad-budget",
        ],
      },
      {
        name: "Ratings and reviews",
        description: "The fastest lever on Zomato visibility, and how to protect it.",
        slugs: [
          "how-to-improve-zomato-ratings-7-proven-tactics-that-work",
          "how-to-handle-negative-reviews-on-zomato-without-losing-rankings",
          "restaurant-packaging-for-delivery-how-to-reduce-negative-reviews-by-40",
        ],
      },
      {
        name: "Dine-In and commission",
        description: "Table bookings, walk-ins and what Zomato actually charges.",
        slugs: [
          "zomato-dine-in-growth-how-to-increase-table-bookings-and-walk-ins",
          "swiggy-dineout-vs-zomato-dine-in",
          "zomato-commission-structure-2026-what-restaurants-actually-pay",
        ],
      },
    ],
    keywords: ["Zomato"],
    service: "delivery-sales-growth",
  },
  {
    slug: "restaurant-commission-and-payouts",
    title: "Swiggy and Zomato commission and payouts",
    shortName: "Commission & payouts",
    eyebrow: "Topic hub · Margins",
    metaTitle: "Swiggy & Zomato Commission and Payouts Guide",
    metaDescription:
      "What Swiggy and Zomato deduct from each order, how to read your payout statement and the legitimate levers that protect restaurant margins.",
    intro:
      "What do Swiggy and Zomato actually take from each order, and how do you keep more of it? Your payout is the order value minus the platform commission, GST on that commission, payment and other platform fees, any discount you funded and, if you run them, ads billed against your settlements. Commission rates vary by contract, city and the services you opt into, so the number that matters is net realisation per order rather than the headline percentage. Restaurants typically protect margin through legitimate levers: reviewing terms at renewal, restructuring discounts, pricing the menu for delivery and building direct channels. The guides below explain each one.",
    groups: [
      {
        name: "Commission structures",
        description: "What each platform charges, side by side.",
        slugs: [
          "zomato-commission-structure-2026-what-restaurants-actually-pay",
          "swiggy-vs-zomato-commission-side-by-side-comparison-for-2026",
          "how-to-reduce-swiggy-commission-impact-on-restaurant-margins",
        ],
      },
      {
        name: "Payouts and statements",
        description: "Reading the settlement line by line.",
        slugs: ["how-to-read-your-swiggy-and-zomato-payout-statement"],
      },
      {
        name: "Discounts, pricing and food cost",
        description: "Keeping growth in orders from turning into a loss in margin.",
        slugs: [
          "swiggy-zomato-discounts-which-offers-make-money",
          "restaurant-menu-pricing-strategy-for-online-delivery-in-india",
          "food-cost-control-for-restaurants-how-to-protect-margins-on-delivery",
        ],
      },
      {
        name: "Lower-commission channels",
        description: "Direct ordering, ONDC and zero-commission apps, and when they pay off.",
        slugs: [
          "direct-ordering-vs-swiggy-and-zomato-when-your-own-channel-pays-off",
          "restaurant-aggregator-dependency-how-to-build-a-profitable-channel-mix",
          "ondc-for-restaurants-is-it-worth-listing-in-2026",
          "rapido-ownly-for-restaurants-is-zero-commission-worth-it",
        ],
      },
    ],
    keywords: ["commission", "payout", "margin", "fees"],
    service: "delivery-sales-growth",
  },
];

export const topicHubBySlug = (slug: string) => topicHubs.find((h) => h.slug === slug);

// ---------------------------------------------------------------------------
// Client results (/results). Every figure comes from the client's own Swiggy /
// Zomato partner dashboards or PFC's daily sales register, and the clients
// approved being named. Copy numbers exactly as supplied: never round up and
// never add a figure that is not in the source.
// ---------------------------------------------------------------------------

export type CaseStudyRow = {
  metric: string;
  before: string;
  after: string;
  /** Change as stated in the source, e.g. "+51.8%". Omitted when none was given. */
  change?: string;
};

export type CaseStudy = {
  slug: string;
  name: string;
  /** Kind of outlet, e.g. "Dine-in · high average order value". */
  type: string;
  /** Chip text on the card: the headline result, stated plainly. */
  highlight: string;
  onboarded: string;
  /** The before and after windows being compared. */
  period: string;
  beforeLabel: string;
  afterLabel: string;
  rows: CaseStudyRow[];
  /** Generic description of the work. No invented specifics. */
  work: string;
  /** Caveats that belong next to the numbers (spend increases, prior trend). */
  notes: string[];
};

export const resultsPage = {
  path: "/results",
  title: "Client results: Swiggy & Zomato growth case studies",
  shortName: "Client results",
  metaTitle: "Client Results: Swiggy & Zomato Case Studies",
  metaDescription:
    "Swiggy and Zomato sales before and after for nine Plateful Consulting client outlets, with ad spend and method shown. Individual results, not guarantees.",
  intro:
    "Plateful Consulting works inside a restaurant's Swiggy and Zomato dashboards: listing and visibility, menu, ad structure and new-customer targeting. For the nine outlets below, from Delhi NCR to Hyderabad, platform sales after onboarding ranged from 22.1% higher (Drama on Zomato) to several times the starting level for newer delivery brands. Balaji Dhaba, our first Hyderabad case, shows growth tracked over time on a monthly retainer, and Olantic 8 in Gurugram shows a brand-new delivery launch. Where we have spend data, ad or discount spend rose too, and we show it.",
  disclaimer:
    "Results vary; these are individual client outcomes, not guarantees. City, cuisine, price point and starting position all change what is possible.",
  source:
    "Source: each client's Swiggy and Zomato partner dashboards and PFC's daily sales register. Clients approved being named.",
  method: [
    {
      title: "Fixed before and after windows",
      body: "Each case compares the period just before PFC took over with a period after it, from the same source. Where the two windows are different lengths, we compare per-day figures so the comparison is like for like.",
    },
    {
      title: "Net sale and GMV are labelled",
      body: "Net sale is what the platform reports after discounts; GMV is gross order value before them. They are not interchangeable, so each row uses the metric name from the partner dashboard it came from.",
    },
    {
      title: "Spend is shown next to sales",
      body: "Most of these outlets also spent more on platform ads or discounts after onboarding. Where we have that figure it sits beside the sales number, and for Drama we show net sale earned per ₹1 of added ad spend.",
    },
    {
      title: "Transition and partial months are left out",
      body: "The month PFC takes over mixes old and new settings, and a month still in progress is incomplete. Where a case uses monthly averages, both are excluded.",
    },
  ],
} as const;

export const caseStudies: CaseStudy[] = [
  {
    slug: "drama",
    name: "Drama — An Ode to Indian Cinema",
    type: "Dine-in · high average order value",
    highlight: "Combined net sale +51.8% a month",
    onboarded: "Results within two months of PFC taking over",
    period: "Average of the two months before PFC vs the average of the two months after, with the handover month left out.",
    beforeLabel: "Before (monthly avg)",
    afterLabel: "After (monthly avg)",
    rows: [
      { metric: "Combined net sale / month", before: "₹33.81 lakh", after: "₹51.32 lakh", change: "+51.8%" },
      { metric: "Swiggy net sale / month", before: "₹13.62 lakh", after: "₹26.67 lakh", change: "+95.8%" },
      { metric: "Zomato net sale / month", before: "₹20.19 lakh", after: "₹24.66 lakh", change: "+22.1%" },
      { metric: "Ad spend / month (both platforms)", before: "₹1.94 lakh", after: "₹6.19 lakh" },
      { metric: "New customers / month", before: "372", after: "754" },
    ],
    work: "Visibility and listing work, ad restructuring on both platforms and new-customer acquisition targeting.",
    notes: [
      "Ad spend rose from ₹1.94 lakh to ₹6.19 lakh a month. Each ₹1 of added ad spend came with ₹4.12 of added net sale overall: ₹5.67 on Swiggy and ₹2.29 on Zomato.",
    ],
  },
  {
    slug: "balaji-dhaba",
    name: "Balaji Dhaba, Marredpally, Hyderabad",
    type: "Dhaba · delivery",
    highlight: "Zomato weekly orders ~236 → ~796 (3.4x)",
    onboarded: "Monthly retainer; Zomato tracked over about a year",
    period:
      "Zomato: average weekly delivered orders over about a year, and monthly figures over five months. Swiggy: about 10 weeks of dashboard data, month one vs month two and the first week vs the peak week.",
    beforeLabel: "Earlier",
    afterLabel: "Later",
    rows: [
      { metric: "Zomato delivered orders / week (average)", before: "~236", after: "~796", change: "3.4x" },
      { metric: "Zomato sales / month", before: "₹7.60 lakh", after: "₹12.17 lakh", change: "+60%" },
      { metric: "Zomato delivered orders / month", before: "2,054", after: "3,031", change: "+48%" },
      { metric: "Zomato average order value", before: "₹370", after: "₹401" },
      { metric: "Zomato menu-to-order conversion", before: "7.6%", after: "8.8%" },
      { metric: "Swiggy revenue / month (month one vs two)", before: "₹14.47 lakh", after: "₹16.99 lakh", change: "+17.4%" },
      { metric: "Swiggy orders / month (month one vs two)", before: "2,788", after: "3,444", change: "+23.5%" },
      { metric: "Swiggy orders / week (first week vs peak)", before: "547", after: "906", change: "+66%" },
    ],
    work: "Delivery growth on a monthly retainer: visibility, menu conversion and ad efficiency on Zomato and Swiggy.",
    notes: [
      "The peak week flatters the Swiggy picture. On a sustained basis, the last three full weeks vs the first three were up 16% in orders and 13% in revenue.",
      "Over six months, Zomato sales totalled ₹59.6 lakh from 15,262 delivered orders. Across about 10 weeks, Swiggy revenue was ₹37.5 lakh from 7,363 orders, and Swiggy ads returned 16.6x (₹17.2 lakh of ads GMV on ₹1.04 lakh of spend).",
      "Growth came from a mix of visibility, conversion and ads. Zomato tags most of this outlet's sales as ad-attributed.",
      "The Swiggy figures compare weeks within the tracked window, not before and after PFC.",
      "PFC does not claim credit for rating changes, so ratings are not shown.",
    ],
  },
  {
    slug: "olantic-8",
    name: "Olantic 8, Gurugram",
    type: "Indian tandoor & Chinese · new delivery launch",
    highlight: "Online sales 12.9x in six months from launch",
    onboarded: "Launched on Swiggy and Zomato by PFC",
    period: "First full month live vs month seven. A launch-growth story from a new listing, not a before vs after comparison.",
    beforeLabel: "First full month",
    afterLabel: "Month seven",
    rows: [
      { metric: "Online sales / month (both platforms)", before: "₹28.2K", after: "₹3.65 lakh", change: "12.9x" },
      { metric: "Orders / month", before: "98", after: "1,058", change: "10.8x" },
      { metric: "Zomato sales / month", before: "₹8,085", after: "₹1,73,542", change: "21x" },
      { metric: "Swiggy sales / month", before: "₹20,140", after: "₹1,91,467", change: "9.5x" },
      { metric: "Swiggy ad return (platform-reported)", before: "4.6x", after: "8.9x" },
      { metric: "Zomato kitchen prep time", before: "26 min", after: "11 min" },
    ],
    work: "Two-platform launch, a delivery-first menu, ads scaled only as they paid back, shared discounts with Swiggy (70:30), monthly ops reviews and two extra brand storefronts from the same kitchen.",
    notes: [
      "Seven-month total: ₹13.68 lakh in online sales from 4,024 orders. Average order value held around ₹330–355 after the first month, so growth came from more orders, not bigger bills.",
      "Ad return is as reported by the platforms' ad dashboards. Swiggy ad spend grew from about ₹4.6K to ₹40.6K a month as returns held; Zomato's return fell from an early 9.3x on a tiny budget to 4.8x as spend scaled.",
      "PFC does not claim credit for rating changes, so ratings are not shown.",
    ],
  },
  {
    slug: "ivoryy-fusion-bar",
    name: "Ivoryy Fusion Bar, Connaught Place, New Delhi",
    type: "Premium fusion dining · about ₹1,800 for two",
    highlight: "₹12 lakh → ₹70 lakh a month in four months",
    onboarded: "Four months with PFC",
    period: "Monthly revenue when PFC started vs month four; early-weeks platform figures compared per day.",
    beforeLabel: "Before",
    afterLabel: "After",
    rows: [
      { metric: "Monthly revenue", before: "₹12 lakh", after: "₹70 lakh", change: "≈5.8x" },
      { metric: "Swiggy GMV / day (first weeks)", before: "~₹9,140", after: "~₹45,340", change: "≈5x" },
      { metric: "Zomato GMV / day (first weeks)", before: "~₹29,060", after: "~₹68,040", change: "≈2.3x" },
      { metric: "Swiggy rating", before: "4.4", after: "4.4" },
      { metric: "Zomato rating", before: "4.35", after: "4.37" },
    ],
    work: "Platform positioning, menu restructuring, visibility and listing work, and ad restructuring on Swiggy and Zomato.",
    notes: [
      "Monthly revenue figures are as reported by PFC for the engagement. The per-day platform figures come from the Swiggy and Zomato partner dashboards in the first weeks after onboarding.",
      "Ad spend also increased in those first weeks, roughly 5x on Swiggy and 2x on Zomato.",
    ],
  },
  {
    slug: "limitless",
    name: "Limitless",
    type: "Drama's second outlet",
    highlight: "Swiggy net order value +243.9%",
    onboarded: "Results within two months",
    period: "Month PFC started vs two months later.",
    beforeLabel: "Before",
    afterLabel: "After",
    rows: [
      { metric: "Swiggy net order value / month", before: "₹5.23 lakh", after: "₹18.00 lakh", change: "+243.9%" },
      { metric: "Bookings / month", before: "132", after: "439" },
      { metric: "New users / month", before: "99", after: "347" },
    ],
    work: "Swiggy visibility and new-user acquisition targeting. The focus now is discount efficiency.",
    notes: [
      "Discount spend also rose sharply, from ₹2.28 lakh to ₹14.44 lakh a month. Growth bought with discounts is expensive, so the work now is holding sales while spending less on discounts.",
    ],
  },
  {
    slug: "pasta-express",
    name: "Pasta Express",
    type: "Delivery brand",
    highlight: "Zomato orders 149 → 746 a month",
    onboarded: "Results in the first month",
    period: "Month PFC started vs the following month.",
    beforeLabel: "Before",
    afterLabel: "After",
    rows: [
      { metric: "Zomato sales / month", before: "₹47,264", after: "₹2,21,291", change: "≈4.7x" },
      { metric: "Zomato delivered orders / month", before: "149", after: "746" },
      { metric: "Swiggy sales / month", before: "₹18,244", after: "₹48,941", change: "≈2.7x" },
    ],
    work: "Listing, menu and ads work on both platforms.",
    notes: [],
  },
  {
    slug: "regenta-inn",
    name: "Regenta Inn",
    type: "Delivery",
    highlight: "Swiggy orders 66 → 388 a month",
    onboarded: "Results in the first month",
    period: "Month PFC started vs the following month.",
    beforeLabel: "Before",
    afterLabel: "After",
    rows: [
      { metric: "Swiggy sales / month", before: "₹29,192", after: "₹1,51,589", change: "≈5.2x" },
      { metric: "Swiggy orders / month", before: "66", after: "388" },
    ],
    work: "Swiggy listing, menu and ads work.",
    notes: [],
  },
  {
    slug: "tsoyum",
    name: "TsoYum!",
    type: "New delivery brand",
    highlight: "Swiggy orders 32 → 233 a month",
    onboarded: "Results within two months of launch",
    period: "Launch month vs two months later.",
    beforeLabel: "Before",
    afterLabel: "After",
    rows: [
      { metric: "Swiggy sales / month", before: "₹10,935", after: "₹92,180", change: "≈8.4x" },
      { metric: "Swiggy orders / month", before: "32", after: "233" },
    ],
    work: "Listing, menu and ads work for a newly launched brand.",
    notes: ["TsoYum! was a new brand, so the starting month is its launch month and the base is small."],
  },
  {
    slug: "good-gaon",
    name: "Good Gaon",
    type: "Delivery",
    highlight: "Swiggy orders 78 → 260 a month",
    onboarded: "Results within two months",
    period: "Month PFC started vs two months later.",
    beforeLabel: "Before",
    afterLabel: "After",
    rows: [
      { metric: "Swiggy sales / month", before: "₹27,172", after: "₹86,177", change: "≈3.2x" },
      { metric: "Swiggy orders / month", before: "78", after: "260" },
      { metric: "Zomato sales / month", before: "₹97,827", after: "₹1,87,043", change: "≈1.9x" },
    ],
    work: "Listing, menu and ads work on both platforms.",
    notes: [
      "Zomato sales were already rising before onboarding, so not all of the Zomato change should be read as PFC's effect.",
    ],
  },
];
