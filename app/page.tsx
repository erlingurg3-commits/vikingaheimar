import type { Metadata } from "next";
import HomePageClient from "@/app/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Step into authentic Viking heritage at Víkingaheimar in Reykjanesbær, Iceland.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Víkingaheimar",
    description:
      "Step into authentic Viking heritage at Víkingaheimar in Reykjanesbær, Iceland.",
    url: "/",
    images: [{ url: "/viking.jpg", width: 1200, height: 630, alt: "Víkingaheimar" }],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
