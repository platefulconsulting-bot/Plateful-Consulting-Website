import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/LegalShell";
import { contact, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects the personal information of visitors and clients.`,
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="18 December 2025"
      intro={`One of our main priorities is the privacy of our visitors. This policy explains what ${site.name} collects, why, and what you can ask us to do with it.`}
    >
      <p>
        This Privacy Policy applies only to our online activities and is valid for visitors to
        our website with regard to the information that they share with, or that is collected
        by, {site.name}. It does not apply to information collected offline or through channels
        other than this website.
      </p>

      <h2>Information we collect</h2>
      <p>
        We are told plainly, at the point of collection, why we are asking for your information
        and how it will be used.
      </p>
      <ul>
        <li>
          <strong>Information you give us.</strong> When you submit an enquiry, request a growth
          audit or subscribe to our updates, we collect your name, email address, phone number,
          restaurant or brand name, city and the contents of your message.
        </li>
        <li>
          <strong>Information collected automatically.</strong> Like most websites, our servers
          record standard log data: IP address, browser type and version, the pages you visit,
          the date and time of your visit, and referring pages.
        </li>
        <li>
          <strong>Client engagement data.</strong> Where you engage us for services, we may be
          granted access to your Swiggy, Zomato or advertising dashboards. That access is used
          solely to deliver the agreed services and is never sold or shared.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To operate, maintain and improve our website and services</li>
        <li>To respond to your enquiries and provide the services you have requested</li>
        <li>To communicate with you, including about your engagement and, where you have opted in, our periodic growth notes</li>
        <li>To develop new services and improve existing ones</li>
        <li>To detect and prevent fraud and misuse</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use cookies to remember your preferences and to understand which pages are useful. You
        can instruct your browser to refuse cookies or to alert you when one is being set. Some
        parts of the site may not function as intended if you disable them.
      </p>

      <h2>Third parties</h2>
      <p>
        Third-party services used on this site — such as embedded maps and analytics — may set
        their own cookies and collect data under their own privacy policies. We do not control
        those policies and are not responsible for them. We do not sell your personal
        information to third parties.
      </p>

      <h2>Data retention</h2>
      <p>
        Enquiry records are retained for as long as needed to respond to you and to maintain a
        record of our business relationship. Newsletter subscriptions are retained until you
        unsubscribe, which you can do from any email we send.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to request access to the personal data we hold about you, to have it
        corrected or erased, to object to or restrict its processing, and to receive a copy in a
        portable format. To exercise any of these rights, contact us using the details below. We
        will respond within one month.
      </p>

      <h2>Children&rsquo;s information</h2>
      <p>
        Our services are directed at businesses. We do not knowingly collect personal information
        from children. If you believe a child has provided us with personal information, contact
        us and we will remove it promptly.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Any changes will be posted on this page with
        a revised &ldquo;last updated&rdquo; date.
      </p>

      <h2>Contact us</h2>
      <p>
        For any question about this policy, or to exercise your rights, reach us at{" "}
        <a href={contact.primaryEmail.href}>{contact.primaryEmail.label}</a> or{" "}
        <a href={contact.phones[0].href}>{contact.phones[0].label}</a>.
      </p>
      <p>
        {contact.address.line1}, {contact.address.line2}, {contact.address.city} –{" "}
        {contact.address.postalCode}, {contact.address.countryName}.
      </p>
      <p>
        See also our <Link href="/terms-and-condition">Terms &amp; Conditions</Link>.
      </p>
    </LegalShell>
  );
}
