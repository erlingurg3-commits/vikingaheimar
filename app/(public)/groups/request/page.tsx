"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/app/components/primitives/Container";
import Button from "@/app/components/primitives/Button";
import Input from "@/app/components/primitives/Input";
import { SectionTitle, Body } from "@/app/components/primitives/Typography";
import { PUBLIC_HOURLY_SLOTS } from "@/lib/capacity/checkGroupFeasibility";
import { supabaseBrowser } from "@/lib/supabase-browser";

type TravelAgencyOption = {
  id: string;
  company_name: string;
};

type CapacitySlot = {
  time: string;
  remaining: number;
  canFit: boolean;
};

type CapacityPayload = {
  slots: CapacitySlot[];
};

type GroupRequestPayload = {
  requestId: string;
  outcome: "pending_admin_review" | "suggested_alternatives" | "approved_mock_booking";
  suggestedTimes: string[];
  preferredVisitTime: string;
  mockBookingId?: string | null;
  message?: string;
};

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function GroupRequestPage() {
  const [agencies, setAgencies] = useState<TravelAgencyOption[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [agentCompany, setAgentCompany] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [groupSize, setGroupSize] = useState("20");
  const [notes, setNotes] = useState("");

  const [slots, setSlots] = useState<CapacitySlot[]>(
    PUBLIC_HOURLY_SLOTS.map((time) => ({ time, remaining: 50, canFit: true }))
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [requestId, setRequestId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submittedVisitTime, setSubmittedVisitTime] = useState("");
  const [state, setState] = useState<"form" | "submitted" | "suggestions">("form");
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);

  const parsedGroupSize = useMemo(() => {
    const parsed = Number(groupSize);
    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.floor(parsed);
  }, [groupSize]);

  useEffect(() => {
    setVisitDate(toDateKey(new Date()));
  }, []);

  useEffect(() => {
    const loadAgencies = async () => {
      const { data } = await supabaseBrowser
        .from("travel_agencies")
        .select("id, company_name")
        .order("company_name", { ascending: true })
        .limit(500);

      setAgencies((data ?? []) as TravelAgencyOption[]);
    };

    void loadAgencies();
  }, []);

  useEffect(() => {
    if (!selectedAgencyId) {
      return;
    }

    const selected = agencies.find((agency) => agency.id === selectedAgencyId);
    if (selected) {
      setAgentCompany(selected.company_name);
    }
  }, [agencies, selectedAgencyId]);

  useEffect(() => {
    if (!visitDate || parsedGroupSize < 1) {
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);

      try {
        const query = new URLSearchParams({
          visit_date: visitDate,
          group_size: String(parsedGroupSize),
        });

        const response = await fetch(`/api/groups/request?${query.toString()}`);
        const payload = (await response.json()) as CapacityPayload;

        if (response.ok && Array.isArray(payload.slots)) {
          setSlots(payload.slots);
        }
      } catch {
        setSlots(PUBLIC_HOURLY_SLOTS.map((time) => ({ time, remaining: 50, canFit: true })));
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [visitDate, parsedGroupSize]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!agentCompany.trim() || !agentName.trim() || !agentEmail.trim() || !visitDate || !visitTime) {
      setError("Please complete all required fields.");
      return;
    }

    if (parsedGroupSize < 1 || parsedGroupSize > 500) {
      setError("Group size must be between 1 and 500.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/groups/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: selectedAgencyId || undefined,
          agent_company: agentCompany,
          agent_name: agentName,
          agent_email: agentEmail,
          visit_date: visitDate,
          visit_time: visitTime,
          group_size: parsedGroupSize,
          notes,
          mock_instant_booking: true,
        }),
      });

      const payload = (await response.json()) as GroupRequestPayload;

      if (!response.ok) {
        setError(payload.message ?? "Unable to submit request.");
        return;
      }

      setRequestId(payload.requestId);
      setBookingId(payload.mockBookingId ?? null);
      setSubmittedVisitTime(visitTime);

      setSelectedAgencyId("");
      setAgentCompany("");
      setAgentName("");
      setAgentEmail("");
      setVisitTime("");
      setGroupSize("20");
      setNotes("");

      if (payload.outcome === "pending_admin_review") {
        setState("submitted");
        setSuggestedTimes([]);
      } else if (payload.outcome === "approved_mock_booking") {
        setState("submitted");
        setSuggestedTimes([]);
      } else {
        setState("suggestions");
        setSuggestedTimes(payload.suggestedTimes ?? []);
      }
    } catch {
      setError("Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickSuggestion = async (time: string) => {
    if (!requestId) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/groups/request", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          selected_visit_time: time,
        }),
      });

      const payload = (await response.json()) as GroupRequestPayload;

      if (response.ok && payload.outcome === "pending_admin_review") {
        setVisitTime(time);
        setState("submitted");
        setSuggestedTimes([]);
        return;
      }

      setSuggestedTimes(payload.suggestedTimes ?? []);
      setState("suggestions");
      setError(payload.message ?? "Selected time is no longer available.");
    } catch {
      setError("Unable to confirm selected alternative.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full py-20 bg-gradient-to-b from-base-charcoal to-neutral-950">
      <Container size="lg" className="space-y-8">
        <SectionTitle
          overline="Travel Agency Portal"
          title="Group Booking Request"
          subtitle="Request a time slot for your group. We'll confirm availability instantly."
        />

        {state === "submitted" ? (
          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-3">
            <p className="text-sm uppercase tracking-[0.15em] text-emerald-300">Request Submitted</p>
            <h2 className="text-2xl font-semibold text-white">Request received. Our team will confirm shortly.</h2>
            <Body className="text-emerald-100">Reference ID: <span className="font-semibold">{requestId}</span></Body>
            <Body className="text-emerald-100">Requested time: {submittedVisitTime}</Body>
            {bookingId ? (
              <Body className="text-emerald-100">
                Mock booking created: <span className="font-semibold">{bookingId}</span>
              </Body>
            ) : null}
          </section>
        ) : null}

        {state === "suggestions" ? (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 space-y-4">
            <p className="text-sm uppercase tracking-[0.15em] text-amber-300">Availability Result</p>
            <h2 className="text-2xl font-semibold text-white">Requested time is not available. Suggested alternatives:</h2>
            <Body className="text-amber-100">Reference ID: {requestId}</Body>
            <div className="flex flex-wrap gap-2">
              {suggestedTimes.length === 0 ? (
                <p className="text-sm text-amber-100">No alternatives currently fit this group size.</p>
              ) : (
                suggestedTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    disabled={submitting}
                    onClick={() => handlePickSuggestion(time)}
                    className="rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-60"
                  >
                    {time}
                  </button>
                ))
              )}
            </div>
          </section>
        ) : null}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="agency-select" className="block text-sm font-medium text-off-white">
              Select Agency (optional)
            </label>
            <select
              id="agency-select"
              value={selectedAgencyId}
              onChange={(event) => setSelectedAgencyId(event.target.value)}
              className="w-full h-12 rounded-lg border border-neutral-700 bg-neutral-900/50 px-4 text-off-white focus-visible:outline-none focus-visible:border-accent-frost-blue"
            >
              <option value="">Use manual company entry</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Agency Company" value={agentCompany} onChange={(event) => setAgentCompany(event.target.value)} required />
            <Input label="Contact Name" value={agentName} onChange={(event) => setAgentName(event.target.value)} required />
            <Input label="Agent Email" type="email" value={agentEmail} onChange={(event) => setAgentEmail(event.target.value)} required />
            <Input label="Visit Date" type="date" value={visitDate} min={toDateKey(new Date())} onChange={(event) => setVisitDate(event.target.value)} required />
          </div>

          <Input
            label="Group Size"
            type="number"
            min={1}
            max={500}
            value={groupSize}
            onChange={(event) => setGroupSize(event.target.value)}
            required
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-off-white">Preferred Time</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {slots.map((slot) => {
                const selected = visitTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.canFit}
                    aria-pressed={selected}
                    onClick={() => setVisitTime(slot.time)}
                    className={`h-14 rounded-lg border px-3 py-2 text-sm transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 ${
                      selected
                        ? "border-emerald-300 bg-emerald-500/25 text-emerald-50 shadow-[0_0_14px_rgba(74,222,128,0.25)]"
                        : slot.canFit
                          ? "border-white/20 bg-black/20 text-gray-100 hover:border-emerald-400/70 hover:bg-emerald-500/10"
                          : "border-red-500/30 bg-red-950/20 text-red-300 cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                    <span className="block text-[10px] text-gray-400">{slot.remaining} left</span>
                  </button>
                );
              })}
            </div>
            {loadingSlots ? <p className="text-xs text-gray-400">Checking live capacity…</p> : null}
          </div>

          <div>
            <label htmlFor="group-request-notes-v2" className="block text-sm font-medium text-off-white mb-2">
              Notes (optional)
            </label>
            <textarea
              id="group-request-notes-v2"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full min-h-28 px-4 py-3 rounded-lg bg-neutral-900/50 border-2 border-neutral-700 text-off-white placeholder-neutral-500 focus-visible:outline-none focus-visible:border-accent-frost-blue focus-visible:ring-1 focus-visible:ring-accent-frost-blue/30"
            />
          </div>

          {error ? <p className="text-sm text-status-error">{error}</p> : null}

          <Button variant="primary" size="lg" type="submit" isLoading={submitting}>
            Submit Group Request
          </Button>
        </form>
      </Container>
    </main>
  );
}
