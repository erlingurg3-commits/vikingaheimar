"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CircleCheckBig } from "lucide-react";
import Container from "@/app/components/primitives/Container";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { createStandardOrder } from "@/lib/orders";
import type { CheckoutDraft, OrderRow } from "@/lib/orders";
import BookingProgress from "@/app/components/tickets/BookingProgress";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("vikingaheimar_checkout_draft");

    if (!raw) {
      router.replace("/");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as CheckoutDraft;
      const hasTickets =
        (parsed.ticket_general ?? 0) +
          (parsed.ticket_youth ?? 0) +
          (parsed.ticket_family ?? 0) >
        0;

      if (!parsed.visit_date || !parsed.visit_time || !hasTickets) {
        router.replace("/");
        return;
      }

      setDraft(parsed);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const validateFirstName = (value: string) => {
    if (!value.trim()) return "Please enter your first name.";
    return "";
  };

  const validateLastName = (value: string) => {
    if (!value.trim()) return "Please enter your last name.";
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Please enter your email.";
    if (!EMAIL_REGEX.test(value.trim())) return "Please enter a valid email.";
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) return "Please enter your phone number.";
    if (value.replace(/[^\d+]/g, "").length < 7) return "Please enter a valid phone number.";
    return "";
  };

  const validateAllDetails = () => {
    const nextErrors = {
      firstName: validateFirstName(firstName),
      lastName: validateLastName(lastName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    };
    setFieldErrors(nextErrors);
    return Object.values(nextErrors).every((message) => !message);
  };

  const totalTickets = useMemo(() => {
    if (!draft) return 0;
    return draft.ticket_general + draft.ticket_youth + draft.ticket_family;
  }, [draft]);

  const lineItems = useMemo(() => {
    if (!draft) return [] as Array<{ label: string; quantity: number; total: number }>;

    return [
      {
        label: "General Admission",
        quantity: draft.ticket_general,
        total: draft.ticket_general * 3800,
      },
      {
        label: "Youth (6–17)",
        quantity: draft.ticket_youth,
        total: draft.ticket_youth * 1900,
      },
      {
        label: "Family Admission",
        quantity: draft.ticket_family,
        total: draft.ticket_family * 9900,
      },
    ].filter((item) => item.quantity > 0);
  }, [draft]);

  const handleConfirmBooking = async () => {
    if (!draft || submitting) return;

    if (!validateAllDetails()) {
      setError("Please check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await createStandardOrder(supabaseBrowser, {
        customer_email: email.trim().toLowerCase(),
        visit_date: draft.visit_date,
        visit_time: draft.visit_time,
        ticket_general: draft.ticket_general,
        ticket_youth: draft.ticket_youth,
        ticket_family: draft.ticket_family,
        total_amount: draft.total_amount,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      const order = result.data as OrderRow | null;
      if (!order?.id) {
        setError("Booking created, but confirmation ID was missing. Please contact support.");
        return;
      }

      sessionStorage.removeItem("vikingaheimar_checkout_draft");
      sessionStorage.setItem(
        "vikingaheimar_last_order",
        JSON.stringify(order)
      );

      router.push(`/thank-you?id=${encodeURIComponent(order.id)}`);
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!draft) {
    return (
      <main className="min-h-screen w-full bg-[#f7f6f2] text-[#111111]">
        <section className="pt-24 pb-8 md:pt-32">
          <Container size="xl" className="max-w-[900px]">
            <div className="space-y-4 rounded-xl border border-[#d4d0c8] bg-[#f8f7f3] p-6">
              <div className="h-8 w-56 animate-pulse rounded bg-[#ece8df]" />
              <div className="h-24 w-full animate-pulse rounded bg-[#ece8df]" />
              <div className="h-12 w-full animate-pulse rounded bg-[#ece8df]" />
              <p className="text-sm text-[#6b6b6b]">Loading your booking details…</p>
            </div>
          </Container>
        </section>
      </main>
    );
  }

  const taxesAmount = 0;
  const detailsReady = validateFirstName(firstName) === "" && validateLastName(lastName) === "" && validateEmail(email) === "" && validatePhone(phone) === "";

  const fieldBaseClass = "min-h-12 w-full rounded-md border bg-[#f7f6f2] px-4 text-base text-[#111111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]";

  return (
    <main className="min-h-screen w-full bg-[#f7f6f2] pb-28 text-[#111111] md:pb-0">
      <section className="pt-24 pb-10 md:pt-32 md:pb-16">
        <Container size="xl" className="max-w-[1020px] space-y-6">
          <header className="space-y-3 text-center">
            <h1 className="font-display text-[32px] font-normal leading-tight md:text-[48px]">Checkout</h1>
            <p className="text-base text-[#6b6b6b]">Guest checkout is default. No account required.</p>
          </header>

          <BookingProgress currentStep={step === "details" ? "details" : "confirm"} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-xl border border-[#d4d0c8] bg-[#f8f7f3] p-5 md:p-7">
              {step === "details" ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-3xl font-normal">Step B — Details</h2>
                    <p className="mt-1 text-sm text-[#6b6b6b]">Enter guest details to continue.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="guest-first-name" className="text-sm font-medium text-[#6b6b6b]">First name</label>
                      <input
                        id="guest-first-name"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(event) => {
                          const value = event.target.value;
                          setFirstName(value);
                          setFieldErrors((prev) => ({ ...prev, firstName: validateFirstName(value) }));
                        }}
                        className={`${fieldBaseClass} ${fieldErrors.firstName ? "border-[#9d3c32]" : "border-[#d4d0c8]"}`}
                      />
                      {fieldErrors.firstName && <p className="text-sm text-[#9d3c32]">{fieldErrors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="guest-last-name" className="text-sm font-medium text-[#6b6b6b]">Last name</label>
                      <input
                        id="guest-last-name"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(event) => {
                          const value = event.target.value;
                          setLastName(value);
                          setFieldErrors((prev) => ({ ...prev, lastName: validateLastName(value) }));
                        }}
                        className={`${fieldBaseClass} ${fieldErrors.lastName ? "border-[#9d3c32]" : "border-[#d4d0c8]"}`}
                      />
                      {fieldErrors.lastName && <p className="text-sm text-[#9d3c32]">{fieldErrors.lastName}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="customer-email" className="text-sm font-medium text-[#6b6b6b]">Email</label>
                      <input
                        id="customer-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          const value = event.target.value;
                          setEmail(value);
                          setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
                        }}
                        placeholder="you@example.com"
                        className={`${fieldBaseClass} ${fieldErrors.email ? "border-[#9d3c32]" : "border-[#d4d0c8]"}`}
                      />
                      {fieldErrors.email && <p className="text-sm text-[#9d3c32]">{fieldErrors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="guest-phone" className="text-sm font-medium text-[#6b6b6b]">Phone</label>
                      <input
                        id="guest-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPhone(value);
                          setFieldErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
                        }}
                        placeholder="+354 000 0000"
                        className={`${fieldBaseClass} ${fieldErrors.phone ? "border-[#9d3c32]" : "border-[#d4d0c8]"}`}
                      />
                      {fieldErrors.phone && <p className="text-sm text-[#9d3c32]">{fieldErrors.phone}</p>}
                    </div>
                  </div>

                  {error && <p className="text-sm text-[#9d3c32]">{error}</p>}

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!validateAllDetails()) {
                          setError("Please check the highlighted fields.");
                          return;
                        }
                        setError("");
                        setStep("confirm");
                      }}
                      disabled={!detailsReady}
                      className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-[#111111] bg-[#f7f6f2] px-8 py-3 text-base font-semibold uppercase tracking-[0.06em] text-[#111111] transition hover:bg-[#ece8df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:bg-[#e2ddd4] disabled:cursor-not-allowed disabled:opacity-100 disabled:border-[#111111] disabled:text-[#6b6b6b]"
                    >
                      Continue to confirm
                    </button>
                    <Link href="/tickets" className="text-sm text-[#6b6b6b] underline underline-offset-4">Back to choose</Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-3xl font-normal">Step C — Confirm &amp; Pay</h2>
                    <p className="mt-1 text-sm text-[#6b6b6b]">Review your order details before booking.</p>
                  </div>

                  <div className="rounded-lg border border-[#d4d0c8] bg-[#f7f6f2] p-4 text-sm text-[#6b6b6b]">
                    <p className="font-medium text-[#111111]">You won&apos;t be charged yet</p>
                    <p className="mt-1">Secure your booking now. Final payment is processed at confirmation.</p>
                  </div>

                  <div className="space-y-2 border-b border-[#d4d0c8] pb-4 text-sm text-[#6b6b6b]">
                    <p className="text-[11px] uppercase tracking-[0.12em]">Price breakdown</p>
                    {lineItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span>{item.quantity} × {item.label}</span>
                        <span>ISK {item.total.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <span>Base price</span>
                      <span>ISK {draft.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taxes &amp; fees</span>
                      <span>ISK {taxesAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#d4d0c8] bg-[#f1efe8] p-4 text-sm text-[#6b6b6b]">
                    <p className="inline-flex items-center gap-2"><ShieldCheck size={16} aria-hidden="true" /> Secure payment</p>
                    <p className="mt-2 inline-flex items-center gap-2"><CircleCheckBig size={16} aria-hidden="true" /> Free cancellation up to 24 hours before visit</p>
                  </div>

                  {error && <p className="text-sm text-[#9d3c32]">{error}</p>}

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={submitting}
                      className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#d4d0c8] bg-[#111111] px-8 py-3 text-base font-semibold uppercase tracking-[0.06em] text-[#f7f6f2] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Confirming booking..." : "Confirm & Pay"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#d4d0c8] bg-[#f7f6f2] px-6 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-[#111111] transition hover:bg-[#ece8df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:bg-[#e2ddd4]"
                    >
                      Edit details
                    </button>
                  </div>
                </div>
              )}
            </section>

            <aside className="h-fit rounded-xl border border-[#d4d0c8] bg-[#f8f7f3] p-5">
              <h3 className="font-display text-2xl font-normal">Order Summary</h3>
              <div className="mt-4 space-y-3 border-y border-[#dcd7cf] py-3 text-sm text-[#6b6b6b]">
                <p><span className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Date</span>{draft.visit_date}</p>
                <p><span className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Time</span>{draft.visit_time}</p>
                <p><span className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Tickets</span>{totalTickets}</p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[#6b6b6b]">
                {lineItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.quantity} × {item.label}</span>
                    <span>ISK {item.total.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[#d4d0c8] pt-3">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-semibold text-[#111111]">ISK {draft.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-[1035] border-t border-[#d4d0c8] bg-[#f7f6f2]/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#6b6b6b]">Total</p>
            <p className="text-base font-semibold">ISK {draft.total_amount.toLocaleString()}</p>
          </div>
          {step === "details" ? (
            <button
              type="button"
              onClick={() => {
                if (!validateAllDetails()) {
                  setError("Please check the highlighted fields.");
                  return;
                }
                setError("");
                setStep("confirm");
              }}
              disabled={!detailsReady}
              className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-[#111111] bg-[#f7f6f2] px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-[#111111] disabled:cursor-not-allowed disabled:opacity-100 disabled:border-[#111111] disabled:text-[#6b6b6b]"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#d4d0c8] bg-[#111111] px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-[#f7f6f2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Confirming..." : "Confirm & Pay"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
