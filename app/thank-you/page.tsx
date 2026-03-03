"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import Container from "@/app/components/primitives/Container";
import type { OrderRow } from "@/lib/orders";

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
    return null;
  }

  return (
    <main className="w-full min-h-screen" style={{ backgroundColor: "#f7f6f2", color: "#111111" }}>
      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <Container size="xl" className="max-w-[820px] text-center space-y-8">
          <h1 className="font-display font-extrabold tracking-[-0.01em] text-[40px] md:text-[56px]" style={{ lineHeight: 1.03 }}>
            Thank You
          </h1>
          <p className="inline-flex items-center justify-center gap-2 text-sm font-medium" style={{ color: "#2f7d44" }}>
            <CircleCheckBig size={18} aria-hidden="true" />
            Booking Confirmed
          </p>
          <p className="text-base" style={{ color: "#6b6b6b" }}>
            Your booking is confirmed. A confirmation email has been sent to your email address.
          </p>

          <div className="rounded-xl border p-6 md:p-8 text-left space-y-5" style={{ borderColor: "#d4d0c8", backgroundColor: "#f8f7f3" }}>
            <div>
              <p className="text-xs uppercase tracking-[0.1em]" style={{ color: "#6b6b6b" }}>Booking ID</p>
              <p className="mt-1 font-medium break-all">{bookingId}</p>
            </div>

            {order && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em]" style={{ color: "#6b6b6b" }}>Date</p>
                    <p className="mt-1">{order.visit_date}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em]" style={{ color: "#6b6b6b" }}>Time</p>
                    <p className="mt-1">{order.visit_time}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em]" style={{ color: "#6b6b6b" }}>Email</p>
                    <p className="mt-1 break-all">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em]" style={{ color: "#6b6b6b" }}>Total</p>
                    <p className="mt-1">ISK {order.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4 text-sm space-y-1" style={{ borderColor: "#d4d0c8", color: "#6b6b6b" }}>
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
              className="inline-flex items-center justify-center px-10 py-5 text-base font-semibold tracking-[0.06em] uppercase bg-[#f7f6f2] text-[#111111] rounded-[4px] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
            >
              Return to Homepage
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
