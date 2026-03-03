"use client";

import React from "react";
import Link from "next/link";
import Section from "@/app/components/ui/Section";
import SectionTitle from "@/app/components/ui/SectionTitle";
import Button from "@/app/components/ui/Button";
import { Divider } from "@/app/components/ui/Divider";

interface CTASectionProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <Section tone="contrast" className="text-center" containerSize="lg">
      <SectionTitle title={title} description={description} align="center" />
      <Divider variant="gradient" spacing="md" />
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={primaryHref}>
          <Button variant="primary" size="lg">{primaryLabel}</Button>
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link href={secondaryHref}>
            <Button variant="secondary" size="lg">{secondaryLabel}</Button>
          </Link>
        )}
      </div>
    </Section>
  );
}
