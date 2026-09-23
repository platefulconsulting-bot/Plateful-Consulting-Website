import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/LegalShell";
import { contact, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms governing use of the ${site.name} website and services.`,
  alternates: { canonical: "/terms-and-condition" },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms & Conditions"
      updated="18 December 2025"
      intro={`These terms govern your use of the ${site.name} website. By accessing this site, you accept them in full.`}
    >
      <p>
        By accessing this website you agree to be bound by these Terms &amp; Conditions. Do not
        continue to use {site.name} if you do not accept all of the terms stated on this page.
      </p>

      <h2>Definitions</h2>
      <p>
        &ldquo;Client&rdquo;, &ldquo;You&rdquo; and &ldquo;Your&rdquo; refer to you, the person
        accessing this website. &ldquo;The Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Our&rdquo;
        and &ldquo;Us&rdquo; refer to {site.legalName}.
      </p>

      <h2>Cookies</h2>
      <p>
        We employ the use of cookies. By accessing this website you agree to the use of cookies
        in accordance with our <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Unless otherwise stated, {site.legalName} and/or its licensors own the intellectual
        property rights for all material on this website. All such rights are reserved. You may
        access this material for your own personal use, subject to the restrictions below.
      </p>
      <p>You must not:</p>
      <ul>
        <li>Republish material from this website</li>
        <li>Sell, rent or sub-licence material from this website</li>
        <li>Reproduce, duplicate or copy material from this website</li>
        <li>Redistribute content from this website</li>
      </ul>
      <p>
        Our published articles may be quoted and cited with clear attribution and a link to the
        original page.
      </p>

      <h2>Services and engagements</h2>
      <p>
        Content on this website is provided for general information and does not constitute a
        contract, a quotation, or a guarantee of any particular commercial result. Consulting
        engagements are governed by a separate written agreement setting out scope, fees,
        duration and deliverables agreed between the parties.
      </p>
      <p>
        Outcomes described in case studies and testimonials were reported by the businesses
        concerned and reflect their specific circumstances. Results vary by city, cuisine, price
        point, operational capability and starting position, and are not promised or guaranteed.
      </p>

      <h2>Platform independence</h2>
      <p>
        {site.legalName} is an independent consultancy. We are not affiliated with, endorsed by,
        or acting as an agent of Swiggy, Zomato, Meta or any other platform named on this site.
        All trademarks are the property of their respective owners.
      </p>

      <h2>Hyperlinking to our content</h2>
      <p>
        Government agencies, search engines, news organisations and online directory distributors
        may link to our website without prior written approval, provided the link is not
        deceptive, does not falsely imply sponsorship or endorsement, and fits within the context
        of the linking party&rsquo;s site. Other organisations may request permission by
        contacting us.
      </p>

      <h2>iFrames</h2>
      <p>
        Without prior approval and written permission, you may not create frames around our web
        pages that alter in any way the visual presentation or appearance of our website.
      </p>

      <h2>Content liability</h2>
      <p>
        We are not responsible for any content that appears on third-party websites that link to
        us. You agree to protect and defend us against all claims arising out of content on your
        website.
      </p>

      <h2>Disclaimer and limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, we exclude all representations,
        warranties and conditions relating to this website and its use. Nothing in this
        disclaimer will limit or exclude our liability for death or personal injury caused by
        negligence, for fraud or fraudulent misrepresentation, or any liability that may not be
        limited or excluded under applicable law.
      </p>
      <p>
        As long as this website and its information and services are provided free of charge, we
        will not be liable for any loss or damage of any nature arising from their use.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by and construed in accordance with the laws of India. Any
        dispute arising out of or in connection with them is subject to the exclusive
        jurisdiction of the courts at New Delhi.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a href={contact.primaryEmail.href}>{contact.primaryEmail.label}</a> or{" "}
        <a href={contact.phones[0].href}>{contact.phones[0].label}</a>.
      </p>
    </LegalShell>
  );
}
