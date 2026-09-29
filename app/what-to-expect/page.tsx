import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WhatToExpectClient from "./WhatToExpectClient";

export const metadata: Metadata = {
  title: "What to Expect | Víkingaheimar",
  description:
    "Questions you'll leave answered — a taste of the stories waiting inside Víkingaheimar.",
  alternates: { canonical: "/what-to-expect" },
  robots: { index: false, follow: false },
};

// Flip to true to bring the page back. While false the route returns 404 so
// the page is not reachable, and it is hidden from the nav in Header.tsx.
// The client component is kept intact.
const PUBLISHED = false;

export default function Page() {
  if (!PUBLISHED) notFound();

  return <WhatToExpectClient />;
}
