import type { Metadata } from "next";
import VikingsPageClient from "./VikingsPageClient";

export const metadata: Metadata = {
  title: "The Vikings | Víkingaheimar",
  description:
    "Not raiders. Not myths. The most far-ranging civilization the medieval world ever produced. Discover the real Vikings at Víkingaheimar.",
  alternates: { canonical: "/vikings" },
  openGraph: {
    title: "The Vikings | Víkingaheimar",
    description:
      "Not raiders. Not myths. The most far-ranging civilization the medieval world ever produced.",
    url: "/vikings",
    images: [
      { url: "/viking.jpg", width: 1200, height: 630, alt: "The Vikings at Víkingaheimar" },
    ],
  },
};

export default function VikingsPage() {
  return <VikingsPageClient />;
}
