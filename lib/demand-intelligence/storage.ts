import fs from "fs/promises";
import path from "path";

import type { DemandRunDiff, DemandRunSummary } from "@/app/control-room-v2/types/intelligence";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { DemandFile } from "@/lib/demand-intelligence/types";

const DATA_DIR = path.join(process.cwd(), "control-room-v2", "data", "demand-intelligence");
const LATEST_FILE_NAME = "latest-signals.json";
const RUN_INDEX_FILE_NAME = "runs.json";
const LATEST_RELATIVE_PATH = `control-room-v2/data/demand-intelligence/${LATEST_FILE_NAME}`;
const NON_DATA_FILES = new Set([
  "demand-intelligence.schema.json",
  "example-run.request.json",
  RUN_INDEX_FILE_NAME,
]);

type StoredDemandRun = {
  fileName: string;
  path: string;
  isLatest: boolean;
  file: DemandFile;
};

type DemandRunRow = {
  filename?: string | null;
  path?: string | null;
  is_latest?: boolean | null;
  generated_at?: string | null;
  range_start?: string | null;
  range_end?: string | null;
  signal_count?: number | null;
  high_alert_days?: number | null;
  watch_days?: number | null;
  normal_days?: number | null;
  payload?: DemandFile | null;
};

type RunIndexDocument = {
  generated_at: string;
  run_count: number;
  runs: Array<{
    filename: string;
    path: string;
    is_latest: boolean;
    generated_at: string | null;
    date_range: {
      start: string | null;
      end: string | null;
    };
    signal_count: number;
    high_alert_days: number;
    watch_days: number;
    normal_days: number;
  }>;
};

const DEMAND_RUN_SELECT = [
  "filename",
  "path",
  "is_latest",
  "generated_at",
  "range_start",
  "range_end",
  "signal_count",
  "high_alert_days",
  "watch_days",
  "normal_days",
  "payload",
].join(", ");

function hasSupabaseDemandStorage() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function toInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

function isDemandFile(input: unknown): input is DemandFile {
  if (!input || typeof input !== "object") {
    return false;
  }

  const candidate = input as Partial<DemandFile>;
  return (
    typeof candidate.generated_at === "string" &&
    typeof candidate.date_range?.start === "string" &&
    typeof candidate.date_range?.end === "string" &&
    Array.isArray(candidate.signals) &&
    Array.isArray(candidate.daily_summary)
  );
}

function toRunSummary(row: DemandRunRow): DemandRunSummary | null {
  if (!row.filename || !row.path) {
    return null;
  }

  return {
    filename: row.filename,
    path: row.path,
    isLatest: row.is_latest === true,
    generatedAt: row.generated_at ?? null,
    dateRange: {
      start: row.range_start ?? null,
      end: row.range_end ?? null,
    },
    signalCount: toInt(row.signal_count),
    highAlertDays: toInt(row.high_alert_days),
    watchDays: toInt(row.watch_days),
    normalDays: toInt(row.normal_days),
  };
}

function buildLatestDiff(runs: DemandRunSummary[]): DemandRunDiff | null {
  if (runs.length < 2) {
    return null;
  }

  const [newer, older] = runs;
  return {
    newerFile: newer.filename,
    olderFile: older.filename,
    newerGeneratedAt: newer.generatedAt,
    olderGeneratedAt: older.generatedAt,
    signalCountDelta: newer.signalCount - older.signalCount,
    highAlertDaysDelta: newer.highAlertDays - older.highAlertDays,
    watchDaysDelta: newer.watchDays - older.watchDays,
    normalDaysDelta: newer.normalDays - older.normalDays,
    dateRangeChanged:
      newer.dateRange.start !== older.dateRange.start || newer.dateRange.end !== older.dateRange.end,
  };
}

function summarizeDemandFile(fileName: string, relativePath: string, file: DemandFile, isLatest: boolean): DemandRunSummary {
  const highAlertDays = file.daily_summary.filter((row) => row.alert_level === "high-alert").length;
  const watchDays = file.daily_summary.filter((row) => row.alert_level === "watch").length;
  const normalDays = file.daily_summary.filter((row) => row.alert_level === "normal").length;

  return {
    filename: fileName,
    path: relativePath,
    isLatest,
    generatedAt: file.generated_at,
    dateRange: {
      start: file.date_range.start,
      end: file.date_range.end,
    },
    signalCount: file.signals.length,
    highAlertDays,
    watchDays,
    normalDays,
  };
}

