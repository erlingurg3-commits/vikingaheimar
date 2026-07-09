"use client";

import { useMemo, useState } from "react";

/**
 * Breakfast Counter / Ordering
 * ----------------------------
 * Baseline quantities are expressed PER 10 GUESTS (from kitchen experience).
 * Enter the guest count and everything scales, rounded UP so nothing runs out.
 *
 * v1: list is fixed in code. Amounts can be nudged per-row in "Edit amounts"
 * mode; edits reset when the guest count changes or on reload.
 */

const BASE_PAX = 10;

type Round = "whole" | "half" | "quarter" | "g50" | "halfLitre";

type Item = {
  id: string;
  name: string;
  /** Amount(s) per 10 guests. Use [low, high] for a range. */
  per10?: number | [number, number];
  unit?: string;
  round?: Round;
  /** Qualitative item with no numeric scaling (e.g. "keep basket stocked"). */
  note?: string;
  /** Extra hint shown under the amount. */
  hint?: string;
};

type Category = {
  id: string;
  title: string;
  items: Item[];
};

const CATEGORIES: Category[] = [
  {
    id: "bread",
    title: "Bread",
    items: [
      { id: "bread", name: "Bread", per10: 1, unit: "loaf", round: "whole" },
      { id: "rugbraud", name: "Rúgbrauð (rye bread)", per10: 0.25, unit: "loaf", round: "quarter" },
    ],
  },
  {
    id: "coldcuts",
    title: "Cold cuts & cheese",
    items: [
      { id: "cheese", name: "Cheese", per10: 20, unit: "slices", round: "whole" },
      { id: "ham", name: "Smoked ham", per10: 20, unit: "slices", round: "whole" },
      { id: "salami-it", name: "Italian salami", per10: 20, unit: "slices", round: "whole" },
      { id: "salami-dk", name: "Danish salami", per10: 20, unit: "slices", round: "whole" },
      { id: "pepperoni", name: "Pepperoni", per10: 20, unit: "slices", round: "whole" },
      { id: "eggs", name: "Eggs", per10: [6, 10], unit: "eggs", round: "whole" },
    ],
  },
  {
    id: "fish",
    title: "Fish",
    items: [{ id: "herring", name: "Herring", per10: [300, 350], unit: "g", round: "g50" }],
  },
  {
    id: "veg",
    title: "Vegetables",
    items: [
      { id: "cucumber", name: "Cucumber", per10: 0.5, unit: "cucumber", round: "half" },
      { id: "tomatoes", name: "Tomatoes", per10: 200, unit: "g", round: "g50" },
    ],
  },
  {
    id: "fruit",
    title: "Fruit",
    items: [
      { id: "watermelon", name: "Watermelon", per10: 0.5, unit: "melon", round: "half" },
      { id: "yellowmelon", name: "Yellow melon", per10: 0.5, unit: "melon", round: "half" },
      { id: "oranges", name: "Oranges", per10: 2, unit: "oranges", round: "whole" },
      { id: "grapefruits", name: "Grapefruits", per10: 2, unit: "grapefruits", round: "whole" },
      { id: "kiwis", name: "Kiwis", per10: 2, unit: "kiwis", round: "whole" },
      { id: "grapes", name: "Grapes", per10: 1, unit: "bunch", round: "whole", hint: "some — a few bunches" },
    ],
  },
  {
    id: "dairy",
    title: "Dairy",
    items: [
      { id: "butter", name: "Butter", per10: [0.5, 1], unit: "pack", round: "half" },
      { id: "milk", name: "Milk", per10: [2, 3], unit: "L", round: "halfLitre" },
      { id: "skyr", name: "Skyr", per10: 1, unit: "L", round: "halfLitre", hint: "100 ml per guest" },
    ],
  },
  {
    id: "cereal",
    title: "Porridge & cereal",
    items: [
      { id: "porridge", name: "Oatmeal porridge", per10: 2, unit: "L", round: "halfLitre" },
      { id: "muesli", name: "Muesli, cornflakes & breakfast cereals", note: "Provide a selection" },
    ],
  },
  {
    id: "cake",
    title: "Cake",
    items: [
      { id: "cake", name: "Cake", per10: 1, unit: "cake", round: "whole", hint: "at least 1 slice per guest" },
    ],
  },
  {
    id: "basket",
    title: "On the table (basket)",
    items: [
      { id: "ricecakes", name: "Rice cakes", note: "Keep basket stocked" },
      { id: "ryecrisp", name: "Rye crispbread", note: "Keep basket stocked" },
      { id: "oatcookies", name: "Oatmeal cookies", note: "Keep basket stocked" },
      { id: "glutenfree", name: "Gluten-free crispbread", note: "Always keep some in stock" },
    ],
  },
  {
    id: "drinks",
    title: "Drinks",
    items: [
      { id: "water", name: "Water", note: "Provide jug(s)" },
      { id: "orangedrink", name: "Orange drink", note: "Garnish with orange slices" },
      { id: "berrydrink", name: "Wild Berry drink", note: "Garnish with orange slices" },
      { id: "coffee", name: "Coffee", per10: 2, unit: "L", round: "halfLitre", hint: "≈ one 2 L pot per 10 guests" },
    ],
  },
];

