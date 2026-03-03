"use client";

import React from "react";
import Image from "next/image";
import { SectionTitle, Body } from "../primitives/Typography";
import Container from "../primitives/Container";
import { Divider } from "../primitives/Badge";

const ShipFeature: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-neutral-900 to-neutral-950 border-y border-accent-frost-blue/10">
      <Container size="lg">
        <SectionTitle
          overline="Maritime Innovation"
          title="The Viking Ship"
          subtitle="Discover the craftsmanship and history behind the Íslendingur"
          align="center"
        />

        <Divider variant="gradient" spacing="lg" className="my-8" />

        <Body className="text-neutral-300 text-center mb-8 max-w-3xl mx-auto">
          Built using traditional Norse shipbuilding techniques, this vessel is
          a testament to the maritime ingenuity of the Norse people. The
          Íslendingur is a full-scale replica of a 9th-century Viking ship,
          meticulously reconstructed to showcase the skill and innovation of
          ancient seafarers.
        </Body>

        <div className="mt-12">
          <Image
            src="/viking.jpg"
            alt="Viking Ship - Íslendingur"
            width={1600}
            height={900}
            loading="lazy"
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </div>
      </Container>
    </section>
  );
};

export default ShipFeature;
