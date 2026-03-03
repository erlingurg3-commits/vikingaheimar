"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface EditorialSectionProps {
  heading: string;
  content: string;
  imagePosition?: "left" | "right";
}

const EditorialSection: React.FC<EditorialSectionProps> = ({
  heading,
  content,
  imagePosition = "left",
}) => {
  const isImageRight = imagePosition === "right";

  return (
    <section
      className={`flex ${
        isImageRight ? "flex-row-reverse" : "flex-row"
      } items-center gap-8`}
    >
      <div className="flex-1">
        <h2 className="text-3xl font-bold">{heading}</h2>
        <p className="mt-4 text-lg">{content}</p>
      </div>

      <div className="flex-1">
        {/* Placeholder for image */}
        <Image
          src="/viking.jpg"
          alt={heading}
          width={1200}
          height={768}
          loading="lazy"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
};

export default EditorialSection;