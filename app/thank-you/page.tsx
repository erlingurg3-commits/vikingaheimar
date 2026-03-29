"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import Container from "@/app/components/primitives/Container";
import type { OrderRow } from "@/lib/orders";
import BookingProgress from "@/app/components/tickets/BookingProgress";

export default function ThankYouPage() {
  const router = useRouter();
  const [bookingIdFromUrl, setBookingIdFromUrl] = useState("");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBookingIdFromUrl(params.get("id") ?? "");

    const raw = sessionStorage.getItem("vikingaheimar_last_order");
    if (!raw) {
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as OrderRow;
      setOrder(parsed);
    } catch {
      setOrder(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!order && !bookingIdFromUrl) {
      router.replace("/");
    }
  }, [hydrated, order, bookingIdFromUrl, router]);

  const bookingId = order?.id || bookingIdFromUrl || "—";

  if (!hydrated || (!order && !bookingIdFromUrl)) {
    return (
      <main className="min-h-screen w-full bg-[#f7f6f2] text-[#111111]">
        <section className="pt-24 pb-10 md:pt-32">
          <Container size="xl" className="max-w-[820px]">
            <div className="space-y-4 rounded-xl border border-[#d4d0c8] bg-[#f8f7f3] p-6">
              <div className="h-8 w-48 animate-pulse rounded bg-[#ece8df]" />
              <div className="h-20 w-full animate-pulse rounded bg-[#ece8df]" />
            </div>
          </Container>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#f7f6f2] text-[#111111]">
      <section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <Container size="xl" className="max-w-[820px] space-y-8 text-center">
          <h1 className="font-display text-[36px] font-semibold leading-tight md:text-[56px]">Booking Confirmed</h1>
          <BookingProgress currentStep="confirm" />

          <div className="booking-success-pop rounded-xl border border-[#d4d0c8] bg-[#f8f7f3] p-6 md:p-8 text-left">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#2f7d44]">
              <CircleCheckBig size={18} aria-hidden="true" />
              Success! Your booking is complete.
            </p>

            <div className="mt-5 rounded-lg border border-[#d4d0c8] bg-[#f7f6f2] p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-[#6b6b6b]">Booking Reference</p>
              <p className="mt-1 break-all text-lg font-semibold">{bookingId}</p>
            </div>

            <p className="mt-4 text-base text-[#6b6b6b]">A confirmation email has been sent with your booking details.</p>

            {order && (
              <>
                <div className="mt-6 grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-[#6b6b6b]">Date</p>
                    <p className="mt-1">{order.visit_date}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-[#6b6b6b]">Time</p>
                    <p className="mt-1">{order.visit_time}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-[#6b6b6b]">Email</p>
                    <p className="mt-1 break-all">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-[#6b6b6b]">Total</p>
                    <p className="mt-1">ISK {order.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#d4d0c8] pt-4 text-sm text-[#6b6b6b]">
                  {order.ticket_general > 0 && <p>{order.ticket_general} × General Admission</p>}
                  {order.ticket_youth > 0 && <p>{order.ticket_youth} × Youth (6–17)</p>}
                  {order.ticket_family > 0 && <p>{order.ticket_family} × Family Admission</p>}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#d4d0c8] bg-[#f7f6f2] px-8 py-3 text-base font-semibold uppercase tracking-[0.06em] text-[#111111] transition hover:bg-[#ece8df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:bg-[#e2ddd4]"
            >
              Return to homepage
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
