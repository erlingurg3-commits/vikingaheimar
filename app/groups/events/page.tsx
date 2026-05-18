import Link from "next/link";
import { events } from "@/lib/events";
import type { Metadata } from "next";
import styles from "./events.module.css";

export const metadata: Metadata = {
  title: "Events | Víkingaheimar",
  description:
    "Special events at Víkingaheimar — gather under the Norse sky for experiences unlike any other.",
  alternates: { canonical: "/groups/events" },
};

export default function EventsPage() {
  return (
    <main className={styles.eventsIndexPage}>
      {/* ── Decorative background logo ── */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className={styles.bgLogo}
      />

      {/* ── Hero ── */}
      <section className={styles.eventsHero}>
        <p className={styles.eyebrow}>Special Events</p>
        <h1 className={styles.headline}>
          Extraordinary moments<br />
          at <em>the edge of the world</em>
        </h1>
      </section>

      {/* ── Events grid ── */}
      <div className={styles.eventsBody}>
        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyLabel}>Coming soon</p>
            <p className={styles.emptyCopy}>
              We are preparing something exceptional. Check back shortly.
            </p>
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {events.map((event) => (
              <Link
                key={event.slug}
                href={`/groups/events/${event.slug}`}
                className={styles.eventCard}
              >
                {/* SVG hero visual */}
                <div className={styles.cardVisual}>
                  <img
                    src={event.svgPath}
                    alt={event.title}
                    className={styles.cardSvg}
                  />
                </div>

                {/* Card footer */}
                <div className={styles.cardFooter}>
                  {event.date && (
                    <p className={styles.cardDate}>{event.date}</p>
                  )}
                  <p className={styles.cardTitle}>{event.title}</p>
                  {event.tagline && (
                    <p className={styles.cardTagline}>{event.tagline}</p>
                  )}
                  <span className={styles.cardCta}>
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
      <div className={styles.eventsFooter}>
        <span>Víkingaheimar</span>
        <div className={styles.vl} />
        <span>Víkingabraut 1, 260 Reykjanesbær</span>
      </div>
    </main>
  );
}
