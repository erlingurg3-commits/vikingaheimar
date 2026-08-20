import type { Metadata } from "next";
import { LegalShell, LegalSection, LegalTodo } from "@/app/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Víkingaheimar",
  description:
    "How Víkingaheimar collects, uses, and protects personal data.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      lastUpdated="TODO"
      intro={
        <p>
          This policy explains how Víkingaheimar processes personal data of
          visitors to our museum and users of vikingworld.is.
        </p>
      }
    >
      <LegalSection heading="Data Controller">
        <p>
          Víkingaheimar<br />
          Víkingabraut 1, 260 Reykjanesbær, Iceland<br />
          <a href="mailto:info@vikingworld.is" style={{ color: "#b8962e" }}>
            info@vikingworld.is
          </a>
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <LegalTodo>
          List categories of personal data collected (e.g. name, email,
          booking details, IP for security logging, form submissions).
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Third-party processors">
        <p>
          The following processors handle personal data on our behalf:
        </p>
        <ul style={{ marginTop: 10, paddingLeft: 20, listStyle: "disc" }}>
          <li>
            <strong>Bókun</strong> — booking engine and ticketing
          </li>
          <li>
            <strong>Teya</strong> — card payment processing
          </li>
          <li>
            <strong>Vercel</strong> — website hosting and edge delivery
          </li>
          <li>
            <strong>Analytics</strong> — none currently in use on
            vikingworld.is
          </li>
        </ul>
        <LegalTodo>
          Confirm whether any additional processors (e.g. Supabase for
          data storage, Resend for transactional email, Google Calendar
          for booking sync) should be disclosed here, and add each with
          the data category shared, purpose, and jurisdiction.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Lawful basis for processing">
        <LegalTodo>
          Specify the GDPR Article 6 basis per processing activity
          (contract performance for bookings, legitimate interest for
          site security, consent for optional communications, legal
          obligation for financial records, etc.).
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Retention periods">
        <LegalTodo>
          State how long each category of data is retained, and the
          criteria used to determine that period. Reference Icelandic
          bookkeeping law where applicable (financial records).
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Your rights">
        <LegalTodo>
          Enumerate GDPR data-subject rights: access, rectification,
          erasure, restriction, portability, objection, and the right
          to withdraw consent. Include the right to lodge a complaint
          with the Icelandic Data Protection Authority (Persónuvernd).
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="How to make a request">
        <LegalTodo>
          Describe the process for exercising rights above — email
          address, information the requester should provide, identity
          verification, and response timeframe (typically one month
          under GDPR).
        </LegalTodo>
        <p style={{ marginTop: 12 }}>
          Requests can be sent to{" "}
          <a href="mailto:info@vikingworld.is" style={{ color: "#b8962e" }}>
            info@vikingworld.is
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
