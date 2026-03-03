import { supabaseAdmin } from "@/lib/supabase-admin";

type CruiseIntelligenceRow = {
  id: string;
  source: string;
  source_ref: string;
  eta: string;
  etd: string | null;
  berth: string | null;
  status: string;
  pax_estimate: number | null;
  vessel_name_raw: string;
  cruise_line: string | null;
  ports: {
    id: string;
    code: string;
    name: string;
  } | null;
  vessels: {
    id: string;
    name: string;
    cruise_line: string | null;
    imo: string | null;
  } | null;
  opportunities:
    | {
        id: string;
        score: number;
        score_reasons: string[];
        recommended_action: string | null;
      }
    | {
        id: string;
        score: number;
        score_reasons: string[];
        recommended_action: string | null;
      }[]
    | null;
};

function toRange(value: string | null): number {
  const parsed = Number.parseInt(value ?? "90", 10);
  if (!Number.isFinite(parsed)) {
    return 90;
  }

  return Math.min(365, Math.max(1, parsed));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rangeDays = toRange(url.searchParams.get("range"));

    const now = new Date();
    const end = new Date(now.getTime() + rangeDays * 24 * 60 * 60 * 1000);

    const { data, error } = await supabaseAdmin
      .from("port_calls")
      .select(
        "id, source, source_ref, eta, etd, berth, status, pax_estimate, vessel_name_raw, cruise_line, ports(id, code, name), vessels(id, name, cruise_line, imo), opportunities(id, score, score_reasons, recommended_action)"
      )
      .gte("eta", now.toISOString())
      .lte("eta", end.toISOString())
      .order("eta", { ascending: true })
      .limit(1000);

    if (error) {
      return Response.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        ok: true,
        rows: ((data ?? []) as unknown) as CruiseIntelligenceRow[],
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
