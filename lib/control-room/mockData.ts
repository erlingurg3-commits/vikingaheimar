export type PipelineItem = {
  id: string;
  label: string;
  revenue: number;
  probability: number;
};

export type RevenueSnapshot = {
  targetRevenue: number;
  confirmedRevenue: number;
  pipeline: PipelineItem[];
  projectionTrend: number[];
};

export type BookingVelocitySnapshot = {
  last7Days: number[];
  previous7Days: number[];
};

export type GuestFlowDay = {
  isoDate: string;
  guests: number;
  capacity: number;
};

export type UpcomingEntry = {
  id: string;
  isoDate: string;
  source: "Cruise" | "Group";
  pax: number;
  revenue: number;
  status: "Confirmed" | "Pending";
};

export type AgencyShare = {
  id: string;
  agency: string;
  share: number;
  trendDelta30d: number;
  revenue: number;
};

export type ControlRoomPeriodData = {
  periodKey: string;
  lastUpdatedIso: string;
  revenue: RevenueSnapshot;
  bookingVelocity: BookingVelocitySnapshot;
  guestFlowNext7Days: GuestFlowDay[];
  upcomingCruiseDays: UpcomingEntry[];
  upcomingGroupArrivals: UpcomingEntry[];
  agencyShares: AgencyShare[];
};

