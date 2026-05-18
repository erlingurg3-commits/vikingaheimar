import { notFound } from "next/navigation";
import { getEventBySlug, events } from "@/lib/events";
import type { Metadata } from "next";
import styles from "../slug.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.title} | Víkingaheimar`,
    description: event.tagline ?? `${event.title} — a special event at Víkingaheimar.`,
    alternates: { canonical: `/groups/events/${event.slug}` },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
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

      {/* ── Event title & intro ── */}
      <section className={styles.eventMeta}>
        {event.date && <p className={styles.eyebrow}>{event.date}</p>}
        <h1 className={styles.headline}>{event.title}</h1>
        {event.tagline && <p className={styles.tagline}>{event.tagline}</p>}
        {event.intro && <p className={styles.intro}>{event.intro}</p>}
      </section>

      {/* ── Facts strip ── */}
      {event.facts && event.facts.length > 0 && (
        <div className={styles.factsStrip}>
          {event.facts.map((fact) => (
            <div key={fact.label} className={styles.factItem}>
              <span className={styles.factValue}>{fact.value}</span>
              <span className={styles.factLabel}>{fact.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Timing table ── */}
      {event.timing && event.timing.length > 0 && (
        <div className={styles.timingSection}>
          <p className={styles.sectionLabel}>Eclipse timing · Reykjavík</p>
          <div className={styles.timingRows}>
            {event.timing.map((row) => (
              <div
                key={row.phase}
                className={`${styles.timingRow} ${row.highlight ? styles.timingRowHighlight : ""}`}
              >
                <span className={styles.timingPhase}>{row.phase}</span>
                <span className={styles.timingDivider} />
                <span className={styles.timingTime}>{row.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Content sections ── */}
      {event.sections && event.sections.length > 0 && (
        <div className={styles.sectionsBlock}>
          {event.sections.map((section) => (
            <div key={section.heading} className={styles.contentSection}>
              <h2 className={styles.sectionHeading}>{section.heading}</h2>
              <p className={styles.sectionBody}>{section.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Contact / enquire ── */}
      <div className={styles.eventContact}>
        <p className={styles.contactCopy}>
          Interested in witnessing this event at Víkingaheimar? Reach out to
          discuss group visits, private arrangements, or the evening programme.
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

      {/* ── Attribution ── */}
      {event.attribution && (
        <div className={styles.attribution}>
          <span>{event.attribution.text} </span>
          <a
            href={event.attribution.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attributionLink}
          >
            {event.attribution.label}
          </a>
        </div>
      )}

      {/* ── Footer bar ── */}
      <div className={styles.eventFooter}>
        <span>Víkingaheimar</span>
        <div className={styles.vlFooter} />
        <span>Víkingabraut 1, 260 Reykjanesbær</span>
      </div>
    </main>
  );
}
