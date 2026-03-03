import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { OrderRow } from "@/lib/orders";

export default function ThankYou() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderRow | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem("vikingaheimar_last_order");

    if (!raw) {
      router.replace("/");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as OrderRow;
      if (!parsed?.id) {
        router.replace("/");
        return;
      }
      setOrder(parsed);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!order) return null;

  return (
    <main style={{ minHeight: "100vh", background: "#f7f6f2", color: "#111111" }}>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "96px 24px" }}>
        <h1 style={{ fontSize: 48, marginBottom: 12 }}>Thank You</h1>
        <p style={{ color: "#6b6b6b", marginBottom: 32 }}>
          Your booking is confirmed. A confirmation email has been sent to your email address.
        </p>

        <div style={{ border: "1px solid #d4d0c8", borderRadius: 12, background: "#f8f7f3", padding: 24 }}>
          <p><strong>Booking ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {order.visit_date}</p>
          <p><strong>Time:</strong> {order.visit_time}</p>
          <p><strong>General:</strong> {order.ticket_general}</p>
          <p><strong>Youth:</strong> {order.ticket_youth}</p>
          <p><strong>Family:</strong> {order.ticket_family}</p>
          <p><strong>Total Amount:</strong> ISK {order.total_amount.toLocaleString()}</p>
          <p><strong>Email:</strong> {order.customer_email}</p>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link href="/">Return Home</Link>
        </div>
      </section>
    </main>
  );
}