const CONTROL_ROOM_DATA: Record<string, ControlRoomPeriodData> = {
  "2026-03": {
    periodKey: "2026-03",
    lastUpdatedIso: "2026-03-03T09:20:00.000Z",
    revenue: {
      targetRevenue: 19200000,
      confirmedRevenue: 15180000,
      pipeline: [
        { id: "p1", label: "Nordic Atlantic Group", revenue: 980000, probability: 0.65 },
        { id: "p2", label: "Aurora Partner Cluster", revenue: 1240000, probability: 0.52 },
        { id: "p3", label: "Icebound Corporate Week", revenue: 860000, probability: 0.4 },
        { id: "p4", label: "West Fjords Charter", revenue: 1180000, probability: 0.58 },
        { id: "p5", label: "Spring Agency Push", revenue: 760000, probability: 0.45 },
      ],
      projectionTrend: [13.7, 14.1, 14.4, 14.9, 15.3, 15.6, 15.8],
    },
    bookingVelocity: {
      last7Days: [188000, 204000, 219000, 211000, 196000, 232000, 245000],
      previous7Days: [229000, 241000, 248000, 257000, 236000, 262000, 276000],
    },
    guestFlowNext7Days: [
      { isoDate: "2026-03-04", guests: 842, capacity: 920 },
      { isoDate: "2026-03-05", guests: 881, capacity: 920 },
      { isoDate: "2026-03-06", guests: 896, capacity: 920 },
      { isoDate: "2026-03-07", guests: 861, capacity: 920 },
      { isoDate: "2026-03-08", guests: 744, capacity: 920 },
      { isoDate: "2026-03-09", guests: 812, capacity: 920 },
      { isoDate: "2026-03-10", guests: 903, capacity: 920 },
    ],
    upcomingCruiseDays: [
      { id: "c1", isoDate: "2026-03-06", source: "Cruise", pax: 264, revenue: 578000, status: "Confirmed" },
      { id: "c2", isoDate: "2026-03-08", source: "Cruise", pax: 318, revenue: 689000, status: "Confirmed" },
      { id: "c3", isoDate: "2026-03-12", source: "Cruise", pax: 289, revenue: 634000, status: "Pending" },
      { id: "c4", isoDate: "2026-03-14", source: "Cruise", pax: 336, revenue: 715000, status: "Confirmed" },
      { id: "c5", isoDate: "2026-03-17", source: "Cruise", pax: 301, revenue: 661000, status: "Pending" },
    ],
    upcomingGroupArrivals: [
      { id: "g1", isoDate: "2026-03-05", source: "Group", pax: 72, revenue: 148000, status: "Confirmed" },
      { id: "g2", isoDate: "2026-03-07", source: "Group", pax: 64, revenue: 131000, status: "Confirmed" },
      { id: "g3", isoDate: "2026-03-11", source: "Group", pax: 89, revenue: 192000, status: "Pending" },
      { id: "g4", isoDate: "2026-03-13", source: "Group", pax: 77, revenue: 165000, status: "Confirmed" },
      { id: "g5", isoDate: "2026-03-16", source: "Group", pax: 95, revenue: 206000, status: "Pending" },
    ],
    agencyShares: [
      { id: "a1", agency: "Nordic Expeditions", share: 0.41, trendDelta30d: 0.02, revenue: 1830000 },
      { id: "a2", agency: "Saga Journeys", share: 0.19, trendDelta30d: -0.01, revenue: 848000 },
      { id: "a3", agency: "Fjordline Partners", share: 0.14, trendDelta30d: 0.01, revenue: 627000 },
      { id: "a4", agency: "Aurora Collective", share: 0.11, trendDelta30d: 0, revenue: 495000 },
      { id: "a5", agency: "Atlantic Access", share: 0.08, trendDelta30d: -0.01, revenue: 362000 },
    ],
  },
  "2026-02": {
    periodKey: "2026-02",
    lastUpdatedIso: "2026-02-28T17:40:00.000Z",
    revenue: {
      targetRevenue: 17600000,
      confirmedRevenue: 14850000,
      pipeline: [
        { id: "fp1", label: "Winter Agencies", revenue: 620000, probability: 0.55 },
        { id: "fp2", label: "Late Cruise Wave", revenue: 910000, probability: 0.44 },
      ],
      projectionTrend: [13.8, 14.0, 14.2, 14.4, 14.7, 14.9, 15.2],
    },
    bookingVelocity: {
      last7Days: [201000, 194000, 209000, 216000, 224000, 218000, 232000],
      previous7Days: [189000, 198000, 202000, 208000, 212000, 205000, 221000],
    },
    guestFlowNext7Days: [
      { isoDate: "2026-02-22", guests: 751, capacity: 900 },
      { isoDate: "2026-02-23", guests: 789, capacity: 900 },
      { isoDate: "2026-02-24", guests: 804, capacity: 900 },
      { isoDate: "2026-02-25", guests: 771, capacity: 900 },
      { isoDate: "2026-02-26", guests: 738, capacity: 900 },
      { isoDate: "2026-02-27", guests: 812, capacity: 900 },
      { isoDate: "2026-02-28", guests: 845, capacity: 900 },
    ],
    upcomingCruiseDays: [
      { id: "fc1", isoDate: "2026-03-01", source: "Cruise", pax: 248, revenue: 541000, status: "Confirmed" },
      { id: "fc2", isoDate: "2026-03-03", source: "Cruise", pax: 272, revenue: 593000, status: "Pending" },
      { id: "fc3", isoDate: "2026-03-05", source: "Cruise", pax: 283, revenue: 617000, status: "Confirmed" },
      { id: "fc4", isoDate: "2026-03-07", source: "Cruise", pax: 296, revenue: 647000, status: "Pending" },
      { id: "fc5", isoDate: "2026-03-10", source: "Cruise", pax: 311, revenue: 682000, status: "Confirmed" },
    ],
    upcomingGroupArrivals: [
      { id: "fg1", isoDate: "2026-03-02", source: "Group", pax: 61, revenue: 124000, status: "Confirmed" },
      { id: "fg2", isoDate: "2026-03-04", source: "Group", pax: 66, revenue: 137000, status: "Pending" },
      { id: "fg3", isoDate: "2026-03-06", source: "Group", pax: 73, revenue: 151000, status: "Confirmed" },
      { id: "fg4", isoDate: "2026-03-08", source: "Group", pax: 80, revenue: 168000, status: "Pending" },
      { id: "fg5", isoDate: "2026-03-11", source: "Group", pax: 86, revenue: 179000, status: "Confirmed" },
    ],
    agencyShares: [
      { id: "fa1", agency: "Nordic Expeditions", share: 0.36, trendDelta30d: 0.01, revenue: 1590000 },
      { id: "fa2", agency: "Saga Journeys", share: 0.21, trendDelta30d: 0, revenue: 928000 },
      { id: "fa3", agency: "Fjordline Partners", share: 0.16, trendDelta30d: -0.01, revenue: 708000 },
      { id: "fa4", agency: "Aurora Collective", share: 0.13, trendDelta30d: 0.01, revenue: 576000 },
      { id: "fa5", agency: "Atlantic Access", share: 0.09, trendDelta30d: 0, revenue: 399000 },
    ],
  },
};

export type ControlRoomPeriodOption = {
  key: string;
  year: number;
  month: number;
};

export function getControlRoomPeriodOptions(): ControlRoomPeriodOption[] {
  return Object.keys(CONTROL_ROOM_DATA)
    .map((key) => {
      const [year, month] = key.split("-").map((value) => Number(value));
      return { key, year, month };
    })
    .sort((left, right) => right.key.localeCompare(left.key));
}

export function getControlRoomPeriodData(periodKey: string): ControlRoomPeriodData {
  const options = getControlRoomPeriodOptions();
  const defaultKey = options[0]?.key;

  if (!defaultKey) {
    throw new Error("No control room mock data available.");
  }

  return CONTROL_ROOM_DATA[periodKey] ?? CONTROL_ROOM_DATA[defaultKey];
}
