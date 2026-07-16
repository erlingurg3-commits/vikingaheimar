"use client";

import { useEffect } from "react";

// ─── Verð 2026 ────────────────────────────────────────────────────────────────
// Einföld gjaldskrá: tvær leigugerðir. Breyttu verði/texta hér að ofan.

const PACKAGES = [
  {
    id: "dagleiga",
    name: "Dagleiga",
    time: "Síðdegi · 5 klst (t.d. kl. 12–17)",
    price: "250.000 kr",
    featured: false,
  },
  {
    id: "kvoldleiga",
    name: "Kvöldleiga",
    time: "Kvöld · 5 klst (t.d. kl. 18–23)",
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

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function GjaldskraModal({
  onClose,
}: {
  onClose: () => void;
  // isAdmin kept for call-site compatibility; edit mode retired in the simplified rate card.
  isAdmin?: boolean;
}) {
  // ESC to close + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(20,25,35,0.55)] flex justify-center items-start p-4 sm:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[640px] bg-white rounded shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-hidden my-4">

        {/* Header */}
        <div className="px-6 sm:px-9 py-6 border-b border-[#e5e5e3] flex justify-between items-start gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-0.5">
              Gjaldskrá — Salarleiga
            </h2>
            <p className="text-[12px] text-[#888] tracking-[0.04em]">
              Víkingaheimar · Verð 2026 · Öll verð með 24% VSK
            </p>
          </div>
          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[17px] font-bold text-[#1a1a1a] tracking-[0.06em] uppercase">
                Víkingaheimar
              </p>
              <p className="text-[10px] tracking-[0.14em] text-[#999] uppercase">Iceland</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Loka"
              className="text-[22px] leading-none text-[#aaa] hover:text-[#333] transition-colors mt-[-2px]"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-9 py-7">

          {/* Price cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-lg border p-5 flex flex-col gap-1 ${
                  pkg.featured
                    ? "border-[#3a4a5c] bg-[#f5f8fb]"
                    : "border-[#e2e2e0] bg-white"
                }`}
              >
                <p className="text-[15px] font-semibold text-[#1a1a1a]">{pkg.name}</p>
                <p className="text-[12px] text-[#888] leading-snug">{pkg.time}</p>
                <p className="mt-2 text-[24px] font-bold text-[#1a1a1a] tracking-[0.01em]">
                  {pkg.price}
                </p>
              </div>
            ))}
          </div>

          {/* Included */}
          <div className="mt-7">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3a4a5c] mb-3">
              Innifalið í verði
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-[#333]">
                  <span className="text-[#3a4a5c] mt-[1px]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Terms */}
          <div className="mt-7 pt-5 border-t border-[#eee]">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#888] mb-3">
              Skilmálar
            </h3>
            <ul className="flex flex-col gap-1.5">
              {TERMS.map((term) => (
                <li key={term} className="flex items-start gap-2 text-[12px] text-[#666] leading-relaxed">
                  <span className="text-[#bbb] mt-[2px]">·</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-9 py-5 border-t border-[#e5e5e3] flex flex-wrap justify-between items-center gap-4">
          <div className="text-[13px] text-[#444]">
            <strong className="block text-[#1a1a1a] font-semibold mb-0.5">
              Víkingaheimar · Víkingabraut 1, Reykjanesbær
            </strong>
            <a href="mailto:info@vikingworld.is" className="text-[#3a4a5c] hover:underline">
              info@vikingworld.is
            </a>
            {" · "}
            <a href="tel:+3548938383" className="text-[#3a4a5c] hover:underline">
              +354 893 8383
            </a>
          </div>
          <a
            href="mailto:info@vikingworld.is"
            className="bg-[#3a4a5c] hover:bg-[#2c3a4a] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[5px] whitespace-nowrap transition-colors"
          >
            Senda fyrirspurn
          </a>
        </div>

      </div>
    </div>
  );
}
