import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/primitives/Container";
import Button from "@/app/components/primitives/Button";
import { SectionTitle, Body, BodySmall } from "@/app/components/primitives/Typography";
import { Divider } from "@/app/components/primitives/Badge";
import { ROUTES } from "@/lib/site-routes";

export const metadata: Metadata = {
  title: "About | Víkingaheimar",
  description:
    "Learn about Víkingaheimar and the mission to preserve and share Norse heritage.",
};

export default function AboutPage() {
  return (
    <section className="w-full py-20 lg:py-28 bg-gradient-to-b from-base-charcoal to-neutral-950">
      <Container size="lg" className="space-y-8">
        <SectionTitle
          overline="About"
          title="Preserving Norse Heritage"
          subtitle="A museum experience built around authenticity, craftsmanship, and story."
        />

        <Divider variant="gradient" spacing="md" />

        <Body>
          Víkingaheimar exists to share Viking maritime legacy through researched storytelling, artifacts, and educational programs.
        </Body>

        <BodySmall className="text-neutral-400">
          TODO: Replace with final approved institutional story, founding timeline, and partnerships.
        </BodySmall>

        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.tickets}>
            <Button
              variant="primary"
              size="lg"
              className="!bg-[#f7f6f2] !text-[#111111] !border !border-[#d4d0c8] hover:!bg-[#ece8df] hover:!shadow-none"
            >
              Book Tickets
            </Button>
          </Link>
          <Link href={ROUTES.groups}>
            <Button variant="secondary" size="lg">Groups & Schools</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
