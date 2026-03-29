"use client";

import Link from "next/link";
import Image from "next/image";
import { H1, Body, Overline } from "@/app/components/primitives/Typography";
import Button from "@/app/components/primitives/Button";
import Container from "@/app/components/primitives/Container";
import { Texture } from "@/app/components/primitives/Texture";
import { RunePattern, ScrollIndicator } from "./HeroVisuals";
import { MapPin, Clock, Users } from "lucide-react";
import { ROUTES } from "@/lib/site-routes";
import { getBookTicketsLink } from "@/lib/ticketing";
import { trackBookTicketsClick } from "@/lib/analytics";

interface CinematicHeroProps {
  /**
   * Background image URL or gradient fallback
   */
  backgroundImage?: string;

  /**
   * Main headline
   */
  headline?: React.ReactNode;

  /**
   * Supporting subheadline
   */
  subheadline?: React.ReactNode;

  /**
   * Primary CTA text
   */
  primaryCtaText?: string;

  /**
   * Secondary CTA text
   */
  secondaryCtaText?: string;

  /**
   * Show scroll indicator
   */
  showScrollCue?: boolean;

  /**
   * Show trust row
   */
  showTrustRow?: boolean;
}

/**
 * CinematicHero Component
 *
 * Premium Nordic hero with:
 * - Layered backgrounds (image + fog + rune pattern)
 * - Responsive layout (center-left desktop, centered mobile)
 * - Motion-optimized animations
 * - Trust signals
 * - Conversion-focused CTAs
 */
export default function CinematicHero({
  backgroundImage = "/viking.jpg",
  headline = "VÍKINGAHEIMAR",
  subheadline = "Step into authentic Norse heritage. Explore, experience, and understand the Vikings who shaped history.",
  primaryCtaText = "Book Tickets",
  secondaryCtaText = "Plan Your Visit",
  showScrollCue = true,
  showTrustRow = true,
}: CinematicHeroProps) {
  const bookingLink = getBookTicketsLink();

  return (
    <section className="relative isolate w-full min-h-screen overflow-hidden">
      {/* =====================================================
          BACKGROUND LAYERS
          ===================================================== */}

      {/* 1. Base Background Image */}
      <div className="absolute inset-0" role="presentation" aria-hidden="true">
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* 2. Dark Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

      {/* 3. Fog/Grain Texture Overlay */}
      <Texture
        type="noise"
        intensity="subtle"
        className="absolute inset-0"
        blendMode="overlay"
      />

      {/* 4. Rune Pattern (very subtle) */}
      <RunePattern />

      {/* =====================================================
          CONTENT LAYER
          ===================================================== */}
      <div className="relative z-20 w-full h-screen flex items-center">
        <Container
          size="xl"
          className="w-full py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column: Content (desktop) / Center (mobile) */}
          <div className="space-y-8 md:col-span-1 md:pr-12 animate-slideInLeft">
            {/* Overline */}
            <Overline className="block md:inline-block">
              Welcome to Legend
            </Overline>

            {/* Headline */}
            <H1 className="text-accent-ice-white leading-tight">
              {headline}
            </H1>

            {/* Subheadline */}
            <Body className="text-neutral-200 max-w-xl leading-relaxed text-lg">
              {subheadline}
            </Body>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Primary CTA */}
              {bookingLink.isExternal ? (
                <a
                  href={bookingLink.href}
                  target={bookingLink.target}
                  rel={bookingLink.rel}
                  onClick={() =>
                    trackBookTicketsClick({ source: "hero_primary", destination: "external" })
                  }
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-lg !bg-[#f7f6f2] !text-[#111111] !border !border-[#d4d0c8] hover:!bg-[#ece8df] hover:!shadow-none"
                  >
                    {primaryCtaText}
                  </Button>
                </a>
              ) : (
                <Link
                  href="/booking"
                  onClick={() =>
                    trackBookTicketsClick({ source: "hero_primary", destination: "internal" })
                  }
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-lg !bg-[#f7f6f2] !text-[#111111] !border !border-[#d4d0c8] hover:!bg-[#ece8df] hover:!shadow-none"
                  >
                    {primaryCtaText}
                  </Button>
                </Link>
              )}

              {/* Secondary CTA */}
              <Link href={ROUTES.visit}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-lg hover:shadow-lg hover:shadow-accent-frost-blue/20 transition-all hover:-translate-y-1"
                >
                  {secondaryCtaText}
                </Button>
              </Link>
            </div>

            {/* Tertiary Link */}
            <div>
              <Link
                href={ROUTES.groups}
                className="text-sm font-medium text-accent-frost-blue hover:text-accent-ice-white transition-colors inline-flex items-center gap-2 hover:gap-3"
              >
                Groups & Schools
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Trust Row */}
            {showTrustRow && (
              <div className="pt-8 border-t border-neutral-700/50 space-y-4">
                <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                  Why Víkingaheimar
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="text-accent-frost-blue flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        Reykjanesbær, Iceland
                      </p>
                      <p className="text-xs text-neutral-400">
                        South Coast Heritage
                      </p>
                    </div>
                  </div>

                  {/* Visit Duration */}
                  <div className="flex items-start gap-3">
                    <Clock
                      size={18}
                      className="text-accent-frost-blue flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        60–90 Minutes
                      </p>
                      <p className="text-xs text-neutral-400">
                        Average Visit Time
                      </p>
                    </div>
                  </div>

                  {/* Family Friendly */}
                  <div className="flex items-start gap-3">
                    <Users
                      size={18}
                      className="text-accent-frost-blue flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        Family Friendly
                      </p>
                      <p className="text-xs text-neutral-400">
                        All Ages Welcome
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Decorative (desktop only) */}
          <div className="hidden md:flex items-center justify-center md:col-span-1">
            {/* Decorative gradient shape */}
            <div className="relative w-full h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-frost-blue/10 to-cyan-500/10 rounded-2xl blur-3xl" />
              <div className="absolute inset-0 border border-accent-frost-blue/20 rounded-2xl shadow-2xl shadow-accent-frost-blue/10" />

              {/* Animated floating element */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div
                  className="w-32 h-32 border-2 border-accent-frost-blue rounded-full animate-slowZoom"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* =====================================================
          SCROLL CUE
          ===================================================== */}
      {showScrollCue && (
        <ScrollIndicator />
      )}
    </section>
  );
}
