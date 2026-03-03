import type { Metadata } from "next";
import GroupsPageClient from "@/app/components/groups/GroupsPageClient";

export const metadata: Metadata = {
  title: "Groups",
  description:
    "Plan tailored group and school experiences at Víkingaheimar with dedicated support.",
  alternates: {
    canonical: "/groups",
  },
  openGraph: {
    title: "Groups | Víkingaheimar",
    description:
      "Plan tailored group and school experiences at Víkingaheimar with dedicated support.",
    url: "/groups",
    images: [{ url: "/viking.jpg", width: 1200, height: 630, alt: "Group experiences at Víkingaheimar" }],
  },
};

export default function GroupsPage() {
  return <GroupsPageClient />;
}
