import { site, contact, services, founders, faqs, authorHref } from "./site";
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
    logo: { "@type": "ImageObject", url: absoluteUrl("/brand/PFC-LOGO.webp"), width: 512, height: 512 },
    image: absoluteUrl("/og"),
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
    sameAs: [...contact.socials.map((s) => s.href), contact.googleBusinessProfile],
    founder: founders.map((f) => ({
      "@type": "Person",
      ...(authorHref(f.slug).startsWith("/author/")
        ? { "@id": absoluteUrl(`${authorHref(f.slug)}#person`), url: absoluteUrl(authorHref(f.slug)) }
        : {}),
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
  author: { slug?: string; name: string; role: string } | null;
  category: { name: string } | null;
  image?: string;
}) {
  return {
    "@type": "Article",
    "@id": absoluteUrl(`/${post.slug}#article`),
    headline: post.title,
    description: post.excerpt,
    ...(post.image ? { image: [post.image] } : {}),
    url: absoluteUrl(`/${post.slug}`),
    datePublished: isoDate(post.publishedAt),
    dateModified: isoDate(post.updatedAt),
    inLanguage: "en-IN",
    articleSection: post.category?.name,
    isPartOf: { "@id": SITE_ID },
    publisher: { "@id": ORG_ID },
    author: post.author
      ? {
          "@type": "Person",
          // Authors with a profile page share the Person @id emitted there,
          // so every byline resolves to the same entity.
          ...(authorHref(post.author.slug).startsWith("/author/")
            ? { "@id": absoluteUrl(`${authorHref(post.author.slug)}#person`) }
            : {}),
          name: post.author.name,
          jobTitle: post.author.role,
          url: absoluteUrl(authorHref(post.author.slug)),
          worksFor: { "@id": ORG_ID },
        }
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

/** A free browser tool, e.g. the discount calculator. */
export function webApplicationSchema(tool: { name: string; description: string; path: string }) {
  return {
    "@type": "WebApplication",
    "@id": absoluteUrl(`${tool.path}#app`),
    name: tool.name,
    description: tool.description,
    url: absoluteUrl(tool.path),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@id": ORG_ID },
  };
}

/** A named author with a profile page, linked to the organisation entity. */
export function personSchema(person: {
  slug: string;
  name: string;
  jobTitle: string;
  description: string;
  knowsAbout: readonly string[];
  sameAs?: readonly string[];
}) {
  const url = absoluteUrl(`/author/${person.slug}`);
  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: person.name,
    jobTitle: person.jobTitle,
    description: person.description,
    url,
    worksFor: { "@id": ORG_ID },
    knowsAbout: [...person.knowsAbout],
    ...(person.sameAs?.length ? { sameAs: [...person.sameAs] } : {}),
    mainEntityOfPage: { "@type": "ProfilePage", "@id": url },
  };
}

/** The profile page that carries a Person as its main entity. */
export function profilePageSchema(person: { slug: string; name: string }) {
  const url = absoluteUrl(`/author/${person.slug}`);
  return {
    "@type": "ProfilePage",
    "@id": url,
    url,
    name: `${person.name} — ${site.name}`,
    isPartOf: { "@id": SITE_ID },
    mainEntity: { "@id": `${url}#person` },
    inLanguage: "en-IN",
  };
}

/** A curated topic hub: a CollectionPage whose main entity is an ItemList of articles. */
export function collectionPageSchema(page: {
  path: string;
  name: string;
  description: string;
  /** ISO date of the newest change to the collection, when known. */
  dateModified?: string;
  items: readonly { slug: string; title: string }[];
}) {
  const url = absoluteUrl(page.path);
  return {
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: page.name,
    description: page.description,
    ...(page.dateModified ? { dateModified: page.dateModified } : {}),
    isPartOf: { "@id": SITE_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en-IN",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: page.items.length,
      itemListElement: page.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/${item.slug}`),
        name: item.title,
      })),
    },
  };
}
