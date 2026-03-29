import crypto from "crypto";

// ── Bokun HMAC-SHA1 Auth ──────────────────────────────────────────
const BASE_URL = "https://api.bokun.io";

function getCredentials() {
  const accessKey = process.env.BOKUN_ACCESS_KEY;
  const secretKey = process.env.BOKUN_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error("Missing BOKUN_ACCESS_KEY or BOKUN_SECRET_KEY");
  }
  return { accessKey, secretKey };
}

function bokunDate(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function sign(
  date: string,
  accessKey: string,
  secretKey: string,
  method: string,
  path: string
): string {
  const stringToSign = `${date}${accessKey}${method}${path}`;
  return crypto
    .createHmac("sha1", secretKey)
    .update(stringToSign)
    .digest("base64");
}

function authHeaders(method: string, path: string) {
  const { accessKey, secretKey } = getCredentials();
  const date = bokunDate();
  const signature = sign(date, accessKey, secretKey, method, path);
  return {
    "X-Bokun-AccessKey": accessKey,
    "X-Bokun-Date": date,
    "X-Bokun-Signature": signature,
    "Content-Type": "application/json",
  };
}

// ── Generic request helpers ───────────────────────────────────────

async function bokunGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: authHeaders("GET", path),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bokun GET ${path} → ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

async function bokunPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders("POST", path),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bokun POST ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────

export interface BokunBooking {
  id: number;
  parentBookingId: number;
  confirmationCode: string;
  productConfirmationCode: string;
  status: "CONFIRMED" | "CANCELLED" | "NO_SHOW" | string;
  channelId: string;
  channel: { id: number; title: string; channelType: string };
  product: { id: number; title: string };
  vendor: { id: number; title: string };
  seller: { id: number; title: string };
  agent: { id: number; title: string } | null;
  customer: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    nationality: string | null;
    phoneNumber: string | null;
    country: string | null;
  };
  creationDate: number;
  startDate: number;
  endDate: number;
  startDateTime: number;
  endDateTime: number;
  totalPrice: number;
  totalPriceAmount: number;
  currency: string;
  paidAmount: number;
  paidType: string;
  rateTitle: string;
  prepaid: boolean;
  cancellationDate: number | null;
  customerInvoice: {
    total: number;
    totalDue: number;
    totalDiscount: number;
    totalCommission: number;
    currency: string;
  };
  fields: {
    totalParticipants: number;
    rateId: number;
    rateTitle: string;
    priceCategoryBookings?: Array<{
      pricingCategoryId: number;
      pricingCategory: {
        id: number;
        title: string;
        ticketCategory: string;
        minAge: number;
        maxAge: number;
      };
      passengers: number;
    }>;
  };
}

export interface BokunSearchResult {
  tookInMillis: number;
  totalHits: number;
  query: { page: number; pageSize: number };
  results: BokunBooking[];
}

export interface BokunAvailability {
  id: string;
  activityId: number;
  activityTitle: string;
  date: number;
  localizedDate: string;
  availabilityCount: number;
  bookedParticipants: number;
  unlimitedAvailability: boolean;
  rates: Array<{
    id: number;
    title: string;
    pricingCategoryIds: number[];
  }>;
}

export interface ActiveIdsResponse {
  suppliers: Array<{ supplierId: number; activityIds: number[] }>;
}

// ── API methods ───────────────────────────────────────────────────

/** List all active activity IDs (returns supplier-grouped response) */
export async function getActiveActivityIds(): Promise<ActiveIdsResponse> {
  return bokunGet<ActiveIdsResponse>("/activity.json/active-ids");
}

/** Get full activity details by ID */
export async function getActivity(id: number) {
  return bokunGet(`/activity.json/${id}`);
}

/** Get upcoming N availabilities for an activity */
export async function getUpcomingAvailability(
  activityId: number,
  max: number = 30
): Promise<BokunAvailability[]> {
  return bokunGet(`/activity.json/${activityId}/upcoming-availabilities/${max}`);
}

/** Search product bookings — the main booking search endpoint */
export async function searchProductBookings(opts: {
  startDate?: { year: number; month: number; day: number };
  endDate?: { year: number; month: number; day: number };
  page?: number;
  pageSize?: number;
  statuses?: string[];
}): Promise<BokunSearchResult> {
  return bokunPost("/booking.json/product-booking-search", {
    page: opts.page ?? 1,
    pageSize: opts.pageSize ?? 50,
    ...opts,
  });
}

/**
 * Fetch ALL bookings in a date range, paginating automatically.
 * Respects the 400 req/min rate limit by yielding between pages.
 */
export async function fetchAllBookings(
  startDate: { year: number; month: number; day: number },
  endDate: { year: number; month: number; day: number },
  pageSize = 50
): Promise<BokunBooking[]> {
  const all: BokunBooking[] = [];
  let page = 1;

  while (true) {
    const result = await searchProductBookings({
      startDate,
      endDate,
      page,
      pageSize,
    });
    all.push(...result.results);

    if (all.length >= result.totalHits || result.results.length < pageSize) {
      break;
    }
    page++;
  }
  return all;
}

/** Get booking by confirmation code */
export async function getBooking(confirmationCode: string) {
  return bokunGet(`/booking.json/booking/${confirmationCode}`);
}

/** Quick connection test */
export async function testConnection() {
  const data = await getActiveActivityIds();
  const allIds = data.suppliers.flatMap((s) => s.activityIds);
  return { ok: true, totalActivities: allIds.length, suppliers: data.suppliers };
}
