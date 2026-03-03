"use client";

import { useMemo, useState } from "react";
import AgencyConcentrationCard from "@/components/control-room/AgencyConcentrationCard";
import BookingVelocityTrendCard from "@/components/control-room/BookingVelocityTrendCard";
import ExplanationPanel from "@/components/control-room/ExplanationPanel";
import GuestFlowCard from "@/components/control-room/GuestFlowCard";
import RevenueVsTargetCard from "@/components/control-room/RevenueVsTargetCard";
import TopStrip from "@/components/control-room/TopStrip";
import UpcomingCruisesGroupsCard from "@/components/control-room/UpcomingCruisesGroupsCard";
import WeightedPipelineCoverageCard from "@/components/control-room/WeightedPipelineCoverageCard";
import {
  calculateCoverageRatio,
  calculateGuestFlowMetrics,
  calculateRevenueMetrics,
  calculateTopAgency,
  calculateVelocityChange,
} from "@/components/control-room/calculations";
import { formatCompactCurrency, formatPercent } from "@/components/control-room/format";
import type { ExplanationPayload, ExplanationType } from "@/components/control-room/types";
import {
  getControlRoomPeriodData,
  getControlRoomPeriodOptions,
  type ControlRoomPeriodData,
} from "@/lib/control-room/mockData";

const CACHE_MS = 24 * 60 * 60 * 1000;

function toPeriodKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function resolveDefaultPeriod() {
  const options = getControlRoomPeriodOptions();
  const now = new Date();
  const currentKey = toPeriodKey(now.getFullYear(), now.getMonth() + 1);
  const found = options.find((option) => option.key === currentKey);

  if (found) {
    return found;
  }

  return options[0];
}

type CachedExplanation = {
  timestamp: number;
  payload: ExplanationPayload;
};

function buildExplanation(type: ExplanationType, data: ControlRoomPeriodData): ExplanationPayload {
  const revenue = calculateRevenueMetrics(data.revenue);
  const remainingTarget = Math.max(data.revenue.targetRevenue - data.revenue.confirmedRevenue, 0);
  const coverageRatio = calculateCoverageRatio(data.revenue.targetRevenue, data.revenue.confirmedRevenue, revenue.weightedPipeline);
  const velocity = calculateVelocityChange(data.bookingVelocity);
  const topAgency = calculateTopAgency(data.agencyShares);

  if (type === "revenue") {
    return {
      title: "Revenue Deviation",
      summary: `Projected revenue is ${formatPercent(revenue.varianceRatio)} against target due to slower-than-plan conversion in higher-value pipeline segments.`,
      drivers: [
        "Confirmed revenue progression is behind pacing for this point in the month.",
        "Two largest pending opportunities remain below 60% conversion probability.",
        "Near-term cruise mix is weighted toward lower-yield bookings.",
      ],
      visuals: [
        {
          label: "Projected",
          value: formatCompactCurrency(revenue.projectedRevenue),
          baseline: formatCompactCurrency(data.revenue.targetRevenue),
        },
        {
          label: "Weighted pipeline",
          value: formatCompactCurrency(revenue.weightedPipeline),
          baseline: formatCompactCurrency(remainingTarget),
        },
      ],
    };
  }

  if (type === "pipeline") {
    return {
      title: "Pipeline Coverage Risk",
      summary: `Current weighted coverage is ${formatPercent(coverageRatio)}, leaving limited buffer to close remaining target in-period.`,
      drivers: [
        "Remaining target is concentrated in a small set of high-value opportunities.",
        "Mid-probability opportunities represent most of the weighted value.",
        "Recent booking momentum has not yet translated into late-stage pipeline lift.",
      ],
      visuals: [
        {
          label: "Coverage",
          value: formatPercent(coverageRatio),
          baseline: "80.0%",
        },
        {
          label: "Remaining target",
          value: formatCompactCurrency(remainingTarget),
          baseline: formatCompactCurrency(data.revenue.targetRevenue),
        },
      ],
    };
  }

  if (type === "velocity") {
    return {
      title: "Booking Velocity Risk",
      summary: `Last 7-day booking value is ${formatPercent(velocity.ratio)} versus the prior 7-day window.`,
      drivers: [
        "Average daily booking size declined across the recent week.",
        "Pending group confirmations shifted outside the current 7-day window.",
        "Cruise-linked upsell volume eased relative to prior week levels.",
      ],
      visuals: [
        {
          label: "Last 7 days",
          value: formatCompactCurrency(velocity.lastTotal),
          baseline: formatCompactCurrency(velocity.previousTotal),
        },
        {
          label: "Delta",
          value: formatPercent(velocity.ratio),
          baseline: "0.0%",
        },
      ],
    };
  }

  return {
    title: "Agency Concentration",
    summary: `${topAgency?.agency ?? "Top agency"} currently accounts for ${formatPercent(topAgency?.share ?? 0)}, indicating elevated channel concentration.`,
    drivers: [
      "Top agency share expanded over the trailing 30 days.",
      "Secondary agencies are contributing smaller incremental growth.",
      "Recent high-yield bookings are clustered in one partner channel.",
    ],
    visuals: [
      {
        label: "Top agency share",
        value: formatPercent(topAgency?.share ?? 0),
        baseline: "38.0%",
      },
      {
        label: "Top agency trend",
        value: formatPercent(topAgency?.trendDelta30d ?? 0),
        baseline: "0.0%",
      },
    ],
  };
}

