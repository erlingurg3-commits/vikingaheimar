"use client";

import { useEffect } from "react";
import {
  DAGSPAKKAR,
  KVOLDPAKKAR,
  SERPAKKAR,
  CATERING,
  FEES,
  type Package,
  type LineItem,
} from "@/lib/gjaldskra";

// ─── Sub-components ───────────────────────────────────────────────────────────

function PackageTable({
  title,
  rows,
  col3Header,
}: {
  title: string;
  rows: Package[];
  col3Header: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#3a4a5c] text-white">
              <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em]">Pakki</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em]">Uppsetning</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em] hidden sm:table-cell">{col3Header}</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em] whitespace-nowrap">Verð</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.name} className={i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}>
                <td className="px-3.5 py-3 text-[#333] align-top leading-snug border-b border-[#eee] last:border-0">
                  <span className="font-semibold">{row.name}</span>
                  {row.badge && (
                    <span className="ml-1.5 inline-block bg-[#eef2ee] text-[#4a6a4a] text-[10px] font-bold tracking-[0.05em] uppercase px-1.5 py-0.5 rounded-[3px] align-middle">
                      {row.badge}
                    </span>
                  )}
                </td>
                <td className="px-3.5 py-3 text-[#333] align-top leading-[1.55] border-b border-[#eee] last:border-0">
                  {row.setup}
                  {row.note && (
                    <><br /><span className="text-[#999] text-[12px]">{row.note}</span></>
                  )}
                </td>
                <td className="px-3.5 py-3 text-[#333] align-top leading-[1.55] border-b border-[#eee] last:border-0 hidden sm:table-cell">
                  {row.includes}
                </td>
                <td className="px-3.5 py-3 align-top border-b border-[#eee] last:border-0 font-semibold text-[#1a1a1a] whitespace-nowrap">
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SimpleTable({
  title,
  col1: col1Header,
  col2: col2Header,
  rows,
}: {
  title: string;
  col1: string;
  col2: string;
  rows: LineItem[];
}) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-2">{title}</h3>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#3a4a5c] text-white">
            <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em]">{col1Header}</th>
            <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em] whitespace-nowrap">{col2Header}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.name} className={i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}>
              <td className="px-3.5 py-3 text-[#333] leading-[1.55] border-b border-[#eee] last:border-0">{row.name}</td>
              <td className="px-3.5 py-3 font-semibold text-[#1a1a1a] whitespace-nowrap border-b border-[#eee] last:border-0">{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function GjaldskraModal({ onClose }: { onClose: () => void }) {
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
    // Backdrop
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(20,25,35,0.55)] flex justify-center items-start p-4 sm:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Rate card */}
      <div className="w-full max-w-[820px] bg-white rounded shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-hidden my-4">

        {/* Header */}
        <div className="px-6 sm:px-9 py-6 border-b border-[#e5e5e3] flex justify-between items-start gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-0.5">
              Gjaldskrá — Hópar & Viðburðir
            </h2>
            <p className="text-[12px] text-[#888] tracking-[0.04em]">
              Verð 2026 · Öll verð innifalið 24% VSK
            </p>
          </div>
          <div className="flex items-start gap-5 shrink-0">
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
          <PackageTable title="Dagspakkar"  rows={DAGSPAKKAR}  col3Header="Tækjabúnaður" />
          <PackageTable title="Kvöldpakkar" rows={KVOLDPAKKAR} col3Header="Innifalið" />
          <PackageTable title="Sérpakkar"   rows={SERPAKKAR}   col3Header="Lýsing" />

          {/* Catering + Fees — side by side on desktop, stacked on mobile */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SimpleTable
              title="Veitingar (á mann)"
              col1="Tegund"
              col2="Verð"
              rows={CATERING}
            />
            <SimpleTable
              title="Gjöld & skilmálar"
              col1="Atriði"
              col2="Gjald"
              rows={FEES}
            />
          </div>

          <p className="mt-5 pt-4 border-t border-[#eee] text-[11px] text-[#999] italic leading-relaxed">
            * Öll verð innifalið VSK. Lágmarksfjöldi gesta og lágmarksveitingaeyðsla geta gilt á föstudag og
            laugardag kvöld. Heildags leiga er 8 klst. Hálfdags leiga er 4 klst. Tæknileg aðstoð er fáanleg
            að frekari samkomulagi.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="px-6 sm:px-9 py-5 border-t border-[#e5e5e3] flex flex-wrap justify-between items-center gap-4">
          <div className="text-[13px] text-[#444]">
            <strong className="block text-[#1a1a1a] font-semibold mb-0.5">
              Víkingaheimar · Víkingabraut 1, Reykjanesbær
            </strong>
            <a href="mailto:erlingur@vikingworld.is" className="text-[#3a4a5c] hover:underline">
              erlingur@vikingworld.is
            </a>
            {" · "}
            <a href="tel:+3548938383" className="text-[#3a4a5c] hover:underline">
              +354 893 8383
            </a>
          </div>
          <a
            href="mailto:erlingur@vikingworld.is"
            className="bg-[#3a4a5c] hover:bg-[#2c3a4a] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[5px] whitespace-nowrap transition-colors"
          >
            Senda fyrirspurn
          </a>
        </div>

      </div>
    </div>
  );
}
