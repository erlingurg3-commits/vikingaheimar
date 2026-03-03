export type Confidence = "low" | "medium" | "high";

export type SuggestionSource =
  | "exact_vessel_match"
  | "cruise_line_match"
  | "port_match"
  | "manual_override"
  | "none";

export type LeadStatus =
  | "unassigned"
  | "researching"
  | "to_contact"
  | "contacted"
  | "in_talks"
  | "proposal_sent"
  | "won"
  | "lost"
  | "not_a_fit"
  | "do_not_contact";

export type ActivityType = "note" | "email" | "call" | "meeting" | "task" | "status_change";

export type CruiseCRMListRow = {
  cruise_call_id: string;
  vessel_id: string;
  source: string;
  source_ref: string;
  port_name: string;
  vessel_name: string;
  cruise_line: string | null;
  eta: string;
  etd: string | null;
  pax_estimate: number | null;
  cruise_call_status: string;
  season_year: number;
  opportunity_score: number | null;
  lead_id: string | null;
  lead_status: LeadStatus | null;
  owner_user_id: string | null;
  handler_override: boolean;
  suggestion_source: SuggestionSource;
  resolved_travel_agency_id: string | null;
  resolved_travel_agency_name: string | null;
  mapping_confidence: Confidence | null;
  handler_confidence: Confidence | null;
  value_estimate_isk: number | null;
  probability: number | null;
  primary_contact_id: string | null;
  primary_contact_name: string | null;
  primary_contact_role: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  next_follow_up_at: string | null;
  last_activity_summary: string | null;
  last_activity_at: string | null;
};

export type CruiseLead = {
  id: string;
  cruise_call_id: string;
  season_year: number;
  travel_agency_id: string | null;
  handler_confidence: Confidence;
  handler_override: boolean;
  suggestion_source: SuggestionSource;
  lead_status: LeadStatus;
  owner_user_id: string | null;
  value_estimate_isk: number | null;
  expected_pax: number | null;
  probability: number | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  tags: string[];
};

export type CruiseActivity = {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  summary: string;
  detail: string | null;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
};

export type CruiseTask = {
  id: string;
  lead_id: string;
  title: string;
  due_at: string | null;
  status: "open" | "done" | "canceled";
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
};

export type TravelAgency = {
  id: string;
  company_name: string;
};

export type TravelAgencyContact = {
  id: string;
  travel_agency_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  notes: string | null;
};

export const LEAD_STATUSES: LeadStatus[] = [
  "unassigned",
  "researching",
  "to_contact",
  "contacted",
  "in_talks",
  "proposal_sent",
  "won",
  "lost",
  "not_a_fit",
  "do_not_contact",
];

export const CONFIDENCE_LEVELS: Confidence[] = ["low", "medium", "high"];