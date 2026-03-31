import type { Metadata } from "next";
import ProvisionsPageClient from "./ProvisionsPageClient";

export const metadata: Metadata = {
  title: "Provisions | Vikingaheimar",
  description: "Feast before you sail. Explore the museum cafe, gift shop, and nearby Reykjanesbaer attractions.",
  alternates: { canonical: "/provisions" },
  openGraph: {
    title: "Provisions | Vikingaheimar",
    description: "Feast before you sail. Explore the museum cafe, gift shop, and nearby attractions.",
    url: "/provisions",
    images: [{ url: "/ship.jpg", width: 1200, height: 630, alt: "Provisions at Vikingaheimar" }],
  },
};

export default function ProvisionsPage() {
  return <ProvisionsPageClient />;
}
