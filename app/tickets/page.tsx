import type { Metadata } from "next";
import TicketsConversionPage from "@/app/components/tickets/TicketsConversionPage";

export const metadata: Metadata = {
  title: "Tickets",
  description:
    "Book tickets for Víkingaheimar with clear options, inclusions, and practical answers before you visit.",
  alternates: {
    canonical: "/tickets",
  },
  openGraph: {
    title: "Tickets | Víkingaheimar",
    description:
      "Book tickets for Víkingaheimar with clear options, inclusions, and practical answers before you visit.",
    url: "/tickets",
    images: [{ url: "/viking.jpg", width: 1200, height: 630, alt: "Tickets for Víkingaheimar" }],
  },
};

export default function TicketsPage() {
  return <TicketsConversionPage />;
}
