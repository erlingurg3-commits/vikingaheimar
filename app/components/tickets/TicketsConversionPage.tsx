"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/app/components/primitives/Container";
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

const arrivalTimeSlots = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] as const;
const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date | null, b: Date) {
  return !!a && toDateKey(a) === toDateKey(b);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
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
    "inline-flex min-h-12 items-center justify-center rounded-md border-2 border-[#111111] bg-transparent px-8 py-3 text-base font-semibold uppercase tracking-[0.06em] text-[#111111] transition hover:bg-[#ece8df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:bg-[#e2ddd4] disabled:cursor-not-allowed disabled:opacity-50";
  const continueButtonCompactClass =
    "inline-flex min-h-12 items-center justify-center rounded-md border-2 border-[#111111] bg-transparent px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-[#111111] transition hover:bg-[#ece8df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:bg-[#e2ddd4] disabled:cursor-not-allowed disabled:opacity-50";

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


  const updateQuantity = (name: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] ?? 0) + delta),
    }));
  };

  const chooseReady = Boolean(selectedDate && selectedTimeSlot && totalTickets > 0 && checkoutDraft);
  const chooseStage: "date" | "time" | "tickets" = !selectedDate
    ? "date"
    : !selectedTimeSlot
    ? "time"
    : "tickets";
  const chooseStageIndex = chooseStage === "date" ? 0 : chooseStage === "time" ? 1 : 2;

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot("");
  };

  return (
    <main className="w-full overflow-x-hidden bg-[#f7f6f2] pb-28 text-[#111111] md:pb-0">
      <section className="border-b border-[#d4d0c8] pt-16 pb-4 md:pt-24">
        <Container size="xl" className="max-w-[780px] space-y-3">
          <div className="space-y-1.5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6b6b]">Book Direct = Best Price</p>
            <h1 className="font-display text-[24px] font-normal leading-tight md:text-[42px]">Tickets &amp; Admission</h1>
            <p className="text-sm text-[#6b6b6b]">Choose date, time, and tickets quickly.</p>
          </div>
          <div className="flex items-center gap-2" aria-label="Booking progress">
            {[0, 1, 2].map((index) => (
              <span
                key={`progress-${index}`}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index <= chooseStageIndex ? "bg-[#111111]" : "bg-[#d4d0c8]"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="hidden text-center pb-1 md:block">
            <Link
              href={ROUTES.groups}
              onClick={() => trackGroupsInquiryClick({ source: "tickets_hero_secondary" })}
              className="text-sm font-medium uppercase tracking-[0.08em] text-[#6b6b6b] underline underline-offset-4 transition hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
            >
              Groups &amp; Schools
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-4 md:py-8">
        <Container size="xl" className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <section aria-labelledby="visit-schedule-heading" className="rounded-xl border border-[#d4d0c8] bg-[#f8f7f3] p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 id="visit-schedule-heading" className="font-display text-xl font-normal md:text-2xl">
                    {chooseStage === "date" && "Choose date"}
                    {chooseStage === "time" && "Choose arrival time"}
                    {chooseStage === "tickets" && "Choose tickets"}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#6b6b6b]">
                    {chooseStage === "date" && "Select your visit date."}
                    {chooseStage === "time" && "Pick one available time."}
                    {chooseStage === "tickets" && "Select your tickets."}
                  </p>
                </div>
              </div>

              {chooseStage === "date" && (
                <div className="rounded-lg border border-[#dcd7cf] bg-[#faf9f6] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-[#6b6b6b]">
                      {currentMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d4d0c8] bg-[#f7f6f2] text-lg text-[#111111] hover:bg-[#ece8df]"
                        aria-label="Previous month"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d4d0c8] bg-[#f7f6f2] text-lg text-[#111111] hover:bg-[#ece8df]"
                        aria-label="Next month"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {weekdayLabels.map((day) => (
                      <span key={day} className="text-center text-[11px] uppercase tracking-[0.12em] text-[#8a857c]">{day}</span>
                    ))}
                    {calendarCells.map((date, index) => {
                      if (!date) {
                        return <span key={`empty-${index}`} className="h-10" aria-hidden="true" />;
                      }

                      const isPast = startOfDay(date) < today;
                      const selected = isSameDay(selectedDate, date);

                      return (
                        <button
                          key={toDateKey(date)}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleSelectDate(date)}
                          className={`h-10 rounded-md border text-sm transition ${
                            isPast
                              ? "cursor-not-allowed opacity-40"
                              : "hover:bg-[#f0ede6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
                          } ${selected ? "border-[#111111] bg-[#ece8df] font-semibold" : "border-[#d4d0c8] bg-[#f7f6f2]"}`}
                          aria-label={date.toLocaleDateString("en-GB")}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {chooseStage === "time" && (
                <div
                  className="origin-top transition-all duration-500 mt-3 max-h-[420px] opacity-100"
                >
                  <h3 className="font-display text-xl font-normal">Choose arrival time</h3>
                  <p className="mt-1 text-sm text-[#6b6b6b]">Pick one available time slot below.</p>
                  {capacityLoading ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5" aria-label="Loading available times">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div key={`slot-skeleton-${index}`} className="h-12 animate-pulse rounded-md border border-[#d4d0c8] bg-[#ece8df]" />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
                      {slotsForSelectedDate.map((slot) => {
                        const selected = selectedTimeSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={slot.full}
                            onClick={() => setSelectedTimeSlot(slot.time)}
                            className={`min-h-12 rounded-md border px-3 text-sm transition ${
                              slot.full
                                ? "cursor-not-allowed opacity-45"
                                : "hover:bg-[#f0ede6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:bg-[#e2ddd4]"
                            } ${selected ? "border-[3px] border-[#111111] bg-[#ece8df] font-semibold ring-2 ring-[#111111]/25" : "border-[#d4d0c8] bg-[#faf9f6]"}`}
                            aria-pressed={selected}
                          >
                            {slot.time} {slot.full ? "• Full" : "• Open"}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-[#6b6b6b]" aria-live="polite">
                    {selectedTimeSlot ? `Selected time: ${selectedTimeSlot}` : "Select a time to continue."}
                  </p>
                  {selectedTimeSlot && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTimeSlot("")}
                        className="inline-flex min-h-10 items-center rounded-md border border-[#d4d0c8] bg-[#f7f6f2] px-4 text-sm font-medium text-[#111111] hover:bg-[#ece8df]"
                      >
                        Change time
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {chooseStage === "tickets" && (
              <>
                <section
                  aria-labelledby="ticket-options-heading"
                  className="space-y-3 transition-all duration-300"
                >
                  <h2 id="ticket-options-heading" className="font-display text-xl font-normal md:text-2xl">Choose tickets</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedTimeSlot("")}
                    className="inline-flex min-h-10 items-center rounded-md border border-[#d4d0c8] bg-[#f7f6f2] px-4 text-sm font-medium text-[#111111] hover:bg-[#ece8df]"
                  >
                    ← Back to time
                  </button>
                  <div className="rounded-xl border border-[#d4d0c8] bg-[#f8f7f3] divide-y divide-[#d4d0c8]">
                    {ticketOptions.map((option) => (
                      <article key={option.name} className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-display text-lg font-normal">{option.name}</h3>
                            <p className="text-sm font-semibold">{option.price}</p>
                            <p className="text-xs text-[#6b6b6b]">{option.audience ?? " "}</p>
                            {option.complimentaryNote && <p className="text-xs text-[#6b6b6b]">{option.complimentaryNote}</p>}
                          </div>
                          <div className="inline-flex items-center gap-2" aria-label={`${option.name} quantity selector`}>
                            <button
                              type="button"
                              className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-[#ddd8cf] bg-[#f7f6f2] text-2xl leading-none transition hover:bg-[#ece8df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:bg-[#e2ddd4]"
                              onClick={() => updateQuantity(option.name, -1)}
                              aria-label={`Decrease ${option.name} quantity`}
                            >
                              –
                            </button>
                            <span className="min-w-7 text-center text-xl font-medium" aria-live="polite">{quantities[option.name] ?? 0}</span>
                            <button
                              type="button"
                              className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-[#ddd8cf] bg-[#f7f6f2] text-2xl leading-none transition hover:bg-[#ece8df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:bg-[#e2ddd4]"
                              onClick={() => updateQuantity(option.name, 1)}
                              aria-label={`Increase ${option.name} quantity`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  {shouldSuggestFamilyAdmission && <p className="text-sm text-[#7a746a]">Family Admission may be the best value for 2 adults + 2 youth.</p>}
                </section>
              </>
            )}
          </div>

          <aside className="hidden lg:block sticky top-20 h-fit rounded-xl border border-[#d4d0c8] bg-[#f8f7f3] p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-normal">Booking summary</h3>
              <p className="text-sm font-semibold">ISK {totalSelectedPrice.toLocaleString()}</p>
            </div>
            <div className="mt-3 space-y-3 text-sm text-[#6b6b6b]">
              <p><span className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Date</span>{selectedDate ? selectedDate.toLocaleDateString("en-GB") : "Not selected"}</p>
              <p><span className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Time</span>{selectedTimeSlot || "Not selected"}</p>
              <p><span className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Tickets</span>{totalTickets}</p>
            </div>

            {selectedLineItems.length > 0 && (
              <div className="mt-3 border-t border-[#d4d0c8] pt-3 text-sm text-[#6b6b6b]">
                {selectedLineItems.map((line) => (
                  <div key={line.name} className="flex items-center justify-between">
                    <span>{line.quantity} × {line.name}</span>
                    <span>ISK {line.lineTotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {chooseStage !== "date" && (
              <div className="mt-4 space-y-2 border-t border-[#d4d0c8] pt-4">
                <button
                  type="button"
                  onClick={handleContinueToCheckout}
                  className={`${continueButtonClass} w-full`}
                  disabled={!chooseReady}
                >
                  Continue to details →
                </button>
                {!chooseReady && chooseStage === "time" && (
                  <p className="text-xs text-[#6b6b6b]">Choose at least one ticket to continue.</p>
                )}
                {checkoutError && <p className="text-sm text-[#9d3c32]">{checkoutError}</p>}
              </div>
            )}
          </aside>
        </Container>
      </section>

      <div className={`fixed bottom-0 left-0 right-0 z-[1035] border-t border-[#d4d0c8] bg-[#f7f6f2]/95 p-3 backdrop-blur-xl md:hidden ${chooseStage === "date" ? "hidden" : ""}`}>
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#6b6b6b]">Total</p>
            <p className="text-base font-semibold">ISK {totalSelectedPrice.toLocaleString()}</p>
          </div>
          <button type="button" onClick={handleContinueToCheckout} className={continueButtonCompactClass} disabled={!chooseReady}>Continue to details →</button>
        </div>
        {!chooseReady && chooseStage === "time" && (
          <p className="mt-2 text-xs text-[#6b6b6b]">Choose at least one ticket to continue.</p>
        )}
        {checkoutError && <p className="mt-2 text-sm text-[#9d3c32]">{checkoutError}</p>}
      </div>
    </main>
  );
}
