"use client";

// import { useState } from "react";
// import AIPanel from "@/app/components/dashboard/AIPanel";
// import NextHighDaySignalCard from "@/app/components/dashboard/NextHighDaySignalCard";
// import OpsWindow from "@/app/components/dashboard/OpsWindow";
// import BokunPanel from "@/app/components/dashboard/BokunPanel";
// import BookingAlerts from "@/app/components/controlroom/BookingAlerts";
// import AIBriefing from "@/app/components/controlroom/AIBriefing";
import MorningBriefing from "@/app/components/dashboard/MorningBriefing";

// const CONTROL_INTELLIGENCE_PROMPT = `You are Vikingaheimar Control Intelligence.
// Provide factual, concise, read-only operational analysis.
// Use bullet points where appropriate.
// Do not speculate or invent data.`;

export default function ControlRoomDashboard() {
  // const [aiResponse, setAiResponse] = useState("");
  // const [aiLoading, setAiLoading] = useState(false);

  // const handleAI = async (prompt: string) => {
  //   setAiLoading(true);
  //   setAiResponse("");

  //   const controller = new AbortController();
  //   const timeoutId = setTimeout(() => controller.abort(), 35_000);

  //   try {
  //     const response = await fetch("/api/control-intelligence", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       signal: controller.signal,
  //       body: JSON.stringify({
  //         mode: "summary",
  //         systemPrompt: CONTROL_INTELLIGENCE_PROMPT,
  //         userPrompt: prompt,
  //         dataBlocks: JSON.stringify({
  //           source: "control-room-overview-ai-panel",
  //         }),
  //       }),
  //     });

  //     let data: any = null;
  //     try {
  //       data = await response.json();
  //     } catch {
  //       data = null;
  //     }

  //     if (!response.ok) {
  //       setAiResponse(data?.message ?? `Request failed (${response.status})`);
  //       return;
  //     }

  //     setAiResponse(data?.success ? (data.response ?? "") : (data?.message ?? "Request failed"));
  //   } catch (error: unknown) {
  //     if (error instanceof Error && error.name === "AbortError") {
  //       setAiResponse("Request timed out. Please try again.");
  //     } else {
  //       setAiResponse("Unable to fetch AI response right now.");
  //     }
  //   } finally {
  //     clearTimeout(timeoutId);
  //     setAiLoading(false);
  //   }
  // };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <MorningBriefing />
    </div>
  );
}
