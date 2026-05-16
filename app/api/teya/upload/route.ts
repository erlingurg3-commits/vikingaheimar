import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface TeyaRow {
  mid: string;
  contract_id: string | null;
  contract_name: string | null;
  settlement_date: string;
  currency: string | null;
  status: string | null;
  sales: number;
  refunds: number;
  chargebacks: number;
  fees: number;
  transferred: number;
  net_amount: number;
}

const ICELANDIC_TO_DB: Record<string, string> = {
  "MID": "mid",
  "Auðkenni samnings": "contract_id",
  "Heiti samnings": "contract_name",
  "Uppgjörsdagsetning": "settlement_date",
  "Uppgjörsmynt": "currency",
  "Staða uppgjörs": "status",
  "Sala": "sales",
  "Endurgreiðslur": "refunds",
  "Endurkröfur": "chargebacks",
  "Gjöld": "fees",
  "Millifært": "transferred",
  "Heildarupphæð": "net_amount",
};

const NUMERIC_FIELDS = new Set([
  "sales", "refunds", "chargebacks", "fees", "transferred", "net_amount",
]);

function parseISKAmount(val: string): number {
  const cleaned = val.replace(/\./g, "").replace(/,/g, "").replace(/\s/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

function parseSettlementDate(val: string): string | null {
  // DD.MM.YYYY → YYYY-MM-DD
  const dotParts = val.split(".");
  if (dotParts.length === 3) {
    const [d, m, y] = dotParts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  return null;
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file field in form data" }, { status: 400 });

  const raw = await file.text();
  const text = raw.startsWith("﻿") ? raw.slice(1) : raw;

  const lines = text.split(/\r?\n/);

  // Find first non-empty line as header
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return Response.json({ error: "Empty file" }, { status: 400 });

  const headerLine = lines[headerIdx];
  const delimiter = headerLine.includes(";") ? ";" : ",";
  const headers = headerLine.split(delimiter).map((h) => h.replace(/^["']|["']$/g, "").trim());

  const rows: TeyaRow[] = [];
  const errors: string[] = [];
  let skipped = 0;

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = line.split(delimiter).map((v) => v.replace(/^["']|["']$/g, "").trim());
    if (values.length !== headers.length) {
      errors.push(`Line ${i + 1}: expected ${headers.length} columns, got ${values.length}`);
      skipped++;
      continue;
    }

    const rawRow: Record<string, string> = {};
    headers.forEach((h, idx) => { rawRow[h] = values[idx]; });

    const row: Partial<TeyaRow> = {
      sales: 0, refunds: 0, chargebacks: 0, fees: 0, transferred: 0, net_amount: 0,
    };
    let valid = true;

    for (const [csvCol, dbCol] of Object.entries(ICELANDIC_TO_DB)) {
      const val = rawRow[csvCol] ?? "";

      if (dbCol === "mid") {
        if (!val) { valid = false; break; }
        row.mid = val;
      } else if (dbCol === "settlement_date") {
        const date = parseSettlementDate(val);
        if (!date) {
          errors.push(`Line ${i + 1}: unrecognised date format "${val}"`);
          valid = false;
          break;
        }
        row.settlement_date = date;
      } else if (NUMERIC_FIELDS.has(dbCol)) {
        (row as Record<string, number>)[dbCol] = parseISKAmount(val);
      } else {
        (row as Record<string, string | null>)[dbCol] = val || null;
      }
    }

    if (!valid || !row.mid || !row.settlement_date) {
      skipped++;
      continue;
    }

    rows.push(row as TeyaRow);
  }

  if (rows.length === 0) {
    return Response.json({ imported: 0, skipped, errors });
  }

  const { error: dbError } = await supabaseAdmin
    .from("teya_settlements")
    .upsert(rows, { onConflict: "mid,settlement_date" });

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 });
  }

  return Response.json({ imported: rows.length, skipped, errors });
}
