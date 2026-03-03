"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/app/components/primitives/Container";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { createStandardOrder } from "@/lib/orders";
import type { CheckoutDraft, OrderRow } from "@/lib/orders";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
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
    return null;
  }

  return (
    <main className="w-full min-h-screen" style={{ backgroundColor: "#f7f6f2", color: "#111111" }}>
      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <Container size="xl" className="max-w-[900px] space-y-10">
          <header className="text-center space-y-3">
            <h1 className="font-display font-extrabold tracking-[-0.01em] text-[40px] md:text-[56px]" style={{ lineHeight: 1.03 }}>
              Checkout
            </h1>
            <p className="text-sm" style={{ color: "#6b6b6b" }}>
              Confirm your visit details and provide your email to complete booking.
            </p>
          </header>

          <div className="rounded-xl border p-6 md:p-8 space-y-6" style={{ borderColor: "#d4d0c8", backgroundColor: "#f8f7f3" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] mb-2" style={{ color: "#6b6b6b" }}>Date</p>
                <p>{draft.visit_date}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] mb-2" style={{ color: "#6b6b6b" }}>Time</p>
                <p>{draft.visit_time}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] mb-2" style={{ color: "#6b6b6b" }}>Tickets</p>
                <p>{totalTickets}</p>
              </div>
            </div>

            <div className="border-t pt-5 space-y-2" style={{ borderColor: "#d4d0c8" }}>
              {lineItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm" style={{ color: "#6b6b6b" }}>
                  <span>{item.quantity} × {item.label}</span>
                  <span>ISK {item.total.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#d4d0c8" }}>
                <span className="font-medium" style={{ color: "#6b6b6b" }}>Total</span>
                <span className="text-lg font-semibold">ISK {draft.total_amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label htmlFor="customer-email" className="block text-xs uppercase tracking-[0.1em]" style={{ color: "#6b6b6b" }}>
                Email Address
              </label>
              <input
                id="customer-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full h-12 rounded-[4px] border px-4 text-sm"
                style={{ borderColor: "#d4d0c8", backgroundColor: "#f7f6f2", color: "#111111" }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#9d3c32" }}>
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="inline-flex items-center justify-center px-10 py-5 text-base font-semibold tracking-[0.06em] uppercase bg-[#f7f6f2] text-[#111111] rounded-[4px] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Confirming..." : "Confirm Booking"}
              </button>
              <Link
                href="/tickets"
                className="text-sm underline underline-offset-4"
                style={{ color: "#6b6b6b" }}
              >
                Back to tickets
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