const ALL_ITEMS = CATEGORIES.flatMap((c) => c.items);
const PRESETS = [10, 20, 30, 40, 50];

/** Round a value UP according to the item's rounding rule. */
function roundUp(value: number, mode: Round): number {
  switch (mode) {
    case "whole":
      return Math.ceil(value);
    case "half":
      return Math.ceil(value * 2) / 2;
    case "quarter":
      return Math.ceil(value * 4) / 4;
    case "g50":
      return Math.ceil(value / 50) * 50;
    case "halfLitre":
      return Math.ceil(value * 2) / 2;
    default:
      return value;
  }
}

/** Pretty-print numbers with nice fractions (¼, ½, ¾). */
function fmt(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  let fracStr = "";
  if (Math.abs(frac - 0.25) < 1e-9) fracStr = "¼";
  else if (Math.abs(frac - 0.5) < 1e-9) fracStr = "½";
  else if (Math.abs(frac - 0.75) < 1e-9) fracStr = "¾";
  else if (frac > 1e-9) return String(Math.round(n * 100) / 100);

  if (fracStr) return whole > 0 ? `${whole}${fracStr}` : fracStr;
  return String(whole);
}

type Computed = { display: string; plain: string };

function computeAmount(item: Item, pax: number): Computed | null {
  if (item.per10 === undefined) return null;
  const factor = pax / BASE_PAX;
  const mode: Round = item.round ?? "whole";

  if (Array.isArray(item.per10)) {
    const low = roundUp(item.per10[0] * factor, mode);
    const high = roundUp(item.per10[1] * factor, mode);
    const lowS = fmt(low);
    const highS = fmt(high);
    const range = lowS === highS ? lowS : `${lowS}–${highS}`;
    return { display: `${range} ${item.unit ?? ""}`.trim(), plain: `${range} ${item.unit ?? ""}`.trim() };
  }

  const val = roundUp(item.per10 * factor, mode);
  return { display: `${fmt(val)} ${item.unit ?? ""}`.trim(), plain: `${fmt(val)} ${item.unit ?? ""}`.trim() };
}

