"use client";

export default function GroupsPageClient() {
  return (
    <main className="groups-page">
      {/* ── Decorative oversized logo ── */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="bg-logo"
      />

      {/* ── Hero ── */}
      <section className="groups-hero">
        <p className="eyebrow">Group &amp; Private Events</p>
        <h1 className="headline">
          Gather in the spirit<br />
          of <em>the Vikings</em>
        </h1>
      </section>

      {/* ── Info grid ── */}
      <div className="groups-body">
        {/* Private hire */}
        <div className="left-col">
          <p className="section-label">Private Hire</p>
          <p className="hire-copy">
            The museum hall can be hired for private use outside of opening
            hours. We provide the space — your event, your planner, your
            vision.
          </p>
          <p className="hire-copy">
            Suitable for dinners, ceremonies, celebrations, corporate
            gatherings, and group visits.
          </p>
          <div className="coming-soon-box">
            <p>
              The hall is <strong>not yet available for hire</strong>. We are
              finalising the space and will open bookings shortly — reach out
              to register your interest.
            </p>
          </div>
        </div>

        {/* Direct contacts */}
        <div className="right-col">
          <p className="section-label">Direct contact</p>
          <div className="direct-contacts">
            <div className="contact-item">
              <p className="contact-label">General enquiries</p>
              <a href="mailto:info@vikingworld.is">info@vikingworld.is</a>
              <p className="contact-note">Group bookings &amp; event hire</p>
            </div>
            <div className="divider" />
            <div className="contact-item">
              <p className="contact-label">
                Erlingur Gunnarsson — Operations Director
              </p>
              <a href="mailto:erlingur@vikingworld.is">
                erlingur@vikingworld.is
              </a>
              <p className="contact-note">
                <a href="tel:+3548938383" className="phone-link">
                  +354 893 8383
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div className="groups-footer">
        <span>Víkingaheimar</span>
        <div className="vl" />
        <span>Víkingabraut 1, 260 Reykjanesbær</span>
      </div>

      <style jsx>{`
        .groups-page {
          background: #0a0a0a;
          color: #e8e2d9;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-weight: 300;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* Oversized decorative logo — top-right, bleeds off the page.
           Clip-path trims the "VIKING WORLD" wordmark off the source PNG. */
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
        @media (max-width: 768px) {
          .bg-logo {
            top: -18vw;
            right: -25vw;
            width: 110vw;
            opacity: 0.05;
          }
        }

        .groups-page > section,
        .groups-page > div {
          position: relative;
          z-index: 1;
        }

        /* Hero */
        .groups-hero {
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
          margin-bottom: 20px;
        }
        .headline em {
          font-style: italic;
          color: #c9b07a;
        }
        .subtext {
          font-size: 14px;
          color: rgba(232, 226, 217, 0.5);
          line-height: 1.7;
          max-width: 480px;
        }

        /* Body grid */
        .groups-body {
          padding: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
        }
        .section-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8a7a5a;
          margin-bottom: 24px;
          font-weight: 400;
        }

        .hire-copy {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 19px;
          font-weight: 300;
          line-height: 1.65;
          color: #d4cbbf;
          margin: 0 0 18px;
        }

        /* Occasions */
        .occasions {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .occasions li {
          padding: 15px 0;
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.07);
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 21px;
          font-weight: 300;
          color: #d4cbbf;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .occasions li:first-child {
          border-top: 0.5px solid rgba(255, 255, 255, 0.07);
        }
        .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #8a7a5a;
          flex-shrink: 0;
        }
        .coming-soon-box {
          margin-top: 28px;
          padding: 18px;
          border: 0.5px solid rgba(201, 176, 122, 0.2);
          border-radius: 2px;
        }
        .coming-soon-box p {
          font-size: 13px;
          color: rgba(232, 226, 217, 0.4);
          line-height: 1.65;
        }
        .coming-soon-box strong {
          color: #c9b07a;
          font-weight: 400;
        }

        /* Contacts */
        .right-col {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .direct-contacts {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .contact-item .contact-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8a7a5a;
          margin-bottom: 8px;
          font-weight: 400;
        }
        .contact-item a {
          font-family: var(--font-cormorant, 'Cormorant Garamond', serif);
          font-size: 20px;
          font-weight: 300;
          color: #e8e2d9;
          text-decoration: none;
          display: block;
          transition: color 0.2s;
        }
        .contact-item a:hover {
          color: #c9b07a;
        }
        .contact-note {
          font-size: 12px;
          color: rgba(232, 226, 217, 0.3);
          margin-top: 3px;
        }
        .phone-link {
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif) !important;
          font-size: 13px !important;
          color: rgba(232, 226, 217, 0.45) !important;
        }
        .divider {
          width: 32px;
          height: 0.5px;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Form */
        .form-section {
          border-top: 0.5px solid rgba(255, 255, 255, 0.08);
          padding: 48px 60px 60px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field.full {
          grid-column: 1 / -1;
        }
        .field label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8a7a5a;
          font-weight: 400;
        }
        .field input,
        .field select,
        .field textarea {
          background: rgba(255, 255, 255, 0.03);
          border: 0.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 2px;
          color: #e8e2d9;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 14px;
          font-weight: 300;
          padding: 12px 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
        }
        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: rgba(201, 176, 122, 0.5);
          background: rgba(201, 176, 122, 0.04);
        }
        .field.has-error input,
        .field.has-error select {
          border-color: rgba(201, 80, 80, 0.5);
        }
        .field-error {
          font-size: 11px;
          color: rgba(201, 100, 100, 0.8);
          letter-spacing: 0.05em;
        }
        .field select {
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          /* Solid background so the native dropdown panel isn't white */
          background-color: #14120e;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%238a7a5a' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          color: #e8e2d9;
          color-scheme: dark;
        }
        .field select option {
          background-color: #14120e;
          color: #e8e2d9;
        }
        .field select option:disabled {
          color: rgba(232, 226, 217, 0.4);
        }
        .field textarea {
          resize: vertical;
          min-height: 100px;
        }
        .field input::placeholder,
        .field textarea::placeholder {
          color: rgba(232, 226, 217, 0.2);
        }
        .submit-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 28px;
        }
        .btn-submit {
          background: transparent;
          border: 0.5px solid rgba(201, 176, 122, 0.5);
          color: #c9b07a;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 14px 36px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          border-radius: 2px;
        }
        .btn-submit:hover:not(:disabled) {
          background: rgba(201, 176, 122, 0.1);
          color: #e0ca96;
        }
        .btn-submit:disabled {
          opacity: 0.4;
          cursor: default;
        }
        .submit-note {
          font-size: 12px;
          color: rgba(232, 226, 217, 0.25);
        }
        .success-msg {
          font-size: 13px;
          color: #c9b07a;
          margin-top: 20px;
          letter-spacing: 0.05em;
        }
        .error-msg {
          font-size: 13px;
          color: rgba(201, 100, 100, 0.8);
          margin-top: 20px;
        }
        .error-msg a {
          color: #c9b07a;
        }

        /* Footer */
        .groups-footer {
          padding: 20px 60px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .groups-footer span {
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
          .groups-hero,
          .groups-body,
          .form-section,
          .groups-footer {
            padding-left: 24px;
            padding-right: 24px;
          }
          .groups-body {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .field.full {
            grid-column: 1;
          }
          .submit-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