async function tryReadDemandFile(filePath: string): Promise<DemandFile | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isDemandFile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function loadLatestFromFiles(): Promise<StoredDemandRun | null> {
  const latestPath = path.join(DATA_DIR, LATEST_FILE_NAME);
  const latest = await tryReadDemandFile(latestPath);
  if (latest) {
    return {
      fileName: LATEST_FILE_NAME,
      path: LATEST_RELATIVE_PATH,
      isLatest: true,
      file: latest,
    };
  }

  try {
    const entries = await fs.readdir(DATA_DIR);
    const runs = await Promise.all(
      entries
        .filter((entry) => entry.endsWith(".json") && !NON_DATA_FILES.has(entry))
        .map(async (entry) => {
          const file = await tryReadDemandFile(path.join(DATA_DIR, entry));
          if (!file) {
            return null;
          }

          return {
            fileName: entry,
            path: `control-room-v2/data/demand-intelligence/${entry}`,
            isLatest: entry === LATEST_FILE_NAME,
            file,
          } satisfies StoredDemandRun;
        })
    );

    return runs
      .filter((run): run is StoredDemandRun => run !== null)
      .sort((left, right) => right.file.generated_at.localeCompare(left.file.generated_at))[0] ?? null;
  } catch {
    return null;
  }
}

async function loadRunIndexFromFiles(): Promise<{
  recentRuns: DemandRunSummary[];
  latestRunDiff: DemandRunDiff | null;
}> {
  try {
    const entries = await fs.readdir(DATA_DIR);
    const runs = await Promise.all(
      entries
        .filter((entry) => entry.endsWith(".json") && !NON_DATA_FILES.has(entry))
        .map(async (entry) => {
          const file = await tryReadDemandFile(path.join(DATA_DIR, entry));
          if (!file) {
            return null;
          }

          return summarizeDemandFile(
            entry,
            `control-room-v2/data/demand-intelligence/${entry}`,
            file,
            entry === LATEST_FILE_NAME
          );
        })
    );

    const recentRuns = runs
      .filter((run): run is DemandRunSummary => run !== null)
      .sort((left, right) => (right.generatedAt ?? "").localeCompare(left.generatedAt ?? ""));

    return {
      recentRuns,
      latestRunDiff: buildLatestDiff(recentRuns),
    };
  } catch {
    return {
      recentRuns: [],
      latestRunDiff: null,
    };
  }
}

async function writeRunIndexFile(recentRuns: DemandRunSummary[]) {
  const document: RunIndexDocument = {
    generated_at: new Date().toISOString(),
    run_count: recentRuns.length,
    runs: recentRuns.map((run) => ({
      filename: run.filename,
      path: run.path,
      is_latest: run.isLatest,
      generated_at: run.generatedAt,
      date_range: {
        start: run.dateRange.start,
        end: run.dateRange.end,
      },
      signal_count: run.signalCount,
      high_alert_days: run.highAlertDays,
      watch_days: run.watchDays,
      normal_days: run.normalDays,
    })),
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, RUN_INDEX_FILE_NAME), `${JSON.stringify(document, null, 2)}\n`, "utf8");
}

async function persistToFiles(file: DemandFile, archiveFileName: string) {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const archivePath = path.join(DATA_DIR, archiveFileName);
  const latestPath = path.join(DATA_DIR, LATEST_FILE_NAME);
  const serialized = `${JSON.stringify(file, null, 2)}\n`;

  await fs.writeFile(archivePath, serialized, "utf8");
  await fs.writeFile(latestPath, serialized, "utf8");

  const { recentRuns } = await loadRunIndexFromFiles();
  await writeRunIndexFile(recentRuns);
}

