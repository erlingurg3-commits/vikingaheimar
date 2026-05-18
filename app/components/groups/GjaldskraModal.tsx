"use client";

import { useEffect, useState, useCallback } from "react";

type GjaldskraRow = {
  id: string;
  category: "dagspakkar" | "kvoldpakkar" | "serpakkar" | "catering" | "fees";
  sort_order: number;
  name: string;
  setup: string | null;
  note: string | null;
  includes: string | null;
  price: string;
  badge: string | null;
};

// ─── Editable input ───────────────────────────────────────────────────────────

function EditInput({
  value,
  onSave,
  placeholder,
}: {
  value: string | null;
  onSave: (val: string) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState(value ?? "");
  useEffect(() => { setVal(value ?? ""); }, [value]);

  return (
    <input
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => { if (val !== (value ?? "")) onSave(val); }}
      className="block w-full bg-[#f0f4f8] border border-[#c5d0dc] rounded px-1.5 py-1 text-[12px] text-[#1a1a1a] outline-none focus:border-[#3a4a5c] mt-0.5"
    />
  );
}

// ─── Package table ────────────────────────────────────────────────────────────

function PackageTable({
  title,
  rows,
  col3Header,
  category,
  editMode,
  onSave,
  onDelete,
  onAdd,
}: {
  title: string;
  rows: GjaldskraRow[];
  col3Header: string;
  category: GjaldskraRow["category"];
  editMode: boolean;
  onSave: (id: string, field: keyof GjaldskraRow, value: string) => void;
  onDelete: (id: string) => void;
  onAdd: (category: GjaldskraRow["category"]) => void;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#3a4a5c] text-white">
              {editMode && <th className="w-7" />}
              <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em]">Pakki</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em]">Uppsetning</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em] hidden sm:table-cell">{col3Header}</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em] whitespace-nowrap">Verð</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}>
                {/* Delete button */}
                {editMode && (
                  <td className="px-1 align-top pt-3 border-b border-[#eee]">
                    <button
                      onClick={() => onDelete(row.id)}
                      title="Eyða röð"
                      className="text-[#ccc] hover:text-red-400 transition-colors text-[16px] leading-none"
                    >
                      ×
                    </button>
                  </td>
                )}

                {/* Name + badge */}
                <td className="px-3.5 py-3 text-[#333] align-top leading-snug border-b border-[#eee] last:border-0">
                  {editMode ? (
                    <>
                      <EditInput value={row.name} onSave={(v) => onSave(row.id, "name", v)} placeholder="Nafn" />
                      <EditInput value={row.badge} onSave={(v) => onSave(row.id, "badge", v)} placeholder="Badge (valkvæmt)" />
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{row.name}</span>
                      {row.badge && (
                        <span className="ml-1.5 inline-block bg-[#eef2ee] text-[#4a6a4a] text-[10px] font-bold tracking-[0.05em] uppercase px-1.5 py-0.5 rounded-[3px] align-middle">
                          {row.badge}
                        </span>
                      )}
                    </>
                  )}
                </td>

                {/* Setup + note */}
                <td className="px-3.5 py-3 text-[#333] align-top leading-[1.55] border-b border-[#eee] last:border-0">
                  {editMode ? (
                    <>
                      <EditInput value={row.setup} onSave={(v) => onSave(row.id, "setup", v)} placeholder="Uppsetning" />
                      <EditInput value={row.note} onSave={(v) => onSave(row.id, "note", v)} placeholder="Athugasemd (valkvæmt)" />
                    </>
                  ) : (
                    <>
                      {row.setup}
                      {row.note && (
                        <><br /><span className="text-[#999] text-[12px]">{row.note}</span></>
                      )}
                    </>
                  )}
                </td>

                {/* Includes */}
                <td className="px-3.5 py-3 text-[#333] align-top leading-[1.55] border-b border-[#eee] last:border-0 hidden sm:table-cell">
                  {editMode ? (
                    <EditInput value={row.includes} onSave={(v) => onSave(row.id, "includes", v)} placeholder="Innifalið" />
                  ) : (
                    row.includes
                  )}
                </td>

                {/* Price */}
                <td className="px-3.5 py-3 align-top border-b border-[#eee] last:border-0 font-semibold text-[#1a1a1a] whitespace-nowrap">
                  {editMode ? (
                    <EditInput value={row.price} onSave={(v) => onSave(row.id, "price", v)} placeholder="Verð" />
                  ) : (
                    row.price
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editMode && (
        <button
          onClick={() => onAdd(category)}
          className="mt-2 text-[11px] text-[#3a4a5c] hover:text-[#2c3a4a] border border-dashed border-[#c5d0dc] hover:border-[#3a4a5c] rounded px-3 py-1.5 transition-colors w-full"
        >
          + Bæta við röð
        </button>
      )}
    </div>
  );
}

// ─── Simple table (catering / fees) ──────────────────────────────────────────

