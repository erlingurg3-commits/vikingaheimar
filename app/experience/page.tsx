import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/primitives/Container";
import Button from "@/app/components/primitives/Button";
import { SectionTitle, Body, BodySmall } from "@/app/components/primitives/Typography";
import { Divider } from "@/app/components/primitives/Badge";
import { ROUTES } from "@/lib/site-routes";

export const metadata: Metadata = {
  title: "Experience | Víkingaheimar",
  description:
    "Explore the premium Viking storytelling experience at Víkingaheimar.",
};

export default function ExperiencePage() {
  return (
    <section className="w-full py-20 lg:py-28 bg-gradient-to-b from-base-charcoal to-neutral-950">
      <Container size="xl" className="space-y-10">
        <SectionTitle
          overline="Experience"
          title="Enter the Saga"
          subtitle="Discover ships, stories, and artifacts through a cinematic Nordic journey."
        />

        <Divider variant="gradient" spacing="md" />

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-neutral-700/50 bg-neutral-900/40 p-7 space-y-4">
            <h2 className="font-display text-3xl text-off-white">What to Expect</h2>
            <Body>
              Walk through immersive exhibits built around real maritime history and Norse storytelling.
            </Body>
            <BodySmall className="text-neutral-400">
              TODO: Replace this placeholder with the final curated narrative and exhibit highlights.
            </BodySmall>
          </article>

          <article className="rounded-2xl border border-neutral-700/50 bg-neutral-900/40 p-7 space-y-4">
            <h2 className="font-display text-3xl text-off-white">Featured Moments</h2>
            <ul className="list-disc pl-5 space-y-2 text-neutral-200">
              <li>Historic ship craftsmanship</li>
              <li>Live saga storytelling</li>
              <li>Authentic artifacts</li>
              <li>Interactive discovery zones</li>
            </ul>
            <BodySmall className="text-neutral-400">
              TODO: Replace with real program highlights and timings.
            </BodySmall>
          </article>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.tickets}>
            <Button variant="primary" size="lg">Book Tickets</Button>
          </Link>
          <Link href={ROUTES.visit}>
            <Button variant="secondary" size="lg">Plan Visit</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