async function loadLatestFromSupabase(): Promise<StoredDemandRun | null> {
  if (!hasSupabaseDemandStorage()) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("demand_intelligence_runs")
      .select(DEMAND_RUN_SELECT)
      .eq("is_latest", true)
      .limit(1)
      .maybeSingle() as { data: Record<string, unknown> | null; error: unknown };

    if (error || !data || !isDemandFile(data.payload)) {
      return null;
    }

    return {
      fileName: (data.filename as string) ?? LATEST_FILE_NAME,
      path: (data.path as string) ?? LATEST_RELATIVE_PATH,
      isLatest: data.is_latest === true,
      file: data.payload as DemandFile,
    };
  } catch {
    return null;
  }
}

async function loadRunIndexFromSupabase(): Promise<{
  recentRuns: DemandRunSummary[];
  latestRunDiff: DemandRunDiff | null;
} | null> {
  if (!hasSupabaseDemandStorage()) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("demand_intelligence_runs")
      .select(DEMAND_RUN_SELECT)
      .order("generated_at", { ascending: false })
      .limit(20);

    if (error || !Array.isArray(data)) {
      return null;
    }

    const recentRuns = data.map((row) => toRunSummary(row as DemandRunRow)).filter((row): row is DemandRunSummary => row !== null);
    return {
      recentRuns,
      latestRunDiff: buildLatestDiff(recentRuns),
    };
  } catch {
    return null;
  }
}

async function persistToSupabase(file: DemandFile, archiveFileName: string) {
  const archivePath = `control-room-v2/data/demand-intelligence/${archiveFileName}`;
  const archiveSummary = summarizeDemandFile(archiveFileName, archivePath, file, false);
  const latestSummary = summarizeDemandFile(LATEST_FILE_NAME, LATEST_RELATIVE_PATH, file, true);

  await supabaseAdmin.from("demand_intelligence_runs").upsert(
    [
      {
        filename: archiveSummary.filename,
        path: archiveSummary.path,
        is_latest: false,
        generated_at: archiveSummary.generatedAt,
        range_start: archiveSummary.dateRange.start,
        range_end: archiveSummary.dateRange.end,
        signal_count: archiveSummary.signalCount,
        high_alert_days: archiveSummary.highAlertDays,
        watch_days: archiveSummary.watchDays,
        normal_days: archiveSummary.normalDays,
        payload: file,
      },
      {
        filename: latestSummary.filename,
        path: latestSummary.path,
        is_latest: true,
        generated_at: latestSummary.generatedAt,
        range_start: latestSummary.dateRange.start,
        range_end: latestSummary.dateRange.end,
        signal_count: latestSummary.signalCount,
        high_alert_days: latestSummary.highAlertDays,
        watch_days: latestSummary.watchDays,
        normal_days: latestSummary.normalDays,
        payload: file,
      },
    ],
    { onConflict: "path" }
  );
}

export async function loadLatestDemandIntelligenceRun(): Promise<StoredDemandRun | null> {
  return (await loadLatestFromSupabase()) ?? (await loadLatestFromFiles());
}

export async function loadDemandRunIndex(): Promise<{
  recentRuns: DemandRunSummary[];
  latestRunDiff: DemandRunDiff | null;
}> {
  return (await loadRunIndexFromSupabase()) ?? (await loadRunIndexFromFiles());
}

export async function saveDemandIntelligenceRun(file: DemandFile, archiveFileName: string): Promise<{
  storage: "supabase" | "file";
  archivePath: string;
  latestPath: string;
}> {
  let storedInSupabase = false;

  if (hasSupabaseDemandStorage()) {
    try {
      await persistToSupabase(file, archiveFileName);
      storedInSupabase = true;
    } catch {
      storedInSupabase = false;
    }
  }

  if (storedInSupabase) {
    await persistToFiles(file, archiveFileName).catch(() => undefined);
    return {
      storage: "supabase",
      archivePath: `control-room-v2/data/demand-intelligence/${archiveFileName}`,
      latestPath: LATEST_RELATIVE_PATH,
    };
  }

  await persistToFiles(file, archiveFileName);
  return {
    storage: "file",
    archivePath: `control-room-v2/data/demand-intelligence/${archiveFileName}`,
    latestPath: LATEST_RELATIVE_PATH,
  };
}