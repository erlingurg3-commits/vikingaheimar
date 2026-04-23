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
  { label: "Seniors / Students / Disabled", value: "10% online discount applied — valid documentation required" },
  { label: "Location", value: "Víkingabraut 1, 260 Reykjanesbær — 10 min from Keflavík Airport" },
  { label: "Parking", value: "Free on site" },
];

/* ── Shared sub-components ── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[8px] font-normal text-neutral-900 pb-0.5 border-b border-heritage-amber inline-block mb-1.5">
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
          <h1 className="font-display text-[clamp(28px,3.5vw,42px)] font-normal text-neutral-900 leading-tight">
            Book Your Visit
          </h1>
        </header>

        {/* ── Mobile: map behind widget ── */}
        <div className="lg:hidden relative mx-auto max-w-6xl">
          {/* Map layer — sits behind */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <RouteMapLoader />
          </div>

          {/* Bókun widget — transparent, on top */}
          <div className="relative z-10">
            <div
              className="bokunWidget booking-widget-mobile"
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

          {/* Info sections below widget */}
          <div className="relative z-10 space-y-12 mt-8">
            <section aria-labelledby="included-heading-m">
              <SectionHeading>
                <span id="included-heading-m">What&apos;s Included</span>
              </SectionHeading>
              <CheckList items={included} />
            </section>

            <section aria-labelledby="info-heading-m">
              <SectionHeading>
                <span id="info-heading-m">Visitor Info</span>
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

            <section aria-labelledby="accessibility-heading-m">
              <SectionHeading>
                <span id="accessibility-heading-m">Accessibility</span>
              </SectionHeading>
              <CheckList items={accessibilityItems} />
            </section>
          </div>
        </div>

        {/* ── Desktop: two-column layout ── */}
        <div className="hidden lg:grid mx-auto max-w-6xl grid-cols-11 gap-12 items-start lg:items-stretch">

          {/* Left column: booking widget (6/11 ≈ 55%) */}
          <div className="col-span-6">
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

          {/* Right column: map + info overlay */}
          <div className="col-span-5">
           <div className="relative sticky top-20">
            <div className="relative z-0">
              <RouteMapLoader />
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="max-w-[420px] pl-8 pt-8 space-y-4 pointer-events-auto">
                <section aria-labelledby="included-heading">
                  <SectionHeading>
                    <span id="included-heading">What&apos;s Included</span>
                  </SectionHeading>
                  <CheckList items={included} />
                </section>

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
        </div>
      </div>
    </main>
  );
}
