/**
 * "What's new" log.
 *
 * Newest first. Add an entry whenever something visitors can use goes live: a
 * tool, a batch of guides, a new service. Each entry links to the thing itself,
 * so the page also works as a crawlable hub for new content.
 */

export type WhatsNewEntry = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** Short label shown as a chip. */
  kind: "New tool" | "New guides" | "New feature" | "Update";
  title: string;
  summary: string;
  links: { label: string; href: string }[];
};

export const whatsNew: WhatsNewEntry[] = [
  {
    date: "2026-11-04",
    kind: "New guides",
    title: "Rapido Ownly for restaurants: is zero commission worth it?",
    summary:
      "How Rapido's zero-commission food delivery app works, what an Ownly order earns compared with Swiggy and Zomato, the risks to weigh, and how to list and price your menu on it.",
    links: [{ label: "Read the guide", href: "/rapido-ownly-for-restaurants-is-zero-commission-worth-it" }],
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
