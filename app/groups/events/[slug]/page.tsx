'use client';
import { notFound } from "next/navigation";
import { getEventBySlug, events } from "@/lib/events";
import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getEventBySlug(params.slug);
  if (!event) return {};
  return {
    title: `${event.title} | Víkingaheimar`,
    description: event.tagline ?? `${event.title} — a special event at Víkingaheimar.`,
    alternates: { canonical: `/groups/events/${event.slug}` },
  };
}

export default function EventDetailPage({ params }: Props) {
  const event = getEventBySlug(params.slug);
  if (!event) notFound();

  return (
    <main className="event-detail-page">
      {/* ── Decorative background logo ── */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="bg-logo"
      />

      {/* ── SVG Hero ── */}
      <section className="event-hero">
        <div className="svg-frame">
          <img
            src={event.svgPath}
            alt={event.title}
            className="event-svg"
          />
        </div>
      </section>

      {/* ── Event title & meta ── */}
      <section className="event-meta">
        {event.date && <p className="eyebrow">{event.date}</p>}
        <h1 className="headline">{event.title}</h1>
        {event.tagline && <p className="tagline">{event.tagline}</p>}
      </section>

      {/* ── Contact / enquire ── */}
      <div className="event-contact">
        <p className="contact-copy">
          Interested in this event? Reach out to discuss attendance, group
          bookings, or private arrangements.
        </p>
        <div className="contact-links">
          <a href="mailto:info@vikingworld.is" className="contact-link">
            info@vikingworld.is
          </a>
          <div className="vl" />
          <a href="mailto:erlingur@vikingworld.is" className="contact-link">
            erlingur@vikingworld.is
          </a>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div className="event-footer">
        <span>Víkingaheimar</span>
        <div className="vl-footer" />
        <span>Víkingabraut 1, 260 Reykjanesbær</span>
      </div>

      <style jsx>{`
        .event-detail-page {
          background: #0a0a0a;
          color: #e8e2d9;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-weight: 300;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* Background logo */
        .bg-logo {
          position: absolute;
          top: -14vw;
          right: -18vw;
          width: 75vw;
          max-width: 1400px;
          height: auto;
          opacity: 0.04;
          pointer-events: none;
          user-select: none;
          z-index: 0;
          clip-path: inset(0 0 28% 0);
        }

        .event-detail-page > section,
        .event-detail-page > div {
          position: relative;
          z-index: 1;
        }

        /* SVG Hero */
        .event-hero {
          padding: 60px 60px 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .svg-frame {
          width: 100%;
          max-width: 860px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0.5px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        .event-svg {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 40px;
        }

        /* Title & meta */
        .event-meta {
          padding: 48px 60px 0;
          max-width: 860px;
        }
        .eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.22em;
          color: #8a7a5a;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .headline {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: clamp(38px, 5.5vw, 64px);
          font-weight: 300;
          line-height: 1.05;
          color: #f0ece4;
          margin-bottom: 16px;
        }
        .tagline {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 20px;
          font-weight: 300;
          color: rgba(232, 226, 217, 0.45);
          line-height: 1.65;
          max-width: 560px;
        }

        /* Contact */
        .event-contact {
          padding: 48px 60px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.08);
          margin-top: 48px;
        }
        .contact-copy {
          font-size: 13px;
          color: rgba(232, 226, 217, 0.35);
          margin-bottom: 20px;
          max-width: 480px;
          line-height: 1.7;
        }
        .contact-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .contact-link {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 18px;
          font-weight: 300;
          color: #e8e2d9;
          text-decoration: none;
          transition: color 0.2s;
        }
        .contact-link:hover {
          color: #c9b07a;
        }
        .vl {
          width: 0.5px;
          height: 14px;
          background: rgba(255, 255, 255, 0.12);
        }

        /* Footer */
        .event-footer {
          padding: 20px 60px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .event-footer span {
          font-size: 11px;
          color: rgba(232, 226, 217, 0.18);
          letter-spacing: 0.05em;
        }
        .vl-footer {
          width: 0.5px;
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .event-hero,
          .event-meta,
          .event-contact,
          .event-footer {
            padding-left: 24px;
            padding-right: 24px;
          }
          .event-hero {
            padding-top: 40px;
          }
          .event-meta {
            padding-top: 32px;
          }
          .contact-links {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .vl {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
