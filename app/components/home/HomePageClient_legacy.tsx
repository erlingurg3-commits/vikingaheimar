"use client";

// ============================================================
// LEGACY HOMEPAGE — archived 2026-02-22
// The active homepage is HomePageClient.tsx.
// Do NOT delete this file. Restore by swapping imports in
// app/page.tsx if needed.
// ============================================================

import { Clock3, MapPin, Ship, ShieldCheck, Sparkles, Users } from "lucide-react";
import CinematicHero from "@/app/components/hero/CinematicHero";
import Reveal from "@/app/components/primitives/Reveal";
import {
  Accordion,
  Badge,
  Card,
  CTASection,
  Divider,
  ImageFrame,
  Section,
  SectionTitle,
  StatRow,
} from "@/app/components/ui";
import { ROUTES } from "@/lib/site-routes";

const visitAccordionItems = [
  {
    id: "arrival",
    title: "How long should we plan for a visit?",
    content:
      "Most guests spend 60–90 minutes. If you want a slower pace across all exhibits, reserve up to 2 hours.",
  },
  {
    id: "family",
    title: "Is this suitable for families?",
    content:
      "Yes. The exhibition flow works for mixed ages with interactive storytelling moments and open exploration zones.",
  },
  {
    id: "groups",
    title: "Can we plan a school or group session?",
    content:
      "Absolutely. Group visits include tailored timing and support. Use Groups & Schools to request a custom plan.",
  },
];

export default function HomePageClientLegacy() {
  return (
    <main className="w-full overflow-hidden">
      <CinematicHero
        backgroundImage="/viking.jpg"
        headline="VÍKINGAHEIMAR"
        subheadline="Step into authentic Norse heritage. Explore Viking ships, artifacts, and the culture that shaped history."
        primaryCtaText="Book Tickets"
        secondaryCtaText="Plan Your Visit"
        showScrollCue={true}
        showTrustRow={true}
      />

      <Reveal delayMs={60}>
        <Section tone="default" containerSize="xl" className="py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <SectionTitle
                eyebrow="Enter The Saga"
                title="A premium heritage experience grounded in real Norse history"
                description="Explore the Íslendingur ship, immersive storytelling spaces, and curated artifacts in a cinematic Nordic setting."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                {[
                  "Historic Viking ship",
                  "Guided saga narratives",
                  "Authentic artifacts",
                  "Interactive discovery",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-neutral-200">
                    <span className="text-accent-frost-blue select-none" aria-hidden="true">—</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <ImageFrame
              src="/viking.jpg"
              alt="Viking exhibition at Víkingaheimar"
              caption="Íslendingur Experience"
            />
          </div>
        </Section>
      </Reveal>

      <Reveal delayMs={90}>
        <Section tone="muted" containerSize="xl" textured className="py-14 lg:py-20">
          <SectionTitle
            eyebrow="Trust Signals"
            title="Plan with confidence"
            description="Clear expectations, family-friendly pacing, and a location built for easy access from Keflavík and Reykjanesbær."
            align="center"
          />
          <Divider variant="gradient" spacing="md" />
          <StatRow
            plain
            items={[
              {
                label: "Location",
                value: "Reykjanesbær, Iceland",
                icon: <MapPin size={16} />,
              },
              {
                label: "Average Visit",
                value: "60–90 minutes",
                icon: <Clock3 size={16} />,
              },
              {
                label: "Audience",
                value: "Family friendly",
                icon: <Users size={16} />,
              },
            ]}
          />
        </Section>
      </Reveal>

      <Reveal delayMs={150}>
        <Section tone="default" containerSize="xl" className="py-14 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
            <div className="space-y-5">
              <SectionTitle
                eyebrow="Quick Answers"
                title="Before you arrive"
                description="Everything visitors ask most before booking, kept simple and transparent."
              />
              <Accordion items={visitAccordionItems} />
            </div>

            <Card variant="elevated" className="p-6 space-y-4">
              <Badge variant="premium">Most Booked</Badge>
              <h3 className="font-display text-3xl text-off-white">Family Package</h3>
              <p className="text-neutral-300 text-sm">
                Includes full exhibition access for two adults and two youth.
                Placeholder pricing for now.
              </p>
              <ul className="space-y-2 text-sm text-neutral-200">
                <li className="flex items-center gap-2"><Ship size={14} className="text-accent-frost-blue" /> Ship gallery access</li>
                <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-accent-frost-blue" /> Secure checkout</li>
                <li className="flex items-center gap-2"><Sparkles size={14} className="text-accent-frost-blue" /> Instant confirmation</li>
              </ul>
            </Card>
          </div>
        </Section>
      </Reveal>

      <CTASection
        title="Ready to begin your journey?"
        description="Book in minutes and step into a premium Nordic experience built for families, travelers, and cultural explorers."
        primaryLabel="Book Tickets"
        primaryHref={ROUTES.tickets}
        secondaryLabel="Plan Visit"
        secondaryHref={ROUTES.visit}
      />
    </main>
  );
}
