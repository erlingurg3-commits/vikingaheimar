import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/primitives/Container";
import Button from "@/app/components/primitives/Button";
import { SectionTitle, Body, BodySmall } from "@/app/components/primitives/Typography";
import { Divider } from "@/app/components/primitives/Badge";
import { ROUTES } from "@/lib/site-routes";

export const metadata: Metadata = {
  title: "Plan Visit",
  description:
    "Plan your visit to Víkingaheimar with quick answers on timing, location, and accessibility.",
  alternates: {
    canonical: "/visit",
  },
  openGraph: {
    title: "Plan Visit | Víkingaheimar",
    description:
      "Plan your visit to Víkingaheimar with quick answers on timing, location, and accessibility.",
    url: "/visit",
    images: [{ url: "/viking.jpg", width: 1200, height: 630, alt: "Plan your visit to Víkingaheimar" }],
  },
};

export default function VisitPage() {
  return (
    <section className="w-full py-20 lg:py-28 bg-base-charcoal">
      <Container size="xl" className="space-y-10">
        <SectionTitle
          overline="Plan Visit"
          title="Everything You Need Before Arrival"
          subtitle="Quick practical details to make your visit smooth and premium."
        />

        <Divider variant="subtle" spacing="md" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Opening Hours", "Daily 10:00–18:00"],
            ["Location", "Reykjanesbær, Iceland"],
            ["Duration", "Average visit 60–90 min"],
            ["Accessibility", "Step-free and family-friendly"],
          ].map(([title, value]) => (
            <article
              key={title}
              className="rounded-xl border border-neutral-700/50 bg-neutral-900/40 p-5 space-y-2"
            >
              <h2 className="text-sm uppercase tracking-widest text-neutral-400">{title}</h2>
              <p className="text-lg text-off-white">{value}</p>
            </article>
          ))}
        </div>

        <BodySmall className="text-neutral-400">
          TODO: Replace opening times and accessibility notes with verified operational data.
        </BodySmall>

        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.tickets}>
            <Button variant="primary" size="lg">Book Tickets</Button>
          </Link>
          <Link href={ROUTES.groups}>
            <Button variant="ghost" size="lg">Groups</Button>
          </Link>
        </div>

        <Body className="text-neutral-300">
          Need help planning around your itinerary? Our team can recommend the best times to visit.
        </Body>
      </Container>
    </section>
  );
}
