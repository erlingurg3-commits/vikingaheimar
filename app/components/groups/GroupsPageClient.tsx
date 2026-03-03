"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/app/components/primitives/Container";
import Button from "@/app/components/primitives/Button";
import Input from "@/app/components/primitives/Input";
import {
  SectionTitle,
  Body,
  BodySmall,
} from "@/app/components/primitives/Typography";
import { Divider } from "@/app/components/primitives/Badge";
import { trackGroupsInquiryClick } from "@/lib/analytics";

export default function GroupsPageClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !groupSize.trim()) {
      setError("Please complete name, email, and group size before submitting.");
      return;
    }

    setError("");
    trackGroupsInquiryClick({
      source: "groups_page_form_submit",
      hasName: Boolean(name.trim()),
      hasEmail: Boolean(email.trim()),
      groupSize,
    });
  };

  return (
    <main className="w-full py-24 lg:py-32 bg-gradient-to-b from-base-charcoal to-neutral-950">
      <Container size="lg" className="space-y-8">
        <SectionTitle
          overline="Groups & Schools"
          title="Tailored Nordic Experiences for Groups"
          subtitle="Designed for schools, travel groups, and cultural programs with flexible planning support."
        />

        <Divider variant="gradient" spacing="sm" />

        <Body className="text-neutral-300">
          We support group capacities, educational storytelling formats, and
          custom arrival windows. Share your goals and we will tailor a visit
          plan.
        </Body>

        <form className="space-y-4 max-w-2xl" onSubmit={handleSubmit} noValidate>
          <Input
            label="Contact Name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={error && !name.trim() ? "Name is required" : undefined}
            helperText="Who should we contact about this group booking?"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={error && !email.trim() ? "Email is required" : undefined}
            helperText="We will reply with availability and pricing options."
          />

          <Input
            label="Estimated Group Size"
            type="text"
            value={groupSize}
            onChange={(event) => setGroupSize(event.target.value)}
            error={error && !groupSize.trim() ? "Group size is required" : undefined}
            helperText="Example: 24 students + 3 staff"
          />

          <div>
            <label
              htmlFor="group-notes"
              className="block text-sm font-medium text-off-white mb-2"
            >
              Notes (optional)
            </label>
            <textarea
              id="group-notes"
              className="w-full min-h-28 px-4 py-3 rounded-lg bg-neutral-900/50 border-2 border-neutral-700 text-off-white placeholder-neutral-500 focus-visible:outline-none focus-visible:border-accent-frost-blue focus-visible:ring-1 focus-visible:ring-accent-frost-blue/30"
              placeholder="Tell us preferred date, age range, or learning goals."
            />
          </div>

          {error && <p className="text-sm text-status-error" role="alert">{error}</p>}

          <Button variant="primary" size="lg" type="submit">
            Submit Groups Inquiry
          </Button>
        </form>

        <BodySmall className="text-neutral-400">
          TODO: Connect form submission to CRM/contact API endpoint.
        </BodySmall>

        <div>
          <Link
            href="/groups/request"
            className="inline-flex items-center rounded-lg border border-accent-frost-blue/40 bg-accent-frost-blue/10 px-4 py-2 text-sm font-medium text-accent-ice-white hover:bg-accent-frost-blue/20"
          >
            Open Instant Group Request Agent
          </Link>
        </div>
      </Container>
    </main>
  );
}
