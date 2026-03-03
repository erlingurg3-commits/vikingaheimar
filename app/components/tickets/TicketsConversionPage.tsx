"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Timer, CircleCheckBig } from "lucide-react";
import Container from "@/app/components/primitives/Container";
import Card from "@/app/components/primitives/Card";
import { SectionTitle } from "@/app/components/primitives/Typography";
import Reveal from "@/app/components/primitives/Reveal";
import { ROUTES } from "@/lib/site-routes";
import { trackBookTicketsClick, trackGroupsInquiryClick } from "@/lib/analytics";
import type { CheckoutDraft } from "@/lib/orders";

type TicketOption = {
  name: string;
  price: string;
  audience?: string;
  complimentaryNote?: string;
};

type CapacityResponse = {
  capacity: number;
  remainingByTime: Record<string, number>;
};

const ticketOptions: TicketOption[] = [
  {
    name: "General Admission",
    price: "ISK 3,800",
    audience: "Ages 18+",
  },
  {
    name: "Youth",
    price: "ISK 1,900",
    audience: "Ages 6–17",
    complimentaryNote: "Under 5: Complimentary admission",
  },
  {
    name: "Family Admission",
    price: "ISK 9,900",
    audience: "2 adults + 2 youth",
  },
];

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const arrivalTimeSlots = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] as const;

type DateAvailability = "available" | "limited" | "unavailable";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function isSameDay(a: Date | null, b: Date) {
  return !!a && toDateKey(a) === toDateKey(b);
}

function getDateAvailability(date: Date, today: Date): DateAvailability {
  const normalizedDate = startOfDay(date);
  const normalizedToday = startOfDay(today);

  if (normalizedDate < normalizedToday) {
    return "unavailable";
  }

  const day = date.getDay();
  const dayOfMonth = date.getDate();

  if (day === 0 || dayOfMonth % 5 === 0) {
    return "limited";
  }

  return "available";
}

function getTimeSlotsForDate(date: Date) {
  const seed = date.getDate() + date.getMonth() * 9 + date.getDay() * 3;

  return arrivalTimeSlots.map((time, index) => ({
    time,
    full: (index + seed) % 6 === 0,
  }));
}

