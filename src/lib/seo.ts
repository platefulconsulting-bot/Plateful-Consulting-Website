import { site, contact, services, founders, faqs } from "./site";
import { absoluteUrl, isoDate } from "./utils";

/**
 * Structured data builders.
 *
 * These articles rank on informational queries, so the markup matters: Article
 * + FAQPage + BreadcrumbList for posts, LocalBusiness for the brand. Everything
 * is emitted from one place so the entity ids stay consistent and Google can
 * link the graph together.
 */

const ORG_ID = absoluteUrl("/#organization");
const SITE_ID = absoluteUrl("/#website");

export function organizationSchema() {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    description: site.description,
    slogan: site.tagline,
    foundingDate: String(site.founded),
    priceRange: "₹₹",
    areaServed: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${contact.address.line1}, ${contact.address.line2}`,
      addressLocality: contact.address.city,
      addressRegion: contact.address.state,
      postalCode: contact.address.postalCode,
      addressCountry: contact.address.country,
    },
    telephone: contact.phones.map((p) => p.label.replace(/\s/g, "")),
    email: contact.primaryEmail.label,
    sameAs: contact.socials.map((s) => s.href),
    founder: founders.map((f) => ({
      "@type": "Person",
      name: f.name,
      jobTitle: f.role,
      description: f.bio,
    })),
    knowsAbout: [
      "Swiggy restaurant growth",
      "Zomato restaurant growth",
      "Food aggregator advertising",
      "Restaurant menu engineering",
      "Cloud kitchen consulting",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Restaurant growth services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.summary,
          url: absoluteUrl(`/services#${s.slug}`),
        },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/blogs?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function articleSchema(post: {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date | null;
  updatedAt: Date;
  readingMinutes: number;
  author: { name: string; role: string } | null;
  category: { name: string } | null;
}) {
  return {
    "@type": "Article",
    "@id": absoluteUrl(`/${post.slug}#article`),
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/${post.slug}`),
    datePublished: isoDate(post.publishedAt),
    dateModified: isoDate(post.updatedAt),
    inLanguage: "en-IN",
    articleSection: post.category?.name,
    isPartOf: { "@id": SITE_ID },
    publisher: { "@id": ORG_ID },
    author: post.author
      ? { "@type": "Person", name: post.author.name, jobTitle: post.author.role }
      : { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/${post.slug}`) },
  };
}

export function faqSchema(items: readonly { q: string; a: string }[] = faqs) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function serviceSchema(service: (typeof services)[number]) {
  return {
    "@type": "Service",
    name: service.name,
    description: service.description,
    serviceType: service.name,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "India" },
    url: absoluteUrl(`/services#${service.slug}`),
  };
}

/** Wraps any number of schema objects into a single @graph document. */
export function jsonLd(...nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