export default function BreakfastCounterPage() {
  const [pax, setPax] = useState<number>(10);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const setPaxSafe = (n: number) => {
    const clamped = Math.max(1, Math.min(999, Math.round(n || 0)));
    setPax(clamped);
    setOverrides({}); // amounts recompute — clear manual edits
  };

  const amounts = useMemo(() => {
    const map: Record<string, Computed | null> = {};
    for (const item of ALL_ITEMS) map[item.id] = computeAmount(item, pax);
    return map;
  }, [pax]);

  const checkableIds = ALL_ITEMS.map((i) => i.id);
  const checkedCount = checkableIds.filter((id) => checked[id]).length;
  const totalCount = checkableIds.length;

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const amountFor = (item: Item): string => {
    if (item.note) return item.note;
    if (overrides[item.id] !== undefined && overrides[item.id] !== "")
      return overrides[item.id];
    return amounts[item.id]?.display ?? "";
  };

  const copyList = async () => {
    const lines: string[] = [`Breakfast — ${pax} guests`, ""];
    for (const cat of CATEGORIES) {
      lines.push(`${cat.title}:`);
      for (const item of cat.items) {
        lines.push(`  - ${item.name}: ${amountFor(item)}`);
      }
      lines.push("");
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="space-y-6 max-w-5xl mx-auto">
      {/* Header + guest control */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-6 sm:p-8 print:border-0 print:bg-white print:text-black">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white print:text-black">
              Breakfast Counter
            </h2>
            <p className="mt-2 text-sm text-gray-400 print:text-gray-700">
              Quantities scale from a per-10-guest baseline and round up so nothing runs out.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => setPaxSafe(pax - 1)}
              className="h-10 w-10 rounded-lg border border-emerald-500/30 bg-white/5 text-lg text-white hover:bg-white/10"
              aria-label="Decrease guests"
            >
              −
            </button>
            <div className="flex flex-col items-center">
              <input
                type="number"
                value={pax}
                min={1}
                max={999}
                onChange={(e) => setPaxSafe(Number(e.target.value))}
                className="w-24 rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-center text-2xl font-semibold text-emerald-200 outline-none focus:border-emerald-400"
              />
              <span className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">
                guests
              </span>
            </div>
            <button
              onClick={() => setPaxSafe(pax + 1)}
              className="h-10 w-10 rounded-lg border border-emerald-500/30 bg-white/5 text-lg text-white hover:bg-white/10"
              aria-label="Increase guests"
            >
              +
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
          <span className="text-xs text-gray-500">Quick set:</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPaxSafe(p)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                pax === p
                  ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4 print:hidden">
          <div className="text-sm text-gray-400">
            Prepared{" "}
            <span className="font-semibold text-emerald-200">
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`rounded-lg px-3 py-2 text-sm ${
                editMode
                  ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              {editMode ? "Done editing" : "Edit amounts"}
            </button>
            <button
              onClick={() => setChecked({})}
              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
            >
              Reset ticks
            </button>
            <button
              onClick={copyList}
              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
            >
              Copy list
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-100 ring-1 ring-emerald-400/40 hover:bg-emerald-500/30"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 print:border print:border-gray-300 print:bg-white"
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-300 print:text-black">
              {cat.title}
            </h3>
            <ul className="space-y-1.5">
              {cat.items.map((item) => {
                const isChecked = !!checked[item.id];
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5 print:hover:bg-transparent"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(item.id)}
                      className="h-4 w-4 shrink-0 accent-emerald-500"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        isChecked
                          ? "text-gray-500 line-through print:text-gray-500"
                          : "text-gray-200 print:text-black"
                      }`}
                    >
                      {item.name}
                      {item.hint && (
                        <span className="ml-1 text-[11px] text-gray-500">({item.hint})</span>
                      )}
                    </span>

                    {editMode && item.per10 !== undefined ? (
                      <input
                        type="text"
                        value={overrides[item.id] ?? amounts[item.id]?.display ?? ""}
                        onChange={(e) =>
                          setOverrides((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="w-28 rounded border border-amber-400/40 bg-black/40 px-2 py-1 text-right text-sm text-amber-100 outline-none"
                      />
                    ) : (
                      <span
                        className={`shrink-0 text-right text-sm font-semibold ${
                          item.note ? "text-gray-400 print:text-gray-600" : "text-emerald-200 print:text-black"
                        }`}
                      >
                        {amountFor(item)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="px-1 text-xs text-gray-600 print:text-gray-500">
        Baseline quantities are from kitchen experience for {BASE_PAX} guests. Some groups eat more, some less.
      </p>
    </section>
  );
}
