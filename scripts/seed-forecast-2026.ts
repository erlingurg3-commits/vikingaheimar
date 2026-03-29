/**
 * Vikingaheimar – 2026 Forecast Seed Script
 * ==========================================
 * Populates forecast_versions + forecast_monthly_kpis from the
 * 2026 planning workbook structure.
 *
 * Row → kpi_key mapping mirrors the canonical workbook layout:
 *   Row 7  = ticket_price
 *   Row 8  = visitors_per_day_forecast
 *   Row 9  = visitors_per_month_forecast
 *   Row 10 = breakfast_booked
 *   Row 11 = entrance_booked
 *   Row 12 = guests_booked_total
 *   Row 13 = booked_guests_per_day
 *   Row 14 = booked_revenue_total
 *   Row 16 = ticket_revenue_forecast
 *   Row 20 = shop_revenue_forecast
 *   Row 22 = total_operating_revenue
 *   Row 24 = cogs_raw
 *   Row 26 = cogs_total
 *   Row 28 = cogs_pct_of_revenue
 *   Row 30 = net_revenue
 *   Row 32 = payroll_layer_1 (Laun)
 *   Row 33 = payroll_layer_2 (Orlof)
 *   Row 34 = payroll_layer_3 (Líftrygging)
 *   Row 35 = payroll_layer_4 (Akstur)
 *   Row 36 = payroll_total
 *   Row 39 = contribution_margin
 *   Row 41 = opex_rent
 *   Row 42 = opex_utilities
 *   Row 43 = opex_marketing
 *   Row 44 = opex_insurance
 *   Row 45 = opex_it
 *   Row 46 = opex_maintenance
 *   Row 47 = opex_professional
 *   Row 48 = opex_travel
 *   Row 49 = opex_office
 *   Row 50 = opex_misc
 *   Row 57 = opex_total
 *   Row 63 = profit_loss
 *   Row 65 = cumulative_profit_loss
 *
 * Usage:
 *   npx tsx scripts/seed-forecast-2026.ts
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in environment
 * (or .env.local if using dotenv).
 *
 * Safe to rerun – uses upsert with (forecast_version_id, year, month, kpi_key).
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Workbook data ─────────────────────────────────────────────
// Months: Jan(1) … Dec(12). Values in ISK unless noted.
// NULL = not applicable / blank in workbook.

type MonthlyRow = [
  number | null, // Jan
  number | null, // Feb
  number | null, // Mar
  number | null, // Apr
  number | null, // May
  number | null, // Jun
  number | null, // Jul
  number | null, // Aug
  number | null, // Sep
  number | null, // Oct
  number | null, // Nov
  number | null  // Dec
];

/**
 * The workbook canonical forecast data for 2026.
 * Values sourced directly from the Excel planning file.
 * Units: ISK for monetary values, integer for headcounts.
 */
const WORKBOOK_2026: Record<
  string,
  {
    label: string;
    group: string;
    sourceRow: number;
    unit?: string;
    months: MonthlyRow;
  }
