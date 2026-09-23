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
  ],
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "Blogs", href: "/blogs" },
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
      "should-your-restaurant-be-on-both-swiggy-and-zomato",
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
      "how-to-increase-swiggy-orders-in-30-days",
      "how-to-increase-zomato-orders-a-data-driven-guide-for-restaurants",
      "how-swiggy-ranking-algorithm-works-for-restaurants-2026",
      "why-most-restaurants-fail-on-swiggy-and-zomato-and-how-to-fix-it",
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
      "Sales grew from 10 lakhs to 50 lakhs within two months. The change was in how the listing and menu were structured — the demand was always there, we just weren't visible to it.",
    author: "Ivoryy Kitchen",
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
