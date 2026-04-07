import type { Metadata } from "next";
import VisitPageClient from "./VisitPageClient";

export const metadata: Metadata = {
  title: "Visit | Víkingaheimar",
  description:
    "10 minutes from KEF Airport. Plan your visit to Víkingaheimar — hours, directions, transport, and layover planning.",
  alternates: { canonical: "/visit" },
  openGraph: {
    title: "Visit | Víkingaheimar",
    description:
      "10 minutes from KEF Airport. Plan your visit to Víkingaheimar.",
    url: "/visit",
    images: [
      {
        url: "/ship.jpg",
        width: 1200,
        height: 630,
        alt: "Visit Víkingaheimar",
      },
    ],
  },
};

export default function VisitPage() {
  return <VisitPageClient />;
}
