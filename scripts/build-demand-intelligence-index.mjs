import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const dataDir = path.join(rootDir, "control-room-v2", "data", "demand-intelligence");
const outputPath = path.join(dataDir, "runs.json");

const ignoredFiles = new Set([
  "demand-intelligence.schema.json",
  "example-run.request.json",
  "runs.json",
]);

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function toRunRecord(fileName, payload) {
  const dailySummary = Array.isArray(payload.daily_summary) ? payload.daily_summary : [];

  return {
    filename: fileName,
    path: `control-room-v2/data/demand-intelligence/${fileName}`,
    // is_latest marks the file the UI prefers first, not merely the newest archive.
    is_latest: fileName === "latest-signals.json",
    generated_at: typeof payload.generated_at === "string" ? payload.generated_at : null,
    date_range:
      payload.date_range && typeof payload.date_range === "object"
        ? {
            start: payload.date_range.start ?? null,
            end: payload.date_range.end ?? null,
          }
        : { start: null, end: null },
    signal_count: Array.isArray(payload.signals) ? payload.signals.length : 0,
    high_alert_days: dailySummary.filter((day) => day.high_alert_day === true).length,
    watch_days: dailySummary.filter((day) => day.alert_level === "watch").length,
    normal_days: dailySummary.filter((day) => day.alert_level === "normal").length,
  };
}

function sortRunsDesc(left, right) {
  const leftDate = left.generated_at ?? "";
  const rightDate = right.generated_at ?? "";
  return rightDate.localeCompare(leftDate) || left.filename.localeCompare(right.filename);
}

const entries = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : [];

const runs = entries
  .filter((fileName) => fileName.endsWith(".json") && !ignoredFiles.has(fileName))
  .map((fileName) => ({ fileName, payload: readJson(path.join(dataDir, fileName)) }))
  .filter((entry) => entry.payload && typeof entry.payload === "object")
  .map((entry) => toRunRecord(entry.fileName, entry.payload))
  .sort(sortRunsDesc);

const manifest = {
  generated_at: new Date().toISOString(),
  run_count: runs.length,
  runs,
};

fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Wrote ${runs.length} demand intelligence run(s) to ${outputPath}`);