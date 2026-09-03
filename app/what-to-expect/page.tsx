import type { Metadata } from "next";
import WhatToExpectClient from "./WhatToExpectClient";

export const metadata: Metadata = {
  title: "What to Expect | Víkingaheimar",
  description:
    "Questions you'll leave answered — a taste of the stories waiting inside Víkingaheimar.",
  alternates: { canonical: "/what-to-expect" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <WhatToExpectClient />;
}
