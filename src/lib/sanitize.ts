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

/**
 * Pulls question/answer pairs out of an article's "Frequently Asked Questions"
 * section for FAQPage structured data. The section runs until the next h2, and
 * articles write each pair one of two ways: `<h3>Question?</h3>` followed by
 * the answer, or `<p><strong>Question?</strong><br>Answer</p>`. Anything not
 * in either shape is skipped rather than guessed at.
 */
export function extractFaqs(html: string) {
  const section = /<h2[^>]*>\s*(?:frequently asked questions|faqs?)\s*<\/h2>([\s\S]*?)(?=<h2|$)/i.exec(html);
  if (!section) return [];
  const body = section[1];

  const collect = (pattern: RegExp) =>
    [...body.matchAll(pattern)]
      .map((m) => ({ q: htmlToText(m[1]), a: htmlToText(m[2]) }))
      .filter((f) => f.q.endsWith("?") && f.a);

  // A section can contain a stray h3 (a closing CTA, say), so take whichever
  // shape the article actually uses for most of its questions.
  const headed = collect(/<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/gi);
  const inline = collect(/<p>\s*<strong>([\s\S]*?)<\/strong>\s*<br\s*\/?>([\s\S]*?)<\/p>/gi);
  return headed.length >= inline.length ? headed : inline;
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
