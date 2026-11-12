/**
 * "What's new" log.
 *
 * Newest first. Two kinds of entry: things visitors can use on this site (a
 * tool, a batch of guides, a new service), and industry updates — platform
 * launches and changes restaurant owners should know about. Each entry links
 * to the relevant page here, so the page also works as a crawlable hub.
 */

export type WhatsNewEntry = {
  /** ISO date, YYYY-MM-DD: when the entry was posted. */
  date: string;
  /** Short label shown as a chip. */
  kind: "Industry update" | "New tool" | "New guides" | "New feature" | "Update";
  title: string;
  summary: string;
  links: { label: string; href: string }[];
};

export const whatsNew: WhatsNewEntry[] = [
  {
    date: "2026-11-12",
    kind: "New tool",
    title: "Free Swiggy & Zomato commission calculator",
    summary:
      "Type your monthly Swiggy and Zomato sales and your commission and payment gateway rates. The calculator shows your total commission with 18% GST, and how much a lower negotiated rate would save you each month and year.",
    links: [{ label: "Try the calculator", href: "/tools/commission-calculator" }],
  },
  {
    date: "2026-11-04",
    kind: "Industry update",
    title: "Swiggy's Toing: budget food delivery, now in 11 cities",
    summary:
      "Toing is Swiggy's separate app for low-priced meals, mostly in the ₹100–₹250 range, aimed at students and young professionals. It started in Pune and, according to Swiggy, has reached 11 cities including Delhi NCR, Agra, Vadodara, Guwahati, Nashik and Nagpur. For restaurants, it is a channel for a value menu: smaller portions and single-serve meals priced to sell, not your regular menu discounted.",
    links: [
      { label: "Pricing your menu for delivery", href: "/restaurant-menu-pricing-strategy-for-online-delivery-in-india" },
      { label: "Discounts that make money", href: "/swiggy-zomato-discounts-which-offers-make-money" },
    ],
  },
  {
    date: "2026-11-04",
    kind: "Industry update",
    title: "Rapido Ownly: zero-commission food delivery, now in Bengaluru and Hyderabad",
    summary:
      "Rapido's Ownly charges restaurants no commission, listing, subscription or marketing fees; customers pay a delivery fee instead. It went citywide in Bengaluru in March 2026, moved inside the main Rapido app in July, and launched in Hyderabad in September, with about 20,000 restaurant partners. Our guide covers what an Ownly order earns compared with Swiggy and Zomato, the risks, and how to price your menu on it.",
    links: [{ label: "Read the Ownly guide", href: "/rapido-ownly-for-restaurants-is-zero-commission-worth-it" }],
  },
  {
    date: "2026-11-03",
    kind: "New tool",
    title: "Free Swiggy & Zomato discount calculator",
    summary:
      "Enter your order value, food cost, commission and the offer you are planning. The calculator shows what each order really earns with and without the offer, and how many more orders it needs before it pays for itself.",
    links: [{ label: "Try the calculator", href: "/tools/discount-calculator" }],
  },
  {
    date: "2026-11-03",
    kind: "New guides",
    title: "Five new guides on margins, listings and channels",
    summary:
      "Discount economics, Zomato listing optimization, reading your payout statement, direct ordering versus the aggregators, and whether ONDC is worth listing on in 2026.",
    links: [
      { label: "Which discounts make money", href: "/swiggy-zomato-discounts-which-offers-make-money" },
      { label: "Zomato listing optimization", href: "/zomato-listing-optimization-the-complete-guide-for-restaurant-owners" },
      { label: "Reading your payout statement", href: "/how-to-read-your-swiggy-and-zomato-payout-statement" },
      { label: "Direct ordering vs aggregators", href: "/direct-ordering-vs-swiggy-and-zomato-when-your-own-channel-pays-off" },
      { label: "ONDC for restaurants", href: "/ondc-for-restaurants-is-it-worth-listing-in-2026" },
    ],
  },
];
