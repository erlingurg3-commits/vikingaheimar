export type ExplanationType = "revenue" | "pipeline" | "velocity" | "agency";

export type ExplanationPayload = {
  title: string;
  summary: string;
  drivers: string[];
  visuals: {
    label: string;
    value: string;
    baseline: string;
  }[];
};
