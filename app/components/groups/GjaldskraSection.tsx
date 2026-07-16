"use client";

// ─── Verð 2026 ────────────────────────────────────────────────────────────────
// Einföld gjaldskrá: tvær leigugerðir. Breyttu verði/texta hér.

const PACKAGES = [
  {
    name: "Dagleiga",
    meta: "Síðdegi · 5 klst\nt.d. kl. 12–17",
    price: "250.000 kr",
    featured: false,
  },
  {
    name: "Kvöldleiga",
    meta: "Kvöld · 5 klst\nt.d. kl. 18–23",
    price: "350.000 kr",
    featured: true,
  },
];

const INCLUDED = [
  "Einkaafnot af salnum",
  "Einn starfsmaður frá Víkingaheimum",
  "Þrif eftir viðburð",
  "Grunn hljóð- og myndbúnaður og uppsetning",
];

const TERMS = [
  "Öll verð eru með 24% VSK.",
  "Veitingar og bar eru ekki innifalin — tilboð gert samkvæmt óskum.",
  "Aukastarfsfólk fyrir stærri viðburði (100+ gestir) eða barþjónustu er rukkað sérstaklega.",
  "Leigutími er 5 klst. Umframtími er samkvæmt samkomulagi.",
  "Bókun er staðfest með undirrituðu samkomulagi.",
  "Afbókun innan 14 daga: 50% af leiguverði. Innan 7 daga: 100% af leiguverði.",
];

export default function GjaldskraSection() {
  return (
    <section className="gjaldskra-section">
      <div className="gjaldskra-inner">

        {/* Header */}
        <div className="gjaldskra-header">
          <span className="eyebrow">Viðburðarsalur</span>
          <h2 className="gjaldskra-title">Gjaldskrá — Salarleiga</h2>
          <p className="gjaldskra-sub">Víkingaheimar · Víkingabraut 1, Reykjanesbær · Verð 2026 · Öll verð með 24% VSK</p>
        </div>

        {/* Prices */}
        <div className="pkg-grid">
          {PACKAGES.map((pkg) => (
            <div key={pkg.name} className={`pkg-card ${pkg.featured ? "pkg-featured" : ""}`}>
              <p className="pkg-name">{pkg.name}</p>
              <p className="pkg-meta">
                {pkg.meta.split("\n").map((line, i) => (
                  <span key={i}>{line}{i < pkg.meta.split("\n").length - 1 && <br />}</span>
                ))}
              </p>
              <p className="pkg-price">{pkg.price}</p>
            </div>
          ))}
        </div>

        {/* Included */}
        <div className="pkg-group">
          <p className="section-label">Innifalið í verði</p>
          <div className="included-grid">
            {INCLUDED.map((item) => (
              <div key={item} className="included-row">
                <span className="tick">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="pkg-group">
          <p className="section-label">Skilmálar</p>
          <ul className="terms-list">
            {TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="gjaldskra-cta">
          <div className="cta-text">
            <p className="cta-label">Hafðu samband til að bóka eða fá tilboð</p>
            <p className="cta-contact">info@vikingworld.is · +354 893 8383</p>
          </div>
          <a href="mailto:info@vikingworld.is" className="cta-btn">Senda fyrirspurn</a>
        </div>

      </div>

      <style jsx>{`
        .gjaldskra-section {
          border-top: 0.5px solid rgba(255, 255, 255, 0.08);
          padding: 72px 0 0;
        }
        .gjaldskra-inner {
          padding: 0 60px 0;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        /* Header */
        .gjaldskra-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .eyebrow {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.22em;
          color: #8a7a5a;
          text-transform: uppercase;
        }
        .gjaldskra-title {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 300;
          line-height: 1.1;
          color: #f0ece4;
          margin: 0;
        }
        .gjaldskra-sub {
          font-size: 12px;
          color: rgba(232, 226, 217, 0.3);
          letter-spacing: 0.04em;
        }

        /* Section label */
        .section-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8a7a5a;
          font-weight: 400;
          margin: 0 0 16px;
        }
        .pkg-group {
          display: flex;
          flex-direction: column;
        }

        /* Price cards */
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          max-width: 640px;
        }
        .pkg-card {
          background: rgba(255, 255, 255, 0.025);
          border: 0.5px solid rgba(255, 255, 255, 0.09);
          border-radius: 4px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.2s;
        }
        .pkg-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }
        .pkg-featured {
          border-color: rgba(201, 176, 122, 0.35);
          background: rgba(201, 176, 122, 0.04);
        }
        .pkg-featured:hover {
          border-color: rgba(201, 176, 122, 0.55);
        }
        .pkg-name {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 22px;
          font-weight: 400;
          color: #f0ece4;
          line-height: 1.2;
          margin: 0;
        }
        .pkg-meta {
          font-size: 12px;
          color: rgba(232, 226, 217, 0.4);
          line-height: 1.55;
          margin: 0;
          flex-grow: 1;
        }
        .pkg-price {
          font-size: 26px;
          font-weight: 300;
          color: #c9b07a;
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          margin: 6px 0 0;
        }

        /* Included */
        .included-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 10px 24px;
          max-width: 640px;
        }
        .included-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: rgba(232, 226, 217, 0.75);
          line-height: 1.5;
        }
        .tick {
          color: #c9b07a;
          font-size: 12px;
          margin-top: 2px;
        }

        /* Terms */
        .terms-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 640px;
        }
        .terms-list li {
          position: relative;
          padding-left: 16px;
          font-size: 12px;
          color: rgba(232, 226, 217, 0.4);
          line-height: 1.6;
        }
        .terms-list li::before {
          content: "·";
          position: absolute;
          left: 4px;
          color: rgba(232, 226, 217, 0.3);
        }

        /* CTA */
        .gjaldskra-cta {
          margin-top: 8px;
          padding: 28px 32px;
          border: 0.5px solid rgba(201, 176, 122, 0.2);
          border-radius: 4px;
          background: rgba(201, 176, 122, 0.03);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 72px;
          max-width: 640px;
        }
        .cta-label {
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232, 226, 217, 0.3);
          margin: 0 0 6px;
        }
        .cta-contact {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 20px;
          font-weight: 300;
          color: #e8e2d9;
          margin: 0;
        }
        .cta-btn {
          background: transparent;
          border: 0.5px solid rgba(201, 176, 122, 0.5);
          color: #c9b07a;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 13px 32px;
          border-radius: 2px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s, color 0.2s;
        }
        .cta-btn:hover {
          background: rgba(201, 176, 122, 0.1);
          color: #e0ca96;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .gjaldskra-inner {
            padding: 0 24px;
            gap: 40px;
          }
          .gjaldskra-cta {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 20px;
          }
        }
      `}</style>
    </section>
  );
}
