"use client";

import React from "react";
import Link from "next/link";
import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";
import HeroButton from "@/app/components/ui/HeroButton";
import { trackBookTicketsClick } from "@/lib/analytics";

const container = "mx-auto w-full max-w-[1080px] px-8 md:px-16";

// Hooks drawn from Gunnbjörn's knowledge base — question + a one-line tease.
// The full answer is deliberately held for the visit.
const HOOKS: { q: string; hook: string }[] = [
  { q: "Why is every Viking you've seen wearing a helmet they never owned?", hook: "Not one horned helmet has ever been found in Viking soil — only a single plain iron helm survives." },
  { q: "A hand-built Viking ship crossed the Atlantic to America — in the year 2000.", hook: "Made with ancient techniques by a single Icelandic shipwright, the Íslendingur retraced Leif Eiriksson's voyage a thousand years on. She's the reason this museum exists." },
  { q: "Who reached America five centuries before Columbus?", hook: "The Norse did — and a windswept site in Newfoundland proves it." },
  { q: "A sword could cost you sixteen cows. So who actually got to fight?", hook: "What a warrior carried told you exactly who he was." },
  { q: "30,000 iron rings. Six months of a smith's life. For one shirt.", hook: "Only the richest raiders wore mail — see what it took to armour a Viking." },
  { q: "The most feared bodyguards in the medieval world were… Vikings?", hook: "They guarded the Emperor of Constantinople for nearly four centuries." },
  { q: "You can eat a thousand-year-old Viking recipe for breakfast tomorrow.", hook: "Skyr is still made in Iceland exactly as the Vikings made it." },
  { q: "How did a Buddha from India end up in a Viking grave?", hook: "Norse trade routes ran further than you'd ever guess — as far as Baghdad." },
  { q: "Every sail that crossed the ocean was made by a woman.", hook: "The voyages don't happen without them — and one Norse woman sailed to America and back." },
  { q: "An entire alphabet older than England, carved into stone and bone.", hook: "The runes recorded laws, memorials, love notes — and insults." },
];

function HookCard({ q, hook, index }: { q: string; hook: string; index: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ delay: (index % 3) * 90 });
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 800ms cubic-bezier(0.25,0.1,0.25,1), transform 800ms cubic-bezier(0.25,0.1,0.25,1)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderTop: "3px solid #d4a843",
        borderRadius: 6,
        padding: "26px 24px",
        background: "rgba(255,255,255,0.02)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.25rem", lineHeight: 1.25, color: "#e8dcc8" }}>
        {q}
      </h3>
      <p style={{ marginTop: 12, fontSize: "0.95rem", lineHeight: 1.6, color: "rgba(255,255,255,0.55)", flex: 1 }}>
        {hook}
      </p>
      <Link
        href={`/vikings?ask=${encodeURIComponent(q)}#gunnbjorn`}
        className="font-display"
        style={{ marginTop: 18, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#d4a843", textDecoration: "none" }}
      >
        Ask Gunnbjörn →
      </Link>
    </div>
  );
}

export default function WhatToExpectClient() {
  const { ref: introRef, isVisible: introVis } = useScrollReveal<HTMLDivElement>();
  const { ref: ctaRef, isVisible: ctaVis } = useScrollReveal<HTMLDivElement>();

  return (
    <main style={{ background: "#0d0c0a", minHeight: "100vh" }}>
      {/* Intro */}
      <section className={`${container}`} style={{ paddingTop: 96, paddingBottom: 40 }}>
        <div
          ref={introRef}
          style={{
            opacity: introVis ? 1 : 0,
            transform: introVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 900ms ease, transform 900ms ease",
          }}
        >
          <p style={{ color: "rgba(78,168,222,0.80)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.25em" }}>
            What to Expect
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(34px,5vw,56px)", lineHeight: 1.08, color: "#ffffff", marginTop: 18, maxWidth: 760 }}>
            Questions you&apos;ll leave answered.
          </h1>
          <p style={{ marginTop: 18, fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", maxWidth: 620 }}>
            Every object in Víkingaheimar carries a story. Here are a few that
            catch people off guard. Read them, wonder — then come and stand where
            the answers live.
          </p>
        </div>
      </section>

      {/* Hook grid */}
      <section className={`${container}`} style={{ paddingBottom: 72 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOOKS.map((h, i) => (
            <HookCard key={h.q} q={h.q} hook={h.hook} index={i} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          ref={ctaRef}
          className={`${container}`}
          style={{
            paddingTop: 72,
            paddingBottom: 96,
            textAlign: "center",
            opacity: ctaVis ? 1 : 0,
            transform: ctaVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 900ms ease, transform 900ms ease",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.1, color: "#ffffff", maxWidth: 620, margin: "0 auto" }}>
            The rest of the story is waiting in Njarðvík.
          </h2>
          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <HeroButton href="/booking" label="BOOK TICKETS" onClick={() => trackBookTicketsClick({ source: "what-to-expect-cta" })} />
            <HeroButton href="/vikings#gunnbjorn" label="MEET GUNNBJÖRN" variant="frost" />
          </div>
        </div>
      </section>
    </main>
  );
}
