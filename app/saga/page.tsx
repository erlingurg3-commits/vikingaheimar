import type { Metadata } from "next";
import SagaPageClient from "./SagaPageClient";

export const metadata: Metadata = {
  title: "The Saga | Vikingaheimar",
  description:
    "The story of the Islendingur — a full-scale Viking longship that crossed the Atlantic. Discover the voyage, the ship, and the artifacts.",
  alternates: { canonical: "/saga" },
  openGraph: {
    title: "The Saga | Vikingaheimar",
    description:
      "The story of the Islendingur — a full-scale Viking longship that crossed the Atlantic.",
    url: "/saga",
    images: [
      {
        url: "/ship.jpg",
        width: 1200,
        height: 630,
        alt: "The Saga of Vikingaheimar",
      },
    ],
  },
};

export default function SagaPage() {
  return <SagaPageClient />;
}
