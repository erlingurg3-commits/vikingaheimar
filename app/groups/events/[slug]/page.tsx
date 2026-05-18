import { notFound } from "next/navigation";
import { getEventBySlug, events } from "@/lib/events";
import type { Metadata } from "next";
import styles from "../slug.module.css";

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
    <main className={styles.eventDetailPage}>
      {/* ── Decorative background logo ── */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className={styles.bgLogo}
      />

      {/* ── SVG Hero ── */}
      <section className={styles.eventHero}>
        <div className={styles.svgFrame}>
          <img
            src={event.svgPath}
            alt={event.title}
            className={styles.eventSvg}
          />
        </div>
      </section>

      {/* ── Event title & meta ── */}
      <section className={styles.eventMeta}>
        {event.date && <p className={styles.eyebrow}>{event.date}</p>}
        <h1 className={styles.headline}>{event.title}</h1>
        {event.tagline && <p className={styles.tagline}>{event.tagline}</p>}
      </section>

      {/* ── Contact / enquire ── */}
      <div className={styles.eventContact}>
        <p className={styles.contactCopy}>
          Interested in this event? Reach out to discuss attendance, group
          bookings, or private arrangements.
        </p>
        <div className={styles.contactLinks}>
          <a href="mailto:info@vikingworld.is" className={styles.contactLink}>
            info@vikingworld.is
          </a>
          <div className={styles.vl} />
          <a href="mailto:erlingur@vikingworld.is" className={styles.contactLink}>
            erlingur@vikingworld.is
          </a>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div className={styles.eventFooter}>
        <span>Víkingaheimar</span>
        <div className={styles.vlFooter} />
        <span>Víkingabraut 1, 260 Reykjanesbær</span>
      </div>
    </main>
  );
}
