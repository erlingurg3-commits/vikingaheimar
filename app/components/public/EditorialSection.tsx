"use client";

import React from "react";
import Image from "next/image";
import { SectionTitle, Body } from "../primitives/Typography";
import Container from "../primitives/Container";

interface EditorialSectionProps {
  heading: string;
  content: string;
  imagePosition?: "left" | "right";
  overline?: string;
}

const EditorialSection: React.FC<EditorialSectionProps> = ({
  heading,
  content,
  imagePosition = "left",
  overline,
}) => {
  const isImageRight = imagePosition === "right";

  return (
    <section className="py-20 px-6 border-b border-accent-frost-blue/10">
      <Container size="lg">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center`}
        >
          <div
            className={isImageRight ? "order-2" : "order-1"}
          >
            <SectionTitle
              overline={overline}
              title={heading}
              subtitle={content}
              align="left"
            />
          </div>

          <div className={isImageRight ? "order-1" : "order-2"}>
            {/* Placeholder for image */}
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg h-96 flex items-center justify-center border border-accent-frost-blue/20">
              <Image
                src="/viking.jpg"
                alt={heading}
                width={1200}
                height={768}
                loading="lazy"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default EditorialSection;