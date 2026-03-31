"use client";

import Link from "next/link";
import Image from "next/image";
import type React from "react";
import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";
import NorthernLights from "@/app/components/effects/NorthernLights";

const container = "mx-auto w-full max-w-[1080px] px-8 md:px-16";

function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
  };
}

export default function ProvisionsPageClient() {
  const { ref: cafeRef, isVisible: cafeVisible } =
    useScrollReveal<HTMLDivElement>();
  const { ref: shopRef, isVisible: shopVisible } =
    useScrollReveal<HTMLDivElement>();
  const { ref: nearbyRef, isVisible: nearbyVisible } =
    useScrollReveal<HTMLDivElement>();
  const { ref: ctaRef, isVisible: ctaVisible } =
    useScrollReveal<HTMLDivElement>();

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — full viewport, warm wood texture
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#0d0c0a",
        }}
      >
        <Image
          src="/wood.jpg"
          alt="Warm wood texture of the Viking longship"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-slowZoom scale-105"
          style={{ objectPosition: "center 50%" }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,8,6,0) 0%, rgba(10,8,6,0.2) 40%, rgba(10,8,6,0.75) 75%, rgba(13,11,9,0.96) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: "100px",
            paddingLeft: "24px",
            paddingRight: "24px",
            textAlign: "center",
          }}
        >
          <p
            className="font-text hero-fade-1"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 28,
              textTransform: "uppercase",
            }}
          >
            V&Iacute;KINGAHEIMAR
          </p>

          <h1
            className="hero-fade-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(36px, 4.5vw, 64px)",
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "white",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            Feast before you sail.
          </h1>

          <p
            className="font-display hero-fade-3"
            style={{
              marginTop: "24px",
              fontSize: "clamp(14px, 1.4vw, 18px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.65)",
              maxWidth: "520px",
              lineHeight: 1.7,
            }}
          >
            Good provisions make good voyages. Refuel at our caf&eacute;, find
            your keepsake in the shop, or explore the coast nearby.
          </p>

          <Link
            href="/booking"
            className="font-text hero-fade-4"
            style={{
              marginTop: "40px",
              display: "inline-flex",
              alignItems: "center",
              background: "#c8874a",
              color: "#ffffff",
              padding: "18px 44px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              textDecoration: "none",
              transition: "background 250ms, transform 250ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b5763d";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#c8874a";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            BOOK YOUR VISIT
            <span style={{ marginLeft: 8, fontSize: 14 }}>&#8594;</span>
          </Link>

          <div
            className="hero-fade-5"
            style={{
              marginTop: "48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 1,
                height: 48,
                background: "rgba(255,255,255,0.3)",
              }}
            />
            <span
              className="font-text"
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.3)",
                marginTop: 12,
                textTransform: "uppercase",
              }}
            >
              SCROLL
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GRADIENT BRIDGE — dark hero dissolves into warm parchment
          ═══════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          height: 120,
          background:
            "linear-gradient(to bottom, #0d0c0a 0%, #2a2520 30%, #e8e4dc 70%, #f5f3ee 100%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          2. THE CAF&Eacute; — parchment, centered layout
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#f5f3ee",
          paddingTop: "clamp(80px, 10vh, 140px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div
          ref={cafeRef}
          className={container}
          style={{ maxWidth: 720, margin: "0 auto" }}
        >
          <div style={{ textAlign: "center", ...reveal(cafeVisible) }}>
            <div
              style={{
                width: 48,
                height: 1,
                background: "#c8874a",
                margin: "0 auto 48px",
              }}
            />

            <h2
              className="font-display"
              style={{
                fontSize: "clamp(36px, 4.5vw, 60px)",
                fontWeight: 300,
                color: "#1a1a1a",
                lineHeight: 1.1,
                maxWidth: 720,
                margin: "0 auto",
              }}
            >
              The longhouse table.
            </h2>

            <p
              className="font-text"
              style={{
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 1.85,
                color: "#7a7672",
                maxWidth: 520,
                margin: "32px auto 0",
              }}
            >
              Our museum caf&eacute; serves Icelandic coffee, light meals, and
              homemade pastries prepared with local ingredients. Settle into a
              warm atmosphere overlooking the museum grounds&thinsp;&mdash;&thinsp;the
              perfect pause between exhibits and exploration.
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            style={{ marginTop: 64 }}
          >
            <div
              style={{
                border: "1px solid #e2ddd7",
                borderRadius: 4,
                padding: "32px 36px",
                ...reveal(cafeVisible, 180),
              }}
            >
              <p
                className="font-text"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "#c8874a",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                HOURS
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 300,
                  color: "#1a1a1a",
                  marginBottom: 8,
                }}
              >
                10:00 &ndash; 17:30 daily
              </h3>
              <p
                className="font-text"
                style={{ fontSize: 15, color: "#7a7672", lineHeight: 1.7 }}
              >
                Last orders 30 minutes before closing
              </p>
            </div>

            <div
              style={{
                border: "1px solid #e2ddd7",
                borderRadius: 4,
                padding: "32px 36px",
                ...reveal(cafeVisible, 300),
              }}
            >
              <p
                className="font-text"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "#c8874a",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                HIGHLIGHTS
              </p>
              <ul
                className="font-text"
                style={{
                  fontSize: 15,
                  color: "#7a7672",
                  lineHeight: 2.0,
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <li>Icelandic coffee and pastries</li>
                <li>Light lunches and soups</li>
                <li>Local craft beverages</li>
                <li>Children&apos;s menu available</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. THE GIFT SHOP — three-column product grid
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#f5f3ee",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className={container}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 48,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#e2ddd7" }} />
            <span
              className="font-text"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                color: "#c8874a",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              THE GIFT SHOP
            </span>
            <div style={{ flex: 1, height: 1, background: "#e2ddd7" }} />
          </div>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 300,
              color: "#1a1a1a",
              lineHeight: 1.1,
              textAlign: "center",
              marginBottom: 64,
            }}
          >
            Carry the saga home.
          </h2>

          <div
            ref={shopRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-16"
          >
            <div
              style={{
                paddingTop: 40,
                borderTop: "1px solid #e2ddd7",
                ...reveal(shopVisible, 0),
              }}
            >
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(22px, 2.5vw, 30px)",
                  fontWeight: 400,
                  color: "#1a1a1a",
                  marginBottom: 20,
                }}
              >
                Viking Replicas
              </h3>
              <p
                className="font-text"
                style={{ fontSize: 15, lineHeight: 1.85, color: "#7a7672" }}
              >
                Handcrafted jewelry, miniature ships, and Norse tools
                &mdash;&nbsp;faithful reproductions of the artifacts that
                defined an age of exploration.
              </p>
            </div>

            <div
              style={{
                paddingTop: 40,
                borderTop: "1px solid #e2ddd7",
                ...reveal(shopVisible, 180),
              }}
            >
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(22px, 2.5vw, 30px)",
                  fontWeight: 400,
                  color: "#1a1a1a",
                  marginBottom: 20,
                }}
              >
                Icelandic Craft
              </h3>
              <p
                className="font-text"
                style={{ fontSize: 15, lineHeight: 1.85, color: "#7a7672" }}
              >
                Woolen goods, ceramic pieces, and local artisan work
                &mdash;&nbsp;each item carries the character of the land and the
                hands that shaped it.
              </p>
            </div>

            <div
              style={{
                paddingTop: 40,
                borderTop: "1px solid #e2ddd7",
                ...reveal(shopVisible, 360),
              }}
            >
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(22px, 2.5vw, 30px)",
                  fontWeight: 400,
                  color: "#1a1a1a",
                  marginBottom: 20,
                }}
              >
                Books &amp; Maps
              </h3>
              <p
                className="font-text"
                style={{ fontSize: 15, lineHeight: 1.85, color: "#7a7672" }}
              >
                Saga translations, illustrated histories, and maritime charts
                &mdash;&nbsp;the stories and routes that connected the Viking
                world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. NEARBY — two-column explore section
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#f5f3ee",
          paddingBottom: "clamp(96px, 12vh, 160px)",
        }}
      >
        <div className={container}>
          <div
            style={{
              width: "100%",
              height: 1,
              background: "#e2ddd7",
              marginBottom: 80,
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 64,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#e2ddd7" }} />
            <span
              className="font-text"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                color: "#c8874a",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              EXPLORE REYKJANESB&AElig;R
            </span>
            <div style={{ flex: 1, height: 1, background: "#e2ddd7" }} />
          </div>

          <div
            ref={nearbyRef}
            className="flex flex-col md:flex-row gap-16"
          >
            <div className="flex-1" style={reveal(nearbyVisible, 0)}>
              <p
                className="font-text"
                style={{
                  fontSize: 17,
                  fontWeight: 400,
                  lineHeight: 1.85,
                  color: "#7a7672",
                }}
              >
                V&iacute;kingaheimar sits at the heart of the Reykjanes
                peninsula&thinsp;&mdash;&thinsp;a landscape forged by volcanic
                fire and shaped by the Atlantic. From the museum, the
                surrounding coastline, geothermal areas, and the Reykjanes
                Geopark are all within easy reach. Local walking routes wind
                through the town of Reykjanesb&aelig;r, connecting harbour,
                headland, and lava field. Consider the museum your gateway to
                the region.
              </p>
            </div>

            <div className="flex-1" style={reveal(nearbyVisible, 180)}>
              {[
                { name: "Reykjanes Geopark", distance: "15 min drive" },
                { name: "Blue Lagoon", distance: "20 min drive" },
                { name: "Gunnuhver Hot Springs", distance: "15 min drive" },
                { name: "Reykjanesviti Lighthouse", distance: "20 min drive" },
              ].map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "16px 0",
                    borderBottom:
                      i < 3 ? "1px solid #e2ddd7" : "1px solid #e2ddd7",
                  }}
                >
                  <span
                    className="font-text"
                    style={{
                      fontSize: 16,
                      fontWeight: 400,
                      color: "#1a1a1a",
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    className="font-text"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "#c8874a",
                      whiteSpace: "nowrap",
                      marginLeft: 16,
                    }}
                  >
                    {item.distance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GRADIENT BRIDGE — parchment dissolves into dark
          ═══════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          height: 120,
          background:
            "linear-gradient(to bottom, #f5f3ee 0%, #e8e4dc 30%, #2a2520 70%, #0d0c0a 100%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          5. FINAL CTA — dark, NorthernLights, amber buttons
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#0d0c0a",
          position: "relative",
          overflow: "hidden",
          paddingTop: "clamp(100px, 14vh, 180px)",
          paddingBottom: "clamp(100px, 14vh, 180px)",
        }}
      >
        <NorthernLights />

        <div
          ref={ctaRef}
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
            padding: "0 32px",
          }}
        >
          <p
            className="font-text"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "rgba(200,135,74,0.70)",
              textTransform: "uppercase",
              marginBottom: 40,
              ...reveal(ctaVisible, 0),
            }}
          >
            COMPLETE YOUR JOURNEY
          </p>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: 24,
              ...reveal(ctaVisible, 100),
            }}
          >
            Provisions secured.
          </h2>

          <p
            className="font-display"
            style={{
              fontSize: "clamp(17px, 2vw, 22px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.50)",
              lineHeight: 1.6,
              ...reveal(ctaVisible, 200),
            }}
          >
            Now step aboard.
          </p>

          <div
            style={{
              marginTop: 56,
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              ...reveal(ctaVisible, 350),
            }}
          >
            <Link
              href="/booking"
              className="font-text"
              style={{
                background: "#c8874a",
                color: "#ffffff",
                padding: "18px 48px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                borderRadius: 2,
                border: "none",
                textDecoration: "none",
                transition: "background 250ms, transform 250ms",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#b5763d";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#c8874a";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              BOOK TICKETS
            </Link>

            <Link
              href="/saga"
              className="font-text"
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.65)",
                padding: "18px 48px",
                border: "1px solid rgba(255,255,255,0.20)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                borderRadius: 2,
                textDecoration: "none",
                transition: "all 250ms",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
              }}
            >
              BACK TO THE SAGA
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
