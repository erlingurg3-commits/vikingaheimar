import type { AgencyShare, BookingVelocitySnapshot, GuestFlowDay, RevenueSnapshot } from "@/lib/control-room/mockData";

export const THRESHOLDS = {
  revenueDrift: -0.08,
  revenuePressure: -0.15,
  revenuePerformance: 0.06,
  pipelineCoverageRisk: 0.8,
  velocityDrop: -0.18,
  guestFlowPeakCapacity: 0.92,
  agencyConcentrationRisk: 0.38,
} as const;

export type RevenueStatus = "neutral" | "drift" | "pressure" | "performance";

export function calculateWeightedPipeline(snapshot: RevenueSnapshot): number {
  return snapshot.pipeline.reduce((total, item) => total + item.revenue * item.probability, 0);
}

export function calculateRevenueMetrics(snapshot: RevenueSnapshot) {
  const weightedPipeline = calculateWeightedPipeline(snapshot);
  const projectedRevenue = snapshot.confirmedRevenue + weightedPipeline;
  const varianceRatio = snapshot.targetRevenue === 0 ? 0 : (projectedRevenue - snapshot.targetRevenue) / snapshot.targetRevenue;

  let status: RevenueStatus = "neutral";
  if (varianceRatio <= THRESHOLDS.revenuePressure) {
    status = "pressure";
  } else if (varianceRatio <= THRESHOLDS.revenueDrift) {
    status = "drift";
  } else if (varianceRatio >= THRESHOLDS.revenuePerformance) {
    status = "performance";
  }

  return {
    weightedPipeline,
    projectedRevenue,
    varianceRatio,
    status,
  };
}

export function calculateCoverageRatio(targetRevenue: number, confirmedRevenue: number, weightedPipeline: number): number {
  const remainingTarget = Math.max(targetRevenue - confirmedRevenue, 0);
  if (remainingTarget === 0) {
    return 1;
  }

  return weightedPipeline / remainingTarget;
}

export function calculateVelocityChange(snapshot: BookingVelocitySnapshot): { lastTotal: number; previousTotal: number; ratio: number } {
  const lastTotal = snapshot.last7Days.reduce((sum, value) => sum + value, 0);
  const previousTotal = snapshot.previous7Days.reduce((sum, value) => sum + value, 0);
  const ratio = previousTotal === 0 ? 0 : (lastTotal - previousTotal) / previousTotal;

  return { lastTotal, previousTotal, ratio };
}

export function calculateGuestFlowMetrics(days: GuestFlowDay[]) {
  const totalGuests = days.reduce((sum, day) => sum + day.guests, 0);
  const totalCapacity = days.reduce((sum, day) => sum + day.capacity, 0);
  const averageCapacityRatio = totalCapacity === 0 ? 0 : totalGuests / totalCapacity;

  const peakDay = days.reduce((peak, day) => (day.guests > peak.guests ? day : peak), days[0]);
  const lowestDay = days.reduce((lowest, day) => (day.guests < lowest.guests ? day : lowest), days[0]);

  const hasCapacityPressure = days.some((day) => day.capacity > 0 && day.guests / day.capacity > THRESHOLDS.guestFlowPeakCapacity);

  return {
    totalGuests,
    averageCapacityRatio,
    peakDay,
    lowestDay,
    hasCapacityPressure,
  };
}

export function calculateTopAgency(agencies: AgencyShare[]): AgencyShare | null {
  if (agencies.length === 0) {
    return null;
  }

  return agencies.reduce((top, agency) => (agency.share > top.share ? agency : top), agencies[0]);
}