export default function TicketsConversionPage() {
  const router = useRouter();
  const today = useMemo(() => {
    const normalizedToday = new Date();
    normalizedToday.setHours(0, 0, 0, 0);
    return normalizedToday;
  }, []);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [remainingByTime, setRemainingByTime] = useState<Record<string, number>>({});
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(ticketOptions.map((option) => [option.name, 0]))
  );

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const leadingOffset = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();

  const calendarCells = useMemo(() => {
    const dates: Array<Date | null> = [];

    for (let index = 0; index < leadingOffset; index += 1) {
      dates.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    while (dates.length % 7 !== 0) {
      dates.push(null);
    }

    return dates;
  }, [currentMonth, daysInMonth, leadingOffset]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    return getTimeSlotsForDate(selectedDate).map((slot) => {
      const remaining = remainingByTime[slot.time] ?? 50;
      return {
        time: slot.time,
        full: remaining <= 0,
        remaining,
      };
    });
  }, [selectedDate, remainingByTime]);

  const totalTickets = useMemo(
    () => Object.values(quantities).reduce((sum, count) => sum + count, 0),
    [quantities]
  );

  const selectedLineItems = useMemo(() => {
    return ticketOptions
      .map((option) => {
        const quantity = quantities[option.name] ?? 0;
        const unitPrice = Number(option.price.replace(/[^\d]/g, ""));
        return {
          name: option.name,
          quantity,
          unitPrice,
          lineTotal: quantity * unitPrice,
        };
      })
      .filter((line) => line.quantity > 0);
  }, [quantities]);

  const totalSelectedPrice = useMemo(
    () => selectedLineItems.reduce((sum, line) => sum + line.lineTotal, 0),
    [selectedLineItems]
  );

  const shouldSuggestFamilyAdmission =
    (quantities["General Admission"] ?? 0) >= 2 &&
    (quantities["Youth"] ?? 0) >= 2 &&
    (quantities["Family Admission"] ?? 0) === 0;

  const continueButtonClass =
    "inline-flex items-center justify-center px-10 py-5 text-base font-semibold tracking-[0.06em] uppercase bg-[#f7f6f2] text-[#111111] visited:text-[#111111] hover:text-[#111111] focus:text-[#111111] active:text-[#111111] rounded-[4px] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7f6f2]";
  const continueButtonCompactClass =
    "inline-flex items-center justify-center px-5 py-3 text-sm font-semibold tracking-[0.06em] uppercase bg-[#f7f6f2] text-[#111111] rounded-[4px] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7f6f2]";

  const checkoutDraft: CheckoutDraft | null = useMemo(() => {
    if (!selectedDate || !selectedTimeSlot || totalTickets <= 0) {
      return null;
    }

    return {
      visit_date: selectedDate.toISOString().split("T")[0],
      visit_time: selectedTimeSlot,
      ticket_general: quantities["General Admission"] ?? 0,
      ticket_youth: quantities["Youth"] ?? 0,
      ticket_family: quantities["Family Admission"] ?? 0,
      total_amount: totalSelectedPrice,
    };
  }, [selectedDate, selectedTimeSlot, totalTickets, quantities, totalSelectedPrice]);

  const handleContinueToCheckout = () => {
    if (!selectedDate) {
      setCheckoutError("Please choose a visit date.");
      return;
    }

    if (!selectedTimeSlot) {
      setCheckoutError("Please choose an arrival time.");
      return;
    }

    if (totalTickets <= 0) {
      setCheckoutError("Select at least one ticket before checkout.");
      return;
    }

    if (!checkoutDraft) {
      setCheckoutError("Unable to prepare your booking details. Please try again.");
      return;
    }

    setCheckoutError("");
    trackBookTicketsClick({ source: "tickets_grid_continue", destination: "internal" });
    sessionStorage.setItem("vikingaheimar_checkout_draft", JSON.stringify(checkoutDraft));
    router.push("/checkout");
  };

  useEffect(() => {
    if (!selectedDate) {
      setSelectedTimeSlot("");
      setRemainingByTime({});
      return;
    }

    const loadCapacity = async () => {
      setCapacityLoading(true);
      try {
        const dateKey = toDateKey(selectedDate);
        const response = await fetch(`/api/orders?capacity=1&visit_date=${dateKey}`);
        const payload = (await response.json()) as CapacityResponse;

        if (response.ok && payload?.remainingByTime) {
          setRemainingByTime(payload.remainingByTime);
        } else {
          setRemainingByTime({});
        }
      } catch {
        setRemainingByTime({});
      } finally {
        setCapacityLoading(false);
      }
    };

    loadCapacity();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate || slotsForSelectedDate.length === 0) {
      setSelectedTimeSlot("");
      return;
    }

    if (selectedTimeSlot && slotsForSelectedDate.some((slot) => slot.time === selectedTimeSlot && !slot.full)) {
      return;
    }

    const firstAvailable = slotsForSelectedDate.find((slot) => !slot.full);
    setSelectedTimeSlot(firstAvailable?.time ?? "");
  }, [selectedDate, slotsForSelectedDate, selectedTimeSlot]);

  const updateQuantity = (name: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] ?? 0) + delta),
    }));
  };

  return (
    <main className="w-full" style={{ backgroundColor: "#f7f6f2", color: "#111111" }}>
      <section className="pt-28 pb-20 md:pt-36 md:pb-24 border-b" style={{ borderColor: "#d4d0c8" }}>
        <Container size="xl" className="space-y-8 text-center">
          <h1 className="font-display font-extrabold tracking-[-0.01em] text-[40px] md:text-[clamp(64px,5.5vw,72px)]" style={{ lineHeight: 1.03, color: "#111111" }}>
            Tickets &amp; Admission
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href={ROUTES.groups}
              onClick={() => trackGroupsInquiryClick({ source: "tickets_hero_secondary" })}
              className="text-sm font-medium tracking-[0.08em] uppercase underline underline-offset-4 hover:no-underline transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: "#6b6b6b" }}
            >
              GROUPS &amp; SCHOOLS
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container size="xl" className="space-y-8">
          <SectionTitle
            overline="Choose Your Ticket"
            title="Admission"
            className="[&_h2]:text-[#111111] [&_p]:text-[#6b6b6b] [&_.text-accent-frost-blue]:text-[#6b6b6b]"
          />

          <div className="my-4 h-px w-full" style={{ backgroundColor: "#d4d0c8" }} aria-hidden="true" />

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
            <div className="space-y-8">
              <section
                aria-labelledby="visit-schedule-heading"
                className="rounded-xl border p-6 md:p-8"
                style={{
                  backgroundColor: "#f8f7f3",
                  borderColor: "#d4d0c8",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    id="visit-schedule-heading"
                    className="font-display text-[28px] md:text-[34px] font-light"
                    style={{ color: "#111111" }}
                  >
                    Choose Your Day of Arrival
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                        )
                      }
                      className="h-9 w-9 rounded-md border transition-colors duration-200"
                      style={{ borderColor: "#d4d0c8", color: "#6b6b6b", backgroundColor: "#f7f6f2" }}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                        )
                      }
                      className="h-9 w-9 rounded-md border transition-colors duration-200"
                      style={{ borderColor: "#d4d0c8", color: "#6b6b6b", backgroundColor: "#f7f6f2" }}
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <p className="text-sm mb-5" style={{ color: "#6b6b6b" }}>
                  {currentMonth.toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <div className="grid grid-cols-7 gap-2">
                  {weekdayLabels.map((day) => (
                    <span
                      key={day}
                      className="text-[11px] uppercase tracking-[0.12em] text-center"
                      style={{ color: "#8a857c" }}
                    >
                      {day}
                    </span>
                  ))}

                  {calendarCells.map((date, index) => {
                    if (!date) {
                      return <span key={`empty-${index}`} className="h-12" aria-hidden="true" />;
                    }

                    const availability = getDateAvailability(date, today);
                    const isDisabled = availability === "unavailable";
                    const isToday = isSameDay(startOfDay(today), date);
                    const selected = isSameDay(selectedDate, date);

                    return (
                      <button
                        key={toDateKey(date)}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(date)}
                        className={`relative h-12 rounded-md border text-sm transition-all duration-300 ${
                          isDisabled
                            ? "opacity-45 cursor-not-allowed"
                            : "hover:bg-[#f0ede6]"
                        }`}
                        style={{
                          borderColor: selected
                            ? "#bcb6aa"
                            : isToday
                            ? "#c9c3b7"
                            : "#dcd7cf",
                          backgroundColor: selected ? "#ece8df" : "#faf9f6",
                          color: "#111111",
                        }}
                        aria-label={`${date.toLocaleDateString("en-GB")} ${availability}`}
                      >
                        <span>{date.getDate()}</span>
                        <span
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              availability === "available"
                                ? "#93a38c"
                                : availability === "limited"
                                ? "#b4a68c"
                                : "#cfc9be",
                          }}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`mt-8 transition-all duration-500 origin-top ${
                    selectedDate
                      ? "opacity-100 max-h-[420px] translate-y-0"
                      : "opacity-0 max-h-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <h3
                    className="font-display text-2xl md:text-[28px] font-light"
                    style={{ color: "#111111" }}
                  >
                    Choose When Your Journey Begins
                  </h3>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {slotsForSelectedDate.map((slot) => {
                      const selected = selectedTimeSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.full}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`h-11 rounded-[4px] border px-3 text-sm transition-colors duration-200 ${
                            slot.full ? "opacity-45 cursor-not-allowed" : "hover:bg-[#f0ede6]"
                          }`}
                          style={{
                            borderColor: selected
                              ? "#bcb6aa"
                              : "#d4d0c8",
                            backgroundColor: selected ? "#ece8df" : "#faf9f6",
                            color: "#111111",
                          }}
                          aria-pressed={selected}
                        >
                          {slot.time} {slot.full ? "• Full" : ""}
                        </button>
                      );
                    })}
                  </div>
                  {capacityLoading && (
                    <p className="mt-3 text-xs" style={{ color: "#6b6b6b" }}>
                      Checking live availability…
                    </p>
                  )}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {ticketOptions.map((option, index) => (
              <Reveal key={option.name} delayMs={index * 60}>
                <Card
                  variant="default"
                  hoverable={false}
                  className="p-10 h-full min-h-[360px] w-full min-w-0 overflow-hidden flex flex-col gap-8 bg-[#f8f7f3] border-[#e2ddd4] shadow-none backdrop-blur-0"
                >
                  <div className="space-y-2 min-h-[140px]">
                    <h2 className="font-display text-3xl" style={{ color: "#111111" }}>
                      {option.name}
                    </h2>
                    <p className="text-2xl font-semibold" style={{ color: "#111111" }}>
                      {option.price}
                    </p>
                    <div className="space-y-1.5">
                      <p className="text-sm font-normal" style={{ color: "#6b6b6b" }}>
                        {option.audience ?? "\u00A0"}
                      </p>
                      <p className="text-sm font-normal" style={{ color: "#6b6b6b" }}>
                        {option.complimentaryNote ?? "\u00A0"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-12 w-full min-w-0 flex flex-col items-center gap-4">
                    <p className="text-xs uppercase tracking-[0.08em] text-center" style={{ color: "#6b6b6b" }}>
                      Quantity
                    </p>
                    <div
                      className="inline-flex w-[132px] max-w-full flex-shrink-0 items-center justify-center gap-4"
                      aria-label={`${option.name} quantity selector`}
                    >
                      <button
                        type="button"
                        className="w-9 h-9 text-lg leading-none rounded-[4px] border"
                        style={{ color: "#111111", borderColor: "#ddd8cf", backgroundColor: "#f8f7f3" }}
                        onClick={() => updateQuantity(option.name, -1)}
                        aria-label={`Decrease ${option.name} quantity`}
                      >
                        –
                      </button>
                      <span
                        className="min-w-[32px] text-center text-xl font-medium"
                        style={{ color: "#111111" }}
                        aria-live="polite"
                      >
                        {quantities[option.name] ?? 0}
                      </span>
                      <button
                        type="button"
                        className="w-9 h-9 text-lg leading-none rounded-[4px] border"
                        style={{ color: "#111111", borderColor: "#ddd8cf", backgroundColor: "#f8f7f3" }}
                        onClick={() => updateQuantity(option.name, 1)}
                        aria-label={`Increase ${option.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
              </div>

              {shouldSuggestFamilyAdmission && (
                <p className="text-sm text-center" style={{ color: "#7a746a" }}>
                  Consider a Family Admission for better value.
                </p>
              )}

              <div className="pt-6 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={handleContinueToCheckout}
                  className={continueButtonClass}
                >
                  Continue to Checkout
                </button>
                <Link
                  href={ROUTES.groups}
                  onClick={() => trackGroupsInquiryClick({ source: "tickets_grid_group_link" })}
                  className="text-sm font-medium tracking-[0.02em] underline underline-offset-4 hover:no-underline transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ color: "#6b6b6b" }}
                >
                  Planning a group visit? Visit our Groups page.
                </Link>
                {checkoutError && (
                  <p className="text-sm" style={{ color: "#9d3c32" }}>
                    {checkoutError}
                  </p>
                )}
              </div>

              <section className="pt-8 pb-2" aria-labelledby="your-visit-heading">
                <div className="max-w-[720px] mx-auto text-center space-y-5">
                  <h2
                    id="your-visit-heading"
                    className="font-display text-[32px] md:text-[40px] font-light leading-tight"
                    style={{ color: "#111111" }}
                  >
                    Your Visit
                  </h2>
                  <ul className="space-y-3 text-base" style={{ color: "#6b6b6b" }}>
                    <li>Allow 60–90 minutes.</li>
                    <li>Open daily 10:00–18:00.</li>
                    <li>Fully accessible.</li>
                    <li>Instant confirmation after booking.</li>
                  </ul>
                </div>
              </section>
            </div>

            <aside className="hidden xl:block sticky top-28">
              <div
                className="rounded-xl border p-6 space-y-5"
                style={{
                  backgroundColor: "#f8f7f3",
                  borderColor: "#d4d0c8",
                  color: "#111111",
                }}
              >
                <h3 className="font-display text-2xl font-light">Booking Summary</h3>

                <div className="text-sm border-y" style={{ borderColor: "#dcd7cf" }}>
                  <p className="py-3" style={{ color: "#6b6b6b" }}>
                    <span className="block text-[11px] uppercase tracking-[0.12em] mb-1">Date</span>
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })
                      : "Select your date"}
                  </p>
                  <p className="py-3 border-t" style={{ color: "#6b6b6b", borderColor: "#dcd7cf" }}>
                    <span className="block text-[11px] uppercase tracking-[0.12em] mb-1">Time</span>
                    {selectedTimeSlot || "Select your arrival time"}
                  </p>
                  <p className="py-3 border-t" style={{ color: "#6b6b6b", borderColor: "#dcd7cf" }}>
                    <span className="block text-[11px] uppercase tracking-[0.12em] mb-1">Tickets</span>
                    {totalTickets}
                  </p>
                </div>

                <div className="space-y-2 text-sm border-b pb-4" style={{ borderColor: "#dcd7cf" }}>
                  <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: "#6b6b6b" }}>
                    Pricing Summary
                  </p>

                  {selectedLineItems.length === 0 ? (
                    <p style={{ color: "#6b6b6b" }}>No tickets selected yet.</p>
                  ) : (
                    <>
                      {selectedLineItems.map((line) => (
                        <div key={line.name} className="flex items-center justify-between" style={{ color: "#6b6b6b" }}>
                          <span>{line.quantity} × {line.name}</span>
                          <span>ISK {line.lineTotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: "#6b6b6b" }}>Total</span>
                  <span className="text-base font-semibold" style={{ color: "#111111" }}>
                    ISK {totalSelectedPrice.toLocaleString()}
                  </span>
                </div>

                <div
                  className="rounded-[4px] border px-4 py-3 space-y-2 text-sm"
                  style={{ borderColor: "#d4d0c8", backgroundColor: "#f1efe8" }}
                >
                  <span className="inline-flex items-center gap-2 w-full">
                    <ShieldCheck size={16} style={{ color: "#6b6b6b" }} />
                    Secure checkout
                  </span>
                  <span className="inline-flex items-center gap-2 w-full">
                    <Timer size={16} style={{ color: "#6b6b6b" }} />
                    Instant confirmation
                  </span>
                  <span className="inline-flex items-center gap-2 w-full">
                    <CircleCheckBig size={16} style={{ color: "#6b6b6b" }} />
                    Flexible booking windows
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1035] border-t border-accent-frost-blue/20 bg-base-near-black/95 backdrop-blur-xl p-3">
        <div className="mx-auto w-full max-w-xl flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Ready to continue?
            </p>
            <p className="text-sm text-off-white">
              Review details and proceed
            </p>
          </div>
          <button
            type="button"
            onClick={handleContinueToCheckout}
            className={continueButtonCompactClass}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
