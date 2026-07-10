"use client";

// ─── Data ─────────────────────────────────────────────────────────────────────
// Edit prices, names, and descriptions here. Touch nothing below the DATA line.

const DAGSPAKKAR = [
  {
    name: "Morgunfundur",
    meta: "2 klst · allt að 80 gestir\nþri–fös, 08:00–12:00",
    price: "95.000 kr",
    featured: false,
    badge: null,
  },
  {
    name: "Hálfdags ráðstefna",
    meta: "4 klst · allt að 120 gestir\nA/V búnaður, leiðsögn",
    price: "150.000 kr",
    featured: false,
    badge: null,
  },
  {
    name: "Heildags ráðstefna",
    meta: "8 klst · allt að 150 gestir\nþri–fös; veitingar fáanlegar",
    price: "220.000 kr",
    featured: false,
    badge: null,
  },
  {
    name: "Skóla-/hópshálfdagur",
    meta: "3 klst · allt að 80 gestir\nutan háannatíma",
    price: "80.000 kr",
    featured: false,
    badge: null,
  },
];

const KVOLDPAKKAR = [
  {
    name: "Kvöldmóttaka",
    meta: "allt að 4 klst · 150 gestir\nveitingar, bar, A/V",
    price: "200.000 kr",
    featured: false,
    badge: null,
  },
  {
    name: "Heilt kvöld — Úrval",
    meta: "4–7 klst · 200 gestir\nbrúðkaup, hátíðahöld, árshátíðir",
    price: "320.000 kr",
    featured: true,
    badge: "Vinsælasti pakki",
  },
  {
    name: "Hlýlegt kvöld",
    meta: "allt að 4 klst · 60 gestir\nkvöldmatur, bar, A/V",
    price: "150.000 kr",
    featured: false,
    badge: null,
  },
];

const SERPAKKAR = [
  {
    name: "Víkingabanketapakki",
    meta: "4 klst · 120 gestir\nþemart kvöldmatur, skemmtun",
    price: "280.000 kr",
    featured: true,
    badge: "Einstakt tilboð",
  },
  {
    name: "Kvikmynda-/ljósmyndataka",
    meta: "4 klst · virka daga\naðgangur að Íslendingur",
    price: "120.000 kr",
    featured: false,
    badge: null,
  },
  {
    name: "Einkasafnauppbót",
    meta: "Viðbót við hvaðan pakka\nleiðsögn um safn og skip",
    price: "+ 40.000 kr",
    featured: false,
    badge: null,
  },
];

const CATERING = [
  { name: "Kaffi & kaffiteiti við komu", price: "1.500 kr" },
  { name: "Hádegisverður — buffet",      price: "4.500 kr" },
  { name: "2 rétta kvöldmatur",          price: "8.500 kr" },
  { name: "Víkingabanket (þemart)",      price: "12.000 kr" },
  { name: "Drykkirpakki — 3 klst",       price: "6.000 kr" },
];

const FEES = [
  { name: "Þrifagjald",                  price: "25.000 kr" },
  { name: "Öryggisgæsla (>100 gestir)",  price: "35.000 kr" },
  { name: "Afbókun < 30 dögum",          price: "50% af leiguverði" },
  { name: "Afbókun < 7 dögum",           price: "100% af leiguverði" },
];

// ─── Component ────────────────────────────────────────────────────────────────

type Pkg = { name: string; meta: string; price: string; featured: boolean; badge: string | null };

function PackageCard({ pkg }: { pkg: Pkg }) {
  return (
    <div className={`pkg-card ${pkg.featured ? "pkg-featured" : ""}`}>
      {pkg.badge && <span className="pkg-badge">{pkg.badge}</span>}
      <p className="pkg-name">{pkg.name}</p>
      <p className="pkg-meta">
        {pkg.meta.split("\n").map((line, i) => (
          <span key={i}>{line}{i < pkg.meta.split("\n").length - 1 && <br />}</span>
        ))}
      </p>
      <p className="pkg-price">{pkg.price}</p>
    </div>
  );
}

function PackageGroup({ label, packages }: { label: string; packages: Pkg[] }) {
  return (
    <div className="pkg-group">
      <p className="section-label">{label}</p>
      <div className="pkg-grid">
        {packages.map((p) => <PackageCard key={p.name} pkg={p} />)}
      </div>
    </div>
  );
}

export default function GjaldskraSection() {
  return (
    <section className="gjaldskra-section">
      <div className="gjaldskra-inner">

        {/* Header */}
        <div className="gjaldskra-header">
          <span className="eyebrow">Viðburðarsalur</span>
          <h2 className="gjaldskra-title">Gjaldskrá — Hópar & Viðburðir</h2>
          <p className="gjaldskra-sub">Víkingaheimar · Víkingabraut 1, Reykjanesbær · Öll verð innifalið 24% VSK</p>
        </div>

        {/* Packages */}
        <PackageGroup label="Dagspakkar" packages={DAGSPAKKAR} />
        <PackageGroup label="Kvöldpakkar" packages={KVOLDPAKKAR} />
        <PackageGroup label="Sérpakkar" packages={SERPAKKAR} />

        {/* Catering */}
        <div className="pkg-group">
          <p className="section-label">Veitingar (á mann)</p>
          <div className="list-grid">
            {CATERING.map((item) => (
              <div key={item.name} className="list-row">
                <span>{item.name}</span>
                <strong>{item.price}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Fees */}
        <div className="pkg-group">
          <p className="section-label">Gjöld & skilmálar</p>
          <div className="list-grid list-grid--2col">
            {FEES.map((item) => (
              <div key={item.name} className="list-row">
                <span>{item.name}</span>
                <strong>{item.price}</strong>
              </div>
            ))}
          </div>
        </div>

        <p className="footnote">* Öll verð með VSK. Lágmarksfjöldi gesta og lágmarksveitingaeyðsla geta gilt á föstudag/laugardag kvöld.</p>

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

        /* Package group */
        .pkg-group {
          display: flex;
          flex-direction: column;
        }
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        /* Package card */
        .pkg-card {
          background: rgba(255, 255, 255, 0.025);
          border: 0.5px solid rgba(255, 255, 255, 0.09);
          border-radius: 4px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
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
        .pkg-badge {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #1a0e00;
          background: #c9b07a;
          padding: 3px 8px;
          border-radius: 2px;
          align-self: flex-start;
          margin-bottom: 2px;
        }
        .pkg-name {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 17px;
          font-weight: 400;
          color: #f0ece4;
          line-height: 1.2;
          margin: 0;
        }
        .pkg-meta {
          font-size: 12px;
          color: rgba(232, 226, 217, 0.38);
          line-height: 1.55;
          margin: 0;
          flex-grow: 1;
        }
        .pkg-price {
          font-size: 20px;
          font-weight: 300;
          color: #c9b07a;
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          margin: 4px 0 0;
        }

        /* List rows (catering + fees) */
        .list-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }
        .list-grid--2col {
          grid-template-columns: 1fr 1fr;
        }
        .list-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.025);
          border: 0.5px solid rgba(255, 255, 255, 0.07);
          border-radius: 3px;
          font-size: 13px;
          color: rgba(232, 226, 217, 0.65);
          gap: 12px;
        }
        .list-row strong {
          color: #e8e2d9;
          font-weight: 400;
          white-space: nowrap;
        }

        /* Footnote */
        .footnote {
          font-size: 11px;
          color: rgba(232, 226, 217, 0.2);
          margin: -24px 0 0;
          line-height: 1.6;
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
          .list-grid--2col {
            grid-template-columns: 1fr;
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
