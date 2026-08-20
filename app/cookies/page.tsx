import type { Metadata } from "next";
import { LegalShell, LegalSection, LegalTodo } from "@/app/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Cookie Policy | Víkingaheimar",
  description:
    "Cookies used on vikingworld.is, their purpose, duration, and how to opt out.",
  alternates: { canonical: "/cookies" },
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalShell
      title="Cookie Policy"
      lastUpdated="TODO"
      intro={
        <p>
          This page describes the cookies and similar technologies used
          on vikingworld.is.
        </p>
      }
    >
      <LegalSection heading="First-party cookies">
        <p>
          vikingworld.is does not currently set any first-party cookies
          from its own application code. No analytics, tracking, or
          preference cookies are written by the site itself.
        </p>
        <LegalTodo>
          Re-verify at publication time. If a cookie-based feature is
          introduced (e.g. session auth, consent banner state), list it
          here with name, purpose, and duration.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Third-party cookies">
        <p>
          The booking calendar on <a href="/booking" style={{ color: "#b8962e" }}>/booking</a>{" "}
          is provided by <strong>Bókun</strong> and loaded from
          widgets.bokun.io. The Bókun widget may set its own cookies to
          operate the checkout flow.
        </p>
        <LegalTodo>
          Audit the live site with the browser Application panel (or
          equivalent) to enumerate the exact cookies set by Bókun —
          name, purpose, duration, and whether persistent or session.
          Add any additional third-party cookies observed and remove
          this TODO once verified.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="How to opt out">
        <LegalTodo>
          Explain browser-level cookie controls (blocking third-party
          cookies, clearing site data), and reference the Bókun cookie
          policy for widget-specific controls. If a consent banner is
          added, describe its use here.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about cookies on this site:{" "}
          <a href="mailto:info@vikingworld.is" style={{ color: "#b8962e" }}>
            info@vikingworld.is
          </a>
        </p>
      </LegalSection>
    </LegalShell>
  );
}
