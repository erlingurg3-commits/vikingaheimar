"use client";

import { SectionTitle, Body } from "../primitives/Typography";
import Container from "../primitives/Container";
import { Divider } from "../primitives/Badge";

export default function VisitInfo() {
  return (
    <section className="w-full py-16 px-6 bg-neutral-900 border-y border-accent-frost-blue/10">
      <Container size="lg" className="text-center space-y-6">
        <SectionTitle
          title="Plan Your Visit"
          subtitle="Opening hours, admission prices, and visitor information"
          align="center"
        />

        <Divider variant="gradient" spacing="md" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="space-y-3">
            <h3 className="font-display text-xl font-normal text-accent-frost-blue">
              Hours
            </h3>
            <Body className="text-neutral-300">Daily 10 AM - 6 PM</Body>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-xl font-normal text-accent-frost-blue">
              Location
            </h3>
            <Body className="text-neutral-300">
              Strandvegi 10, Njarðvík, Iceland
            </Body>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-xl font-normal text-accent-frost-blue">
              Contact
            </h3>
            <Body className="text-neutral-300">+354 426 6699</Body>
          </div>
        </div>
      </Container>
    </section>
  );
}
