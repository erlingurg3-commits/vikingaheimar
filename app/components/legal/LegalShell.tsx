import type { ReactNode } from "react";

const BG = "#09090f";
const GOLD = "#b8962e";
const CREAM = "#e8dcc8";
const PANEL = "#13131e";
const RULE = "rgba(184,150,46,0.25)";

export function LegalShell({
  title,
  lastUpdated,
  intro,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main style={{ backgroundColor: BG, color: CREAM, minHeight: "100vh" }}>
      <div
        className="mx-auto px-5 sm:px-8"
        style={{ maxWidth: 780, paddingTop: 96, paddingBottom: 120 }}
      >
        <header style={{ marginBottom: 40 }}>
          <h1
            className="font-display"
            style={{
              fontWeight: 400,
              color: CREAM,
              fontSize: "clamp(30px, 4.2vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              marginBottom: 12,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            Last updated: {lastUpdated}
          </p>
          {intro ? (
            <div
              style={{
                marginTop: 24,
                fontSize: 15,
                lineHeight: 1.75,
                color: "rgba(232,220,200,0.85)",
              }}
            >
              {intro}
            </div>
          ) : null}
        </header>

        <div
          style={{
            backgroundColor: PANEL,
            border: `1px solid ${RULE}`,
            borderRadius: 4,
            padding: "36px 32px",
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginTop: 36 }} className="first:mt-0">
      <h2
        className="font-display"
        style={{
          fontWeight: 400,
          color: GOLD,
          fontSize: "clamp(20px, 2.4vw, 26px)",
          letterSpacing: "0.02em",
          marginBottom: 14,
        }}
      >
        {heading}
      </h2>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: "rgba(232,220,200,0.88)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function LegalTodo({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "8px 0",
        padding: "10px 14px",
        borderLeft: `3px solid ${GOLD}`,
        backgroundColor: "rgba(184,150,46,0.06)",
        color: "rgba(232,220,200,0.75)",
        fontSize: 14,
        fontStyle: "italic",
      }}
    >
      <strong style={{ color: GOLD, fontStyle: "normal", letterSpacing: "0.08em" }}>
        TODO —
      </strong>{" "}
      {children}
    </p>
  );
}
