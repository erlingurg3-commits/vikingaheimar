import type { Metadata } from "next";
import RouteMapLoader from "@/app/booking/RouteMapLoader";

export const metadata: Metadata = {
  title: "Book Your Visit | Víkingaheimar",
  description:
    "Select a date and number of guests to reserve your Víkingaheimar museum experience.",
  alternates: { canonical: "/booking" },
  openGraph: {
    title: "Book Your Visit | Víkingaheimar",
    description:
      "Select a date and number of guests to reserve your Víkingaheimar museum experience.",
    url: "/booking",
  },
};

const included = [
  "Museum admission",
  "The Íslendingur longship exhibit",
  "Vikings of the North Atlantic exhibition",
  "The Settlement of Iceland exhibition",
  "WiFi",
  "Entry tax & fees included",
];

const accessibilityItems = [
  "Wheelchair accessible",
  "Stroller / pram accessible",
  "Infant seats available",
];

const info = [
  { label: "Hours (Summer)", value: "09:00–17:00" },
  { label: "Hours (Winter)", value: "10:00–16:00" },
  { label: "Children under 12", value: "FREE of charge in the company of adults" },
  { label: "Seniors / Students", value: "10% online discount applied — valid documentation required" },
  { label: "Location", value: "Víkingabraut 1, 260 Reykjanesbær — 10 min from Keflavík Airport" },
  { label: "Parking", value: "Free on site" },
];

/* ── Shared sub-components ── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-semibold text-neutral-900 pb-2 border-b-2 border-heritage-amber inline-block mb-5">
      {children}
    </h2>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="font-text text-sm leading-relaxed text-neutral-700 flex items-start gap-2.5"
        >
          <span
            className="text-heritage-amber shrink-0 mt-0.5 text-base"
            aria-hidden="true"
          >
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        {/* Page header — full-width centered */}
        <header className="mx-auto max-w-6xl text-center mb-12">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="Víkingaheimar"
              className="h-24 w-auto"
            />
          </div>
          <h1 className="font-display text-[clamp(32px,4vw,48px)] font-light text-neutral-900 leading-tight">
            Book Your Visit
          </h1>
        </header>

        {/* Two-column layout: booking widget left, map + overlay right */}
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-11 gap-10 lg:gap-12 items-start">

          {/* ── Left column: booking widget only (6/11 ≈ 55%) ── */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            {/* Bókun booking widget */}
            <div
              className="bokunWidget"
              data-src="https://widgets.bokun.io/online-sales/20a864e3-4bf8-45c4-864f-62c268deb95a/experience-calendar/775694"
              role="region"
              aria-label="Booking calendar widget"
            >
              <noscript>
                <p className="text-neutral-600 text-sm">
                  JavaScript is required to load the booking calendar. Please
                  enable JavaScript or{" "}
                  <a
                    href="https://widgets.bokun.io/online-sales/20a864e3-4bf8-45c4-864f-62c268deb95a/experience-calendar/775694"
                    className="underline text-heritage-amber"
                  >
                    book directly on our partner site
                  </a>.
                </p>
              </noscript>
            </div>
          </div>

          {/* ── Right column: map + layered info content (5/11 ≈ 45%) ── */}
          <div className="lg:col-span-5 order-1 lg:order-2 relative min-h-[600px] lg:sticky lg:top-16">
            {/* Info sections overlay — desktop only, sticky */}
            <div className="hidden lg:block absolute inset-0 z-20 flex items-start pointer-events-none">
              <div className="max-w-[420px] pl-8 pt-8 space-y-6 pointer-events-auto sticky top-16">
                {/* What's Included */}
                <section aria-labelledby="included-heading">
                  <SectionHeading>
                    <span id="included-heading">What&apos;s Included</span>
                  </SectionHeading>
                  <CheckList items={included} />
                </section>

                {/* Visitor Info */}
                <section aria-labelledby="info-heading">
                  <SectionHeading>
                    <span id="info-heading">Visitor Info</span>
                  </SectionHeading>
                  <dl className="space-y-2.5">
                    {info.map((item) => (
                      <div key={item.label} className="font-text text-sm leading-relaxed text-neutral-700">
                        <dt className="sr-only">{item.label}</dt>
                        <dd>
                          <span className="font-medium">{item.label}:</span>{" "}
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                {/* Accessibility */}
                <section aria-labelledby="accessibility-heading">
                  <SectionHeading>
                    <span id="accessibility-heading">Accessibility</span>
                  </SectionHeading>
                  <CheckList items={accessibilityItems} />
                </section>
              </div>
            </div>


            {/* Map background */}
            <div className="relative z-0">
              <RouteMapLoader />
            </div>

            {/* Info sections mobile stack */}
            <div className="lg:hidden space-y-12 mt-8">
              {/* What's Included */}
              <section aria-labelledby="included-heading">
                <SectionHeading>
                  <span id="included-heading">What&apos;s Included</span>
                </SectionHeading>
                <CheckList items={included} />
              </section>

              {/* Visitor Info */}
              <section aria-labelledby="info-heading">
                <SectionHeading>
                  <span id="info-heading">Visitor Info</span>
                </SectionHeading>
                <dl className="space-y-2.5">
                  {info.map((item) => (
                    <div key={item.label} className="font-text text-sm leading-relaxed text-neutral-700">
                      <dt className="sr-only">{item.label}</dt>
                      <dd>
                        <span className="font-medium">{item.label}:</span>{" "}
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Accessibility */}
              <section aria-labelledby="accessibility-heading">
                <SectionHeading>
                  <span id="accessibility-heading">Accessibility</span>
                </SectionHeading>
                <CheckList items={accessibilityItems} />
              </section>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