export default function ControlRoomDeck() {
  const defaultPeriod = resolveDefaultPeriod();
  const [year, setYear] = useState(defaultPeriod.year);
  const [month, setMonth] = useState(defaultPeriod.month);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTitle, setPanelTitle] = useState("Explanation");
  const [panelPayload, setPanelPayload] = useState<ExplanationPayload | null>(null);

  const periodOptions = useMemo(() => getControlRoomPeriodOptions(), []);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(periodOptions.map((option) => option.year))).sort((left, right) => right - left);
  }, [periodOptions]);

  const monthOptions = useMemo(() => {
    return periodOptions
      .filter((option) => option.year === year)
      .map((option) => option.month)
      .sort((left, right) => left - right);
  }, [periodOptions, year]);

  const safeMonth = monthOptions.includes(month) ? month : monthOptions[0];

  const periodKey = toPeriodKey(year, safeMonth);
  const data = useMemo(() => getControlRoomPeriodData(periodKey), [periodKey]);

  const revenue = useMemo(() => calculateRevenueMetrics(data.revenue), [data.revenue]);
  const remainingTarget = Math.max(data.revenue.targetRevenue - data.revenue.confirmedRevenue, 0);
  const coverageRatio = useMemo(
    () => calculateCoverageRatio(data.revenue.targetRevenue, data.revenue.confirmedRevenue, revenue.weightedPipeline),
    [data.revenue.targetRevenue, data.revenue.confirmedRevenue, revenue.weightedPipeline],
  );
  const velocity = useMemo(() => calculateVelocityChange(data.bookingVelocity), [data.bookingVelocity]);
  const guestFlow = useMemo(() => calculateGuestFlowMetrics(data.guestFlowNext7Days), [data.guestFlowNext7Days]);
  const topAgency = useMemo(() => calculateTopAgency(data.agencyShares), [data.agencyShares]);

  const upcomingRows = useMemo(() => {
    const minGroupPax = 60;
    const cruises = data.upcomingCruiseDays.slice(0, 5);
    const groups = data.upcomingGroupArrivals.filter((entry) => entry.pax > minGroupPax).slice(0, 5);

    return [...cruises, ...groups].sort((left, right) => left.isoDate.localeCompare(right.isoDate));
  }, [data.upcomingCruiseDays, data.upcomingGroupArrivals]);

  function openExplanation(type: ExplanationType) {
    const cacheKey = `control-room:explain:${periodKey}:${type}`;
    const now = Date.now();

    let payload: ExplanationPayload | null = null;

    if (typeof window !== "undefined") {
      const cachedText = window.localStorage.getItem(cacheKey);
      if (cachedText) {
        try {
          const cached = JSON.parse(cachedText) as CachedExplanation;
          if (now - cached.timestamp < CACHE_MS) {
            payload = cached.payload;
          }
        } catch {
          payload = null;
        }
      }
    }

    if (!payload) {
      payload = buildExplanation(type, data);
      if (typeof window !== "undefined") {
        const toCache: CachedExplanation = { timestamp: now, payload };
        window.localStorage.setItem(cacheKey, JSON.stringify(toCache));
      }
    }

    setPanelTitle(payload.title);
    setPanelPayload(payload);
    setPanelOpen(true);
  }

  return (
    <div className="text-cyan-50/90 transition-opacity duration-300">
      <div className="mx-auto flex h-[calc(100vh-15rem)] min-h-[680px] max-w-7xl flex-col gap-3">
        <TopStrip
          selectedMonth={safeMonth}
          selectedYear={year}
          monthOptions={monthOptions}
          yearOptions={yearOptions}
          lastUpdatedIso={data.lastUpdatedIso}
          onMonthChange={setMonth}
          onYearChange={(nextYear) => {
            setYear(nextYear);
            const candidateMonth = getControlRoomPeriodOptions().find((option) => option.year === nextYear)?.month;
            if (candidateMonth) {
              setMonth(candidateMonth);
            }
          }}
        />

        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-3 lg:grid-rows-2">
          <RevenueVsTargetCard
            targetRevenue={data.revenue.targetRevenue}
            confirmedRevenue={data.revenue.confirmedRevenue}
            projectedRevenue={revenue.projectedRevenue}
            varianceRatio={revenue.varianceRatio}
            status={revenue.status}
            trend={data.revenue.projectionTrend}
            onExplain={() => openExplanation("revenue")}
          />

          <WeightedPipelineCoverageCard
            weightedPipeline={revenue.weightedPipeline}
            remainingTarget={remainingTarget}
            coverageRatio={coverageRatio}
            onExplainRisk={() => openExplanation("pipeline")}
          />

          <BookingVelocityTrendCard
            lastTotal={velocity.lastTotal}
            previousTotal={velocity.previousTotal}
            changeRatio={velocity.ratio}
            trend={data.bookingVelocity.last7Days}
            onExplain={() => openExplanation("velocity")}
          />

          <GuestFlowCard
            totalGuests={guestFlow.totalGuests}
            averageCapacityRatio={guestFlow.averageCapacityRatio}
            peakDayIso={guestFlow.peakDay.isoDate}
            peakGuests={guestFlow.peakDay.guests}
            lowestDayIso={guestFlow.lowestDay.isoDate}
            lowestGuests={guestFlow.lowestDay.guests}
            hasCapacityPressure={guestFlow.hasCapacityPressure}
          />

          <UpcomingCruisesGroupsCard rows={upcomingRows} />

          <AgencyConcentrationCard
            agencies={data.agencyShares.slice(0, 5)}
            topShare={topAgency?.share ?? 0}
            onExplain={() => openExplanation("agency")}
          />
        </div>
      </div>

      <ExplanationPanel open={panelOpen} title={panelTitle} payload={panelPayload} onClose={() => setPanelOpen(false)} />

      {panelOpen ? <button type="button" className="fixed inset-0 z-[1090] bg-black/25" aria-label="Close panel" onClick={() => setPanelOpen(false)} /> : null}
    </div>
  );
}
