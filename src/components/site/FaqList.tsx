import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * Visible FAQ accordion. Pair it with `faqSchema(items)` on the same page:
 * Google only honours FAQPage markup whose questions and answers are on the
 * page, and native <details> keeps every answer in the HTML even when closed.
 */
export function FaqList({
  items,
  name,
  className,
}: {
  items: readonly { q: string; a: string }[];
  /** Groups the <details> so opening one closes the others. */
  name: string;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-cream-100/8", className)}>
      {items.map((faq, i) => (
        <Reveal key={faq.q} delay={i * 0.05}>
          <details className="group py-5" name={name}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg font-semibold text-cream-50 transition-colors hover:text-gold-300 [&::-webkit-details-marker]:hidden">
              <h3 className="text-[length:inherit] [color:inherit] [font-family:inherit] [letter-spacing:inherit]">{faq.q}</h3>
              <span
                aria-hidden
                className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-cream-100/20 text-gold-400 transition-transform duration-300 group-open:rotate-45"
              >
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 1v10M1 6h10" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 max-w-2xl leading-relaxed text-cream-400">{faq.a}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