function SimpleTable({
  title,
  col1,
  col2,
  rows,
  category,
  editMode,
  onSave,
  onDelete,
  onAdd,
}: {
  title: string;
  col1: string;
  col2: string;
  rows: GjaldskraRow[];
  category: GjaldskraRow["category"];
  editMode: boolean;
  onSave: (id: string, field: keyof GjaldskraRow, value: string) => void;
  onDelete: (id: string) => void;
  onAdd: (category: GjaldskraRow["category"]) => void;
}) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-2">{title}</h3>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#3a4a5c] text-white">
            {editMode && <th className="w-7" />}
            <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em]">{col1}</th>
            <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] tracking-[0.03em] whitespace-nowrap">{col2}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}>
              {editMode && (
                <td className="px-1 align-top pt-3 border-b border-[#eee]">
                  <button
                    onClick={() => onDelete(row.id)}
                    title="Eyða röð"
                    className="text-[#ccc] hover:text-red-400 transition-colors text-[16px] leading-none"
                  >
                    ×
                  </button>
                </td>
              )}
              <td className="px-3.5 py-3 text-[#333] leading-[1.55] border-b border-[#eee] last:border-0">
                {editMode ? (
                  <EditInput value={row.name} onSave={(v) => onSave(row.id, "name", v)} placeholder="Tegund" />
                ) : (
                  row.name
                )}
              </td>
              <td className="px-3.5 py-3 font-semibold text-[#1a1a1a] whitespace-nowrap border-b border-[#eee] last:border-0">
                {editMode ? (
                  <EditInput value={row.price} onSave={(v) => onSave(row.id, "price", v)} placeholder="Verð" />
                ) : (
                  row.price
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editMode && (
        <button
          onClick={() => onAdd(category)}
          className="mt-2 text-[11px] text-[#3a4a5c] hover:text-[#2c3a4a] border border-dashed border-[#c5d0dc] hover:border-[#3a4a5c] rounded px-3 py-1.5 transition-colors w-full"
        >
          + Bæta við röð
        </button>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function GjaldskraModal({
  onClose,
  isAdmin = false,
}: {
  onClose: () => void;
  isAdmin?: boolean;
}) {
  const [rows, setRows] = useState<GjaldskraRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

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

  // Fetch data
  useEffect(() => {
    fetch("/api/gjaldskra")
      .then((r) => r.json())
      .then((data) => { setRows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const saveField = useCallback(async (id: string, field: keyof GjaldskraRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, [field]: value || null } : r)
    );
    await fetch(`/api/gjaldskra/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }, []);

  const deleteRow = useCallback(async (id: string) => {
    if (!confirm("Eyða þessari röð?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/gjaldskra/${id}`, { method: "DELETE" });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }, []);

  const addRow = useCallback(async (category: GjaldskraRow["category"]) => {
    const res = await fetch("/api/gjaldskra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, name: "Nýr pakki", price: "0 kr" }),
    });
    const newRow: GjaldskraRow = await res.json();
    setRows((prev) => [...prev, newRow]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }, []);

  const byCategory = (cat: GjaldskraRow["category"]) =>
    rows.filter((r) => r.category === cat);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(20,25,35,0.55)] flex justify-center items-start p-4 sm:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[820px] bg-white rounded shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-hidden my-4">

        {/* Header */}
        <div className="px-6 sm:px-9 py-6 border-b border-[#e5e5e3] flex justify-between items-start gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-0.5">
              Gjaldskrá — Hópar & Viðburðir
            </h2>
            <p className="text-[12px] text-[#888] tracking-[0.04em] flex items-center gap-2">
              Verð 2026 · Öll verð innifalið 24% VSK
              {saved && (
                <span className="text-[#4a6a4a] font-medium">✓ Vistað</span>
              )}
            </p>
          </div>
          <div className="flex items-start gap-3 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setEditMode((m) => !m)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded border transition-colors ${
                  editMode
                    ? "bg-[#3a4a5c] text-white border-[#3a4a5c]"
                    : "bg-white text-[#3a4a5c] border-[#3a4a5c] hover:bg-[#f0f4f8]"
                }`}
              >
                {editMode ? "Loka breytingum" : "Breyta"}
              </button>
            )}
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
          {loading ? (
            <p className="text-[13px] text-[#999] py-8 text-center">Hleður...</p>
          ) : (
            <>
              <PackageTable title="Dagspakkar"  rows={byCategory("dagspakkar")}  col3Header="Tækjabúnaður" category="dagspakkar"  editMode={editMode} onSave={saveField} onDelete={deleteRow} onAdd={addRow} />
              <PackageTable title="Kvöldpakkar" rows={byCategory("kvoldpakkar")} col3Header="Innifalið"    category="kvoldpakkar" editMode={editMode} onSave={saveField} onDelete={deleteRow} onAdd={addRow} />
              <PackageTable title="Sérpakkar"   rows={byCategory("serpakkar")}   col3Header="Lýsing"       category="serpakkar"   editMode={editMode} onSave={saveField} onDelete={deleteRow} onAdd={addRow} />

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SimpleTable title="Veitingar (á mann)" col1="Tegund" col2="Verð" rows={byCategory("catering")} category="catering" editMode={editMode} onSave={saveField} onDelete={deleteRow} onAdd={addRow} />
                <SimpleTable title="Gjöld & skilmálar"  col1="Atriði" col2="Gjald" rows={byCategory("fees")}    category="fees"     editMode={editMode} onSave={saveField} onDelete={deleteRow} onAdd={addRow} />
              </div>
            </>
          )}

          <p className="mt-5 pt-4 border-t border-[#eee] text-[11px] text-[#999] italic leading-relaxed">
            * Öll verð innifalið VSK. Lágmarksfjöldi gesta og lágmarksveitingaeyðsla geta gilt á föstudag og
            laugardag kvöld. Heildags leiga er 8 klst. Hálfdags leiga er 4 klst. Tæknileg aðstoð er fáanleg
            að frekari samkomulagi.
          </p>
        </div>

        {/* Footer */}
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
