---
name: "Run Demand Intelligence"
description: "Run the Demand Intelligence Agent with explicit start_date, end_date, and output_path values, then save stable structured JSON for Control Room forecasting workflows."
argument-hint: "start_date=YYYY-MM-DD end_date=YYYY-MM-DD output_path=control-room-v2/data/demand-intelligence/file.json"
agent: "Demand Intelligence Agent"
---
Run the Demand Intelligence Agent with this execution contract.

## Required Inputs
- start_date: required, format `YYYY-MM-DD`
- end_date: required, format `YYYY-MM-DD`
- output_path: optional, relative repo path

## Default Output Path
- If `output_path` is not supplied, use:
  - `control-room-v2/data/demand-intelligence/latest-signals.json`

## Execution Rules
- Collect signals only for the inclusive range from `start_date` through `end_date`.
- Save the final JSON payload to `output_path`.
- After saving the final JSON payload, update `control-room-v2/data/demand-intelligence/runs.json` so the run is indexed.
- In `runs.json`, mark `is_latest: true` only for `control-room-v2/data/demand-intelligence/latest-signals.json`.
- Return only structured JSON in chat.
- Do not return narrative text unless explicitly requested.
- Keep the JSON schema stable and aligned with [control-room-v2/data/demand-intelligence/demand-intelligence.schema.json](../../control-room-v2/data/demand-intelligence/demand-intelligence.schema.json).
- Keep field names unchanged for future Control Room integration.
- If the supplied `output_path` is outside `control-room-v2/data/demand-intelligence/`, still save to the supplied path exactly as given.

## Input Object
Use this exact request shape when interpreting the run:

```json
{
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "output_path": "control-room-v2/data/demand-intelligence/latest-signals.json"
}
```

## Output Contract
- The response must be a single JSON object matching the schema file.
- The response must include `generated_at`, `date_range`, `signals`, and `daily_summary`.
- `date_range.start` must equal `start_date`.
- `date_range.end` must equal `end_date`.

## Example Run

```json
{
  "start_date": "2026-03-20",
  "end_date": "2026-03-27",
  "output_path": "control-room-v2/data/demand-intelligence/march-20-to-27.json"
}
```