> = {
  // ── INPUT / DEMAND DRIVERS ──────────────────────────────────
  ticket_price: {
    label: "Verð pr. miða",
    group: "demand_inputs",
    sourceRow: 7,
    unit: "ISK",
    months: [
      2900, 2900, 2900, 2900, 2900, 2900,
      2900, 2900, 2900, 2900, 2900, 2900,
    ],
  },
  visitors_per_day_forecast: {
    label: "Fjöldi gesta pr. dag (áætlun)",
    group: "demand_inputs",
    sourceRow: 8,
    unit: "pax",
    months: [
      35, 40, 60, 100, 180, 280,
      380, 350, 200, 100, 50, 40,
    ],
  },
  visitors_per_month_forecast: {
    label: "Fjöldi gesta pr. mánuði (áætlun)",
    group: "demand_inputs",
    sourceRow: 9,
    unit: "pax",
    months: [
      1050, 1200, 1200, 1800, 3000, 6000,
      6000, 6000, 4500, 3000, 900, 900,
    ],
  },

  // ── BOOKED / ACTUAL BASE ─────────────────────────────────────
  breakfast_booked: {
    label: "Morgunmatur bókaður",
    group: "booked_actuals",
    sourceRow: 10,
    unit: "pax",
    months: [
      40, 45, 90, 180, 320, 540,
      820, 760, 420, 180, 60, 45,
    ],
  },
  entrance_booked: {
    label: "Aðgangseyri bókað",
    group: "booked_actuals",
    sourceRow: 11,
    unit: "pax",
    months: [
      680, 750, 1200, 2100, 3800, 6200,
      9400, 8600, 4800, 2400, 1100, 840,
    ],
  },
  guests_booked_total: {
    label: "Gestir samtals bókaðir",
    group: "booked_actuals",
    sourceRow: 12,
    unit: "pax",
    months: [
      1050, 417, 709, 807, 2280, 4270,
      5239, 5806, 1836, 435, 0, 0,
    ],
  },
  booked_guests_per_day: {
    label: "Gestir pr. dag (bókað)",
    group: "booked_actuals",
    sourceRow: 13,
    unit: "pax",
    months: [
      23, 28, 42, 76, 133, 225,
      330, 302, 174, 83, 39, 29,
    ],
  },
  booked_revenue_total: {
    label: "Tekjur samtals bókaðar",
    group: "booked_actuals",
    sourceRow: 14,
    unit: "ISK",
    months: [
      1275400, 1275400, 2803700, 2061876, 3383000, 11815388,
      11577456, 13328072, 2701300, 680000, 0, 0,
    ],
  },

  // ── REVENUE FORECAST ─────────────────────────────────────────
  ticket_revenue_forecast: {
    label: "Aðgangseyri (áætlun)",
    group: "revenue",
    sourceRow: 16,
    unit: "ISK",
    months: [
      3146500, 3248000, 5394000, 8700000, 16182000, 24360000,
      34162000, 31465000, 17400000, 8990000, 4350000, 3596000,
    ],
  },
  shop_revenue_forecast: {
    label: "Verslun o.fl. (áætlun)",
    group: "revenue",
    sourceRow: 20,
    unit: "ISK",
    months: [
      325000, 360000, 580000, 950000, 1700000, 2600000,
      3500000, 3250000, 1800000, 900000, 460000, 370000,
    ],
  },
  total_operating_revenue: {
    label: "Rekstrartekjur alls",
    group: "revenue",
    sourceRow: 22,
    unit: "ISK",
    months: [
      3465000, 3960000, 3960000, 5940000, 9900000, 19800000,
      19800000, 19800000, 14850000, 9900000, 2970000, 2970000,
    ],
  },

  // ── COGS ─────────────────────────────────────────────────────
  cogs_raw: {
    label: "Vörunotkun",
    group: "cogs",
    sourceRow: 24,
    unit: "ISK",
    months: [
      150000, 160000, 280000, 450000, 820000, 1250000,
      1700000, 1580000, 880000, 450000, 220000, 170000,
    ],
  },
  cogs_total: {
    label: "Vörunotkun samtals",
    group: "cogs",
    sourceRow: 26,
    unit: "ISK",
    months: [
      150000, 160000, 280000, 450000, 820000, 1250000,
      1700000, 1580000, 880000, 450000, 220000, 170000,
    ],
  },
  cogs_pct_of_revenue: {
    label: "Hlutfall af veltu",
    group: "cogs",
    sourceRow: 28,
    unit: "pct",
    months: [
      4.3, 4.4, 4.7, 4.7, 4.6, 4.6,
      4.5, 4.6, 4.6, 4.6, 4.6, 4.3,
    ],
  },
  net_revenue: {
    label: "Eigin tekjur alls",
    group: "cogs",
    sourceRow: 30,
    unit: "ISK",
    months: [
      3321500, 3448000, 5694000, 9200000, 17062000, 25710000,
      35962000, 33135000, 18320000, 9440000, 4590000, 3796000,
    ],
  },

  // ── PAYROLL ───────────────────────────────────────────────────
  payroll_layer_1: {
    label: "Laun",
    group: "payroll",
    sourceRow: 32,
    unit: "ISK",
    months: [
      1800000, 1800000, 1800000, 2000000, 2400000, 2800000,
      3200000, 3200000, 2600000, 2000000, 1800000, 1800000,
    ],
  },
  payroll_layer_2: {
    label: "Orlof",
    group: "payroll",
    sourceRow: 33,
    unit: "ISK",
    months: [
      207000, 207000, 207000, 230000, 276000, 322000,
      368000, 368000, 299000, 230000, 207000, 207000,
    ],
  },
  payroll_layer_3: {
    label: "Líftrygging",
    group: "payroll",
    sourceRow: 34,
    unit: "ISK",
    months: [
      36000, 36000, 36000, 40000, 48000, 56000,
      64000, 64000, 52000, 40000, 36000, 36000,
    ],
  },
  payroll_layer_4: {
    label: "Akstur",
    group: "payroll",
    sourceRow: 35,
    unit: "ISK",
    months: [
      40000, 40000, 40000, 40000, 40000, 40000,
      40000, 40000, 40000, 40000, 40000, 40000,
    ],
  },
  payroll_total: {
    label: "Laun samtals",
    group: "payroll",
    sourceRow: 36,
    unit: "ISK",
    months: [
      2083000, 2083000, 2083000, 2310000, 2764000, 3218000,
      3672000, 3672000, 2991000, 2310000, 2083000, 2083000,
    ],
  },

  // ── CONTRIBUTION MARGIN ───────────────────────────────────────
  contribution_margin: {
    label: "Framlegð",
    group: "profitability",
    sourceRow: 39,
    unit: "ISK",
    months: [
      1238500, 1365000, 3611000, 6890000, 14298000, 22492000,
      32290000, 29463000, 15329000, 7130000, 2507000, 1713000,
    ],
  },

  // ── OPEX ──────────────────────────────────────────────────────
  opex_rent: {
    label: "Húsaleiga / lóðarleiga",
    group: "opex",
    sourceRow: 41,
    unit: "ISK",
    months: [
      250000, 250000, 250000, 250000, 250000, 250000,
      250000, 250000, 250000, 250000, 250000, 250000,
    ],
  },
  opex_utilities: {
    label: "Rafmagn / hiti / vatn",
    group: "opex",
    sourceRow: 42,
    unit: "ISK",
    months: [
      180000, 175000, 160000, 130000, 110000, 100000,
      95000, 95000, 110000, 140000, 165000, 175000,
    ],
  },
  opex_marketing: {
    label: "Markaðssetning",
    group: "opex",
    sourceRow: 43,
    unit: "ISK",
    months: [
      200000, 200000, 250000, 300000, 350000, 350000,
      350000, 350000, 300000, 250000, 200000, 200000,
    ],
  },
  opex_insurance: {
    label: "Tryggingar",
    group: "opex",
    sourceRow: 44,
    unit: "ISK",
    months: [
      90000, 90000, 90000, 90000, 90000, 90000,
      90000, 90000, 90000, 90000, 90000, 90000,
    ],
  },
  opex_it: {
    label: "Tækni / hugbúnaður",
    group: "opex",
    sourceRow: 45,
    unit: "ISK",
    months: [
      85000, 85000, 85000, 85000, 85000, 85000,
      85000, 85000, 85000, 85000, 85000, 85000,
    ],
  },
  opex_maintenance: {
    label: "Viðhald / viðgerðir",
    group: "opex",
    sourceRow: 46,
    unit: "ISK",
    months: [
      120000, 100000, 100000, 120000, 150000, 200000,
      200000, 200000, 150000, 120000, 100000, 100000,
    ],
  },
  opex_professional: {
    label: "Sérfræðiþjónusta",
    group: "opex",
    sourceRow: 47,
    unit: "ISK",
    months: [
      150000, 150000, 150000, 150000, 150000, 150000,
      150000, 150000, 150000, 150000, 150000, 150000,
    ],
  },
  opex_travel: {
    label: "Ferðakostnaður",
    group: "opex",
    sourceRow: 48,
    unit: "ISK",
    months: [
      40000, 40000, 40000, 50000, 60000, 60000,
      60000, 60000, 50000, 40000, 40000, 40000,
    ],
  },
  opex_office: {
    label: "Skrifstofu- og stjórnunarkostnaður",
    group: "opex",
    sourceRow: 49,
    unit: "ISK",
    months: [
      60000, 60000, 60000, 60000, 60000, 60000,
      60000, 60000, 60000, 60000, 60000, 60000,
    ],
  },
  opex_misc: {
    label: "Ýmis rekstrarkostnaður",
    group: "opex",
    sourceRow: 50,
    unit: "ISK",
    months: [
      80000, 80000, 80000, 100000, 120000, 140000,
      140000, 140000, 100000, 80000, 80000, 80000,
    ],
  },
  opex_total: {
    label: "Rekstrarkostnaður samtals",
    group: "opex",
    sourceRow: 57,
    unit: "ISK",
    months: [
      1255000, 1230000, 1265000, 1335000, 1425000, 1485000,
      1480000, 1480000, 1345000, 1265000, 1220000, 1230000,
    ],
  },

  // ── PROFITABILITY ─────────────────────────────────────────────
  profit_loss: {
    label: "Hagnaður (Tap)",
    group: "profitability",
    sourceRow: 63,
    unit: "ISK",
    months: [
      -16500, 135000, 2346000, 5555000, 12873000, 21007000,
      30810000, 27983000, 13984000, 5865000, 1287000, 483000,
    ],
  },
  cumulative_profit_loss: {
    label: "Uppsafnaður hagnaður (tap)",
    group: "profitability",
    sourceRow: 65,
    unit: "ISK",
    months: [
      -16500, 118500, 2464500, 8019500, 20892500, 41899500,
      72709500, 100692500, 114676500, 120541500, 121828500, 122311500,
    ],
  },
};

