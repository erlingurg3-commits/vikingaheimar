import type { Metadata } from "next";
import { LegalShell, LegalSection, LegalTodo } from "@/app/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service | Víkingaheimar",
  description:
    "Terms and conditions for tickets, admission, and use of Víkingaheimar.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      lastUpdated="TODO"
      intro={
        <p>
          These terms govern the purchase of tickets, admission to the
          museum, and the use of vikingworld.is. By booking or visiting,
          you agree to be bound by them.
        </p>
      }
    >
      <LegalSection heading="Ticket terms">
        <LegalTodo>
          Cover ticket validity, timed entry rules if any, age
          categories, group tickets, and non-transferability. Reference
          Bókun as the booking processor.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Cancellation and refund policy">
        <LegalTodo>
          State the cancellation window, any non-refundable fees, how
          refunds are issued (original payment method, timing), and how
          to request a cancellation. Align with the policy set in Bókun.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Conditions of admission">
        <LegalTodo>
          Cover opening hours reference, right of admission, behaviour
          expected on-site, treatment of exhibits, supervision of
          children, and items not permitted inside the museum.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Photography policy">
        <LegalTodo>
          Specify what personal photography is permitted, any
          restrictions (flash, tripods, video), commercial photography
          rules, and consent for photos taken by Víkingaheimar staff on
          the premises.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Liability">
        <LegalTodo>
          Set out the limitation of liability for personal belongings,
          on-site injury, and any exclusions to the fullest extent
          permitted under Icelandic law. Do not exclude liability for
          death, personal injury caused by negligence, or fraud.
        </LegalTodo>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms:{" "}
          <a href="mailto:info@vikingworld.is" style={{ color: "#b8962e" }}>
            info@vikingworld.is
          </a>
        </p>
      </LegalSection>
    </LegalShell>
  );
}
