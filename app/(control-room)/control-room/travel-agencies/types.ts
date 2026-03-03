export type TravelAgencyRow = {
  id: string;
  created_at: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  revenue_ytd: number;
  pax_ytd: number;
  bookings: number;
  last_activity: string | null;
  status: "Active" | "Pipeline" | "Dormant";
};