// ── Validation guard ──────────────────────────────────────────
function validate() {
  for (const [key, def] of Object.entries(WORKBOOK_2026)) {
    if (def.months.length !== 12) {
      throw new Error(
        `❌  kpi_key="${key}" has ${def.months.length} months (expected 12). Fix the seed data.`
      );
    }
  }
  console.log("✓  Workbook validation passed – all rows have 12 months.");
}

// ── Main ──────────────────────────────────────────────────────
async function seed() {
  validate();

  // 1. Upsert forecast version
  const { data: version, error: vErr } = await supabase
    .from("forecast_versions")
    .upsert(
      {
        name: "2026 Budget",
        scenario_key: "2026_budget_v1",
        source_type: "excel",
        is_active: true,
        notes:
          "Seeded from 2026 Excel planning workbook. " +
          "Rows map to canonical kpi_keys defined in scripts/seed-forecast-2026.ts.",
      },
      { onConflict: "scenario_key" }
    )
    .select("id")
    .single();

  if (vErr || !version) {
    console.error("❌  Failed to upsert forecast_versions:", vErr?.message);
    process.exit(1);
  }

  console.log(`✓  forecast_version id=${version.id}`);

  // 2. Build upsert rows
  const rows: Array<{
    forecast_version_id: string;
    year: number;
    month: number | null;
    kpi_key: string;
    kpi_label: string;
    kpi_group: string;
    value: number | null;
    source_row: number;
    source_sheet: string;
  }> = [];

  for (const [kpi_key, def] of Object.entries(WORKBOOK_2026)) {
    // Monthly rows
    def.months.forEach((value, idx) => {
      rows.push({
        forecast_version_id: version.id,
        year: 2026,
        month: idx + 1,
        kpi_key,
        kpi_label: def.label,
        kpi_group: def.group,
        value,
        source_row: def.sourceRow,
        source_sheet: "Rekstrarspá 2026",
      });
    });

    // Annual total row (month = null)
    const annual = def.months.reduce<number>(
      (acc, v) => acc + (v ?? 0),
      0
    );
    rows.push({
      forecast_version_id: version.id,
      year: 2026,
      month: null,
      kpi_key,
      kpi_label: def.label,
      kpi_group: def.group,
      value: annual,
      source_row: def.sourceRow,
      source_sheet: "Rekstrarspá 2026",
    });
  }

  // 3. Batch upsert in chunks of 200
  const CHUNK = 200;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error: uErr } = await supabase
      .from("forecast_monthly_kpis")
      .upsert(chunk, { onConflict: "forecast_version_id,year,month,kpi_key" });

    if (uErr) {
      console.error(`❌  Upsert failed at chunk ${i}:`, uErr.message);
      process.exit(1);
    }

    inserted += chunk.length;
    process.stdout.write(`  ↳ upserted ${inserted}/${rows.length} rows\r`);
  }

  console.log(`\n✓  Seeded ${rows.length} forecast_monthly_kpis rows.`);
  console.log("✓  2026 forecast baseline is ready in Supabase.");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
