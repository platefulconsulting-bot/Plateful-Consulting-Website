import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { contact } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * The closing conversion block, repeated at the foot of every page.
 *
 * Deliberately identical everywhere: a visitor who has read three articles and
 * two service descriptions should meet the same, familiar next step rather than
 * hunting for one.
 */
export function CTABand({
  eyebrow = "Next step",
  title = "Find out what your listing is actually costing you.",
  body = "A growth audit reads your live Swiggy and Zomato dashboards and tells you where the orders are leaking — ranking signals, menu conversion, ad waste and net realisation. The findings are yours to keep either way.",
  primaryLabel = "Book a growth audit",
  className,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryLabel?: string;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden", className)} aria-labelledby="cta-title">
      <div className="grid-lines absolute inset-0 opacity-40" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(234,85,43,0.16),transparent_60%)]"
        aria-hidden
      />

      <div className="container-x relative section">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2
            id="cta-title"
            className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
          >
            {title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream-300">{body}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/contact-us" className="btn btn-primary btn-lg">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href={contact.primaryPhone.href} className="btn btn-outline btn-lg">
              <Phone className="h-4 w-4" aria-hidden />
              {contact.primaryPhone.label}
            </a>
          </div>

          <p className="mt-6 text-sm text-cream-500">
            The audit comes with no retainer attached, and you get a straight verdict either way.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
