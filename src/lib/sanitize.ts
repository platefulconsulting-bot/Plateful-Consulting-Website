import sanitizeHtml from "sanitize-html";

/**
 * Article bodies are stored as HTML and rendered with dangerouslySetInnerHTML,
 * so everything that goes into the database passes through here first. Content
 * is authored by trusted editors, but a compromised Studio account should not
 * escalate into stored XSS across the whole site.
 */

const ALLOWED_TAGS = [
  "h2", "h3", "h4", "h5", "p", "blockquote", "figure", "figcaption",
  "ul", "ol", "li", "strong", "em", "b", "i", "u", "s", "mark", "small", "br", "hr",
  "a", "img", "code", "pre",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "div", "span", "section",
];

export function sanitizeArticle(dirty: string) {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      // Only the presentational hooks our own stylesheet defines.
      div: ["class"],
      span: ["class"],
      section: ["class"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
    },
    allowedClasses: {
      div: ["direct-answer", "table-wrap", "callout", "note"],
      span: ["highlight"],
      section: ["faq"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Relative URLs are how internal links are stored; keep them.
    allowProtocolRelative: false,
    transformTags: {
      // Any external link opens in a new tab and cannot reach window.opener.
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href) && !href.includes("platefulconsulting.com");
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : attribs,
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy", decoding: "async" },
      }),
    },
    // Drop the contents of anything not on the allow-list rather than
    // flattening it into stray text.
    nonTextTags: ["style", "script", "textarea", "option", "noscript", "iframe"],
  });
}

/** Plain-text projection, used for excerpts, search and reading time. */
export function htmlToText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Adds stable ids to headings and wraps bare tables so long articles get a
 * working table of contents and horizontal scroll on mobile, regardless of
 * whether the HTML came from the migration or the Studio editor.
 */
export function enhanceArticle(html: string) {
  const used = new Set<string>();
  const headings: { id: string; text: string; level: number }[] = [];

  let out = html.replace(
    /<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string = "", inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return `<${tag}${attrs}>${inner}</${tag}>`;

      const existing = /\sid=["']([^"']+)["']/i.exec(attrs ?? "");
      let id = existing?.[1] ?? slugifyHeading(text);
      let n = 2;
      const base = id;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);

      headings.push({ id, text, level: tag.toLowerCase() === "h3" ? 3 : 2 });

      const cleanedAttrs = (attrs ?? "").replace(/\sid=["'][^"']*["']/i, "");
      return `<${tag}${cleanedAttrs} id="${id}">${inner}</${tag}>`;
    },
  );

  // Wrap any table that is not already inside a .table-wrap.
  out = out.replace(/(<div class="table-wrap">\s*)?<table/gi, (match) =>
    match.includes("table-wrap") ? match : '<div class="table-wrap"><table',
  );
  out = out.replace(/<\/table>(\s*<\/div>)?/gi, (match) =>
    match.includes("</div>") ? match : "</table></div>",
  );

  return { html: out, headings };
}

function slugifyHeading(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "section"
  );
}
