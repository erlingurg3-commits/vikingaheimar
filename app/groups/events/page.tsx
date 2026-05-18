import Link from "next/link";
import { events } from "@/lib/events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | Víkingaheimar",
  description:
    "Special events at Víkingaheimar — gather under the Norse sky for experiences unlike any other.",
  alternates: { canonical: "/groups/events" },
};

export default function EventsPage() {
  return (
    <main className="events-index-page">
      {/* ── Decorative background logo ── */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="bg-logo"
      />

      {/* ── Hero ── */}
      <section className="events-hero">
        <p className="eyebrow">Special Events</p>
        <h1 className="headline">
          Extraordinary moments<br />
          at <em>the edge of the world</em>
        </h1>
      </section>

      {/* ── Events grid ── */}
      <div className="events-body">
        {events.length === 0 ? (
          <div className="empty-state">
            <p className="empty-label">Coming soon</p>
            <p className="empty-copy">
              We are preparing something exceptional. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <Link
                key={event.slug}
                href={`/groups/events/${event.slug}`}
                className="event-card"
              >
                {/* SVG hero visual */}
                <div className="card-visual">
                  <img
                    src={event.svgPath}
                    alt={event.title}
                    className="card-svg"
                  />
                </div>

                {/* Card footer */}
                <div className="card-footer">
                  {event.date && (
                    <p className="card-date">{event.date}</p>
                  )}
                  <p className="card-title">{event.title}</p>
                  {event.tagline && (
                    <p className="card-tagline">{event.tagline}</p>
                  )}
                  <span className="card-cta">
                    View event
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6h8M6 2l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer bar ── */}
      <div className="events-footer">
        <span>Víkingaheimar</span>
        <div className="vl" />
        <span>Víkingabraut 1, 260 Reykjanesbær</span>
      </div>

      <style jsx>{`
        .events-index-page {
          background: #0a0a0a;
          color: #e8e2d9;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-weight: 300;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* Background logo — identical treatment to groups page */
        .bg-logo {
          position: absolute;
          top: -14vw;
          right: -18vw;
          width: 75vw;
          max-width: 1400px;
          height: auto;
          opacity: 0.06;
          pointer-events: none;
          user-select: none;
          z-index: 0;
          clip-path: inset(0 0 28% 0);
        }

        .events-index-page > section,
        .events-index-page > div {
          position: relative;
          z-index: 1;
        }

        /* Hero */
        .events-hero {
          padding: 80px 60px 40px;
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
        }
        .eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.22em;
          color: #8a7a5a;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .headline {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: clamp(40px, 6vw, 68px);
          font-weight: 300;
          line-height: 1.05;
          color: #f0ece4;
          margin-bottom: 0;
        }
        .headline em {
          font-style: italic;
          color: #c9b07a;
        }

        /* Body */
        .events-body {
          padding: 60px;
          min-height: 40vh;
        }

        /* Empty state */
        .empty-state {
          padding: 60px 0;
        }
        .empty-label {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8a7a5a;
          margin-bottom: 16px;
        }
        .empty-copy {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 22px;
          font-weight: 300;
          color: rgba(232, 226, 217, 0.4);
          line-height: 1.6;
        }

        /* Events grid */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2px;
        }

        /* Event card */
        .event-card {
          display: block;
          text-decoration: none;
          color: inherit;
          border: 0.5px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.01);
          transition: border-color 0.3s, background 0.3s;
          overflow: hidden;
        }
        .event-card:hover {
          border-color: rgba(201, 176, 122, 0.25);
          background: rgba(201, 176, 122, 0.025);
        }

        /* SVG visual area */
        .card-visual {
          width: 100%;
          aspect-ratio: 4 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        .card-svg {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 32px;
        }

        /* Card footer */
        .card-footer {
          padding: 24px 28px 28px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
        }
        .card-date {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8a7a5a;
          margin-bottom: 10px;
          font-weight: 400;
        }
        .card-title {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 28px;
          font-weight: 300;
          color: #f0ece4;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .card-tagline {
          font-size: 13px;
          color: rgba(232, 226, 217, 0.38);
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c9b07a;
          font-weight: 400;
          transition: gap 0.2s;
        }
        .event-card:hover .card-cta {
          gap: 12px;
        }

        /* Footer bar */
        .events-footer {
          padding: 20px 60px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .events-footer span {
          font-size: 11px;
          color: rgba(232, 226, 217, 0.18);
          letter-spacing: 0.05em;
        }
        .vl {
          width: 0.5px;
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .events-hero,
          .events-body,
          .events-footer {
            padding-left: 24px;
            padding-right: 24px;
          }
          .events-hero {
            padding-top: 48px;
          }
          .events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
