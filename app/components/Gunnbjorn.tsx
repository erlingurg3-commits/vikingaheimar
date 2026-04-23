"use client";

import { useEffect, useRef, useState } from "react";

/* ── colour palette (matches ScrollViking) ── */
const C = {
  skin: "#e8dcc8",
  ink: "#1a0e05",
  gold: "#c8872a",
  cyan: "#00d4ff",
  leather: "#8a5a2a",
  leatherDark: "#5a3a18",
  leatherLight: "#c8a878",
  iron: "#7a8a9a",
  ironLight: "#aabbcc",
  wool: "#4a3a28",
  woolLight: "#6a4a2a",
  linen: "#d4c8a8",
} as const;

type WarriorState = "idle" | "thinking" | "answering" | "done";

/* ═══════════════════════════════════════════════════════════
   ASSEMBLED VIKING SVG
   All 10 parts visible. No scroll gating.
   ═══════════════════════════════════════════════════════════ */
function AssembledViking({ state }: { state: WarriorState }) {
  const eyeOpacity =
    state === "thinking" ? "var(--gb-eye-pulse)" : state === "answering" ? 1 : 0.9;
  const blur = state === "thinking" ? 5 : 0;

  return (
    <svg
      viewBox="0 0 300 540"
      style={{
        width: "100%",
        height: "auto",
        maxHeight: "70vh",
        display: "block",
        margin: "0 auto",
      }}
      aria-label="Gunnbjörn — fully assembled Viking warrior"
      role="img"
    >
      <defs>
        <pattern id="gb-chainmail" width="8" height="7" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="3.5" r="3" fill="none" stroke="#9a9a8a" strokeWidth="0.8" opacity="0.5" />
          <circle cx="0" cy="0" r="3" fill="none" stroke="#9a9a8a" strokeWidth="0.8" opacity="0.5" />
          <circle cx="8" cy="0" r="3" fill="none" stroke="#9a9a8a" strokeWidth="0.8" opacity="0.5" />
          <circle cx="0" cy="7" r="3" fill="none" stroke="#9a9a8a" strokeWidth="0.8" opacity="0.5" />
          <circle cx="8" cy="7" r="3" fill="none" stroke="#9a9a8a" strokeWidth="0.8" opacity="0.5" />
        </pattern>
        <clipPath id="gb-shieldClip">
          <circle cx="35" cy="310" r="55" />
        </clipPath>
        <filter id="gb-eyeGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="150" cy="520" rx="110" ry="9" fill="#00d4ff" opacity="0.04" filter="url(#gb-eyeGlow)" />

      {/* Cloak */}
      <g>
        <path d="M 68,212 C 52,225 38,270 36,320 C 34,370 40,410 50,440 L 62,442 C 56,410 46,360 48,315 C 50,265 60,228 72,218 Z" fill="#3a2820" stroke={C.ink} strokeWidth="1.5" opacity="0.85" />
        <path d="M 232,212 C 248,225 262,270 264,320 C 266,370 260,410 250,440 L 238,442 C 244,410 254,360 252,315 C 250,265 240,228 228,218 Z" fill="#3a2820" stroke={C.ink} strokeWidth="1.5" opacity="0.85" />
        <path d="M 55,255 C 46,300 44,350 50,415" fill="none" stroke="#2a1a10" strokeWidth="1" opacity="0.35" />
        <path d="M 245,255 C 254,300 256,350 250,415" fill="none" stroke="#2a1a10" strokeWidth="1" opacity="0.35" />
      </g>

      {/* Boots */}
      <g>
        <path d="M 82,508 L 82,460 C 82,450 80,444 83,437 C 86,430 92,425 98,423 C 104,421 110,422 114,425 C 118,430 120,438 120,448 L 120,508 Z" fill={C.leather} stroke={C.ink} strokeWidth="2" />
        <rect x="78" y="506" width="46" height="8" rx="3" fill={C.leatherDark} stroke={C.ink} strokeWidth="1.5" />
        <path d="M 180,508 L 180,460 C 180,450 178,444 181,437 C 184,430 190,425 196,423 C 202,421 208,422 212,425 C 216,430 218,438 218,448 L 218,508 Z" fill={C.leather} stroke={C.ink} strokeWidth="2" />
        <rect x="176" y="506" width="46" height="8" rx="3" fill={C.leatherDark} stroke={C.ink} strokeWidth="1.5" />
      </g>

      {/* Legs */}
      <g>
        <path d="M 88,358 L 88,375 Q 105,395 150,398 Q 195,395 212,375 L 212,358 Z" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <rect x="84" y="375" width="38" height="58" rx="6" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <rect x="86" y="416" width="34" height="28" rx="4" fill="#7a5a3a" stroke={C.ink} strokeWidth="1" />
        <rect x="178" y="375" width="38" height="58" rx="6" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <rect x="180" y="416" width="34" height="28" rx="4" fill="#7a5a3a" stroke={C.ink} strokeWidth="1" />
      </g>

      {/* Torso + chain mail + belt */}
      <g className="gb-breathe">
        <path d="M 78,215 C 78,210 85,205 100,205 L 200,205 C 215,205 222,210 222,215 L 222,360 C 222,365 215,370 200,370 L 100,370 C 85,370 78,365 78,360 Z" fill={C.wool} stroke={C.ink} strokeWidth="1.5" />
        <rect x="78" y="205" width="144" height="155" rx="8" fill="url(#gb-chainmail)" opacity="0.7" />
        <rect x="78" y="205" width="144" height="155" rx="8" fill="none" stroke={C.ink} strokeWidth="2" />
        <path d="M 118,205 L 150,242 L 182,205" fill={C.linen} stroke={C.ink} strokeWidth="1.2" />
        <rect x="74" y="348" width="152" height="18" rx="3" fill="#3a2010" stroke={C.ink} strokeWidth="2" />
        <rect x="137" y="345" width="26" height="24" rx="2.5" fill={C.gold} stroke="#8a5a10" strokeWidth="1.5" />
      </g>

      {/* Left arm + shield */}
      <g>
        <ellipse cx="72" cy="220" rx="22" ry="15" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
        <rect x="42" y="232" width="32" height="38" rx="7" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <rect x="30" y="278" width="28" height="28" rx="5" fill={C.woolLight} stroke={C.ink} strokeWidth="1" />
        <path d="M 24,302 C 20,294 22,284 30,280 L 38,280 L 38,308 L 24,308 Z" fill={C.skin} stroke={C.ink} strokeWidth="1.5" />
        <g clipPath="url(#gb-shieldClip)">
          {[-42, -28, -14, 0, 14, 28, 42].map((dx, i) => (
            <rect key={i} x={35 + dx - 7} y="252" width="14" height="116" fill={i % 2 === 0 ? "#8a6a3a" : "#7a5a2a"} />
          ))}
        </g>
        <circle cx="35" cy="310" r="55" fill="none" stroke={C.iron} strokeWidth="8" />
        <circle cx="35" cy="310" r="14" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <circle key={i} cx={35 + 55 * Math.cos(a)} cy={310 + 55 * Math.sin(a)} r="2.5" fill="#8a9aaa" stroke={C.ink} strokeWidth="0.5" />
          );
        })}
      </g>

      {/* Right arm + axe */}
      <g>
        <ellipse cx="228" cy="220" rx="22" ry="15" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
        <rect x="226" y="232" width="32" height="38" rx="7" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <rect x="242" y="278" width="28" height="28" rx="5" fill={C.woolLight} stroke={C.ink} strokeWidth="1" />
        <path d="M 252,306 C 248,298 250,288 256,284 L 264,284 L 264,312 L 252,312 Z" fill={C.skin} stroke={C.ink} strokeWidth="1.5" />
        <line x1="258" y1="282" x2="258" y2="445" stroke={C.leather} strokeWidth="5" strokeLinecap="round" />
        <circle cx="258" cy="446" r="5" fill={C.leatherDark} stroke={C.ink} strokeWidth="1" />
        <path d="M 258,278 L 278,268 C 290,264 298,272 294,283 L 286,304 C 282,312 274,316 268,313 L 258,308 Z" fill={C.iron} stroke={C.ink} strokeWidth="2" />
      </g>

      {/* Head + Gjermundbu helmet */}
      <g>
        <rect x="134" y="182" width="32" height="28" rx="7" fill={C.skin} stroke={C.ink} strokeWidth="1.5" />
        <ellipse cx="150" cy="155" rx="33" ry="40" fill={C.skin} stroke={C.ink} strokeWidth="2" />
        <path d="M 114,158 C 114,122 130,96 150,90 C 170,96 186,122 186,158" fill={C.iron} stroke={C.ink} strokeWidth="2" />
        <path d="M 114,158 L 186,158" stroke={C.ink} strokeWidth="3.5" />
        <line x1="150" y1="90" x2="150" y2="138" stroke={C.ink} strokeWidth="2.5" />
        <line x1="150" y1="138" x2="150" y2="172" stroke={C.ink} strokeWidth="3.5" />
        <path d="M 126,158 C 126,148 132,142 140,142 C 148,142 150,148 150,154" fill="none" stroke={C.ink} strokeWidth="3" />
        <path d="M 150,154 C 150,148 152,142 160,142 C 168,142 174,148 174,158" fill="none" stroke={C.ink} strokeWidth="3" />
      </g>

      {/* Face + eyes */}
      <g>
        <ellipse cx="138" cy="154" rx="5.5" ry="4.5" fill="#0a0a0a" />
        <ellipse cx="162" cy="154" rx="5.5" ry="4.5" fill="#0a0a0a" />
        <g filter={state === "thinking" ? "url(#gb-eyeGlow)" : undefined}>
          <circle cx="138" cy="154" r="2.8" fill={C.cyan} style={{ opacity: eyeOpacity as number | string }} />
          <circle cx="162" cy="154" r="2.8" fill={C.cyan} style={{ opacity: eyeOpacity as number | string }} />
        </g>
        {/* Beard */}
        <path d="M 123,172 C 120,184 118,200 122,218 C 126,230 136,238 150,242 C 164,238 174,230 178,218 C 182,200 180,184 177,172" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.5" />
        <path d="M 136,225 L 133,246 L 139,246 Z" fill="#7a5a2a" stroke={C.ink} strokeWidth="0.8" />
        <path d="M 164,225 L 167,246 L 161,246 Z" fill="#7a5a2a" stroke={C.ink} strokeWidth="0.8" />
        {/* Brooch on cloak */}
        <circle cx="150" cy="200" r="11" fill="none" stroke={C.gold} strokeWidth="2.8" />
        <circle cx="150" cy="189" r="2.5" fill={C.gold} stroke={C.ink} strokeWidth="0.5" />
      </g>

      {/* Thinking dots near mouth */}
      {state === "thinking" && (
        <g>
          <circle cx="142" cy="258" r="1.6" fill={C.gold}>
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin="0s" />
          </circle>
          <circle cx="150" cy="258" r="1.6" fill={C.gold}>
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
          </circle>
          <circle cx="158" cy="258" r="1.6" fill={C.gold}>
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin="0.8s" />
          </circle>
        </g>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   TYPEWRITER
   ═══════════════════════════════════════════════════════════ */
function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        i++;
        setDisplayed(text.slice(0, i));
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="gb-cursor">|</span>}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   GUNNBJÖRN COMPONENT
   ═══════════════════════════════════════════════════════════ */
type Message = {
  role: "user" | "gunnbjorn";
  content: string;
  timestamp: Date;
};

const SUGGESTED_POOLS = [
  [
    "What is the Íslendingur?",
    "Did Vikings really reach America?",
    "What should I not miss here?",
  ],
  [
    "Is there a gift shop?",
    "How do I get there from the airport?",
    "Did Vikings really have horned helmets?",
  ],
  [
    "Where can I eat at the museum?",
    "Is it wheelchair accessible?",
    "How much does entry cost?",
  ],
  [
    "Can I book a group visit?",
    "Who built the Íslendingur?",
    "What did Viking women do?",
  ],
  [
    "What are the opening hours?",
    "Tell me about the sagas.",
    "Is there free parking?",
  ],
];

export default function Gunnbjorn() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [warriorState, setWarriorState] = useState<WarriorState>("idle");
  const [suggestionRound, setSuggestionRound] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function askGunnbjorn(question: string) {
    if (!question.trim() || isThinking) return;

    const userMsg: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    const placeholder: Message = {
      role: "gunnbjorn",
      content: "...",
      timestamp: new Date(),
    };

    const priorHistory = messages.slice(-6).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setIsThinking(true);
    setWarriorState("thinking");
    setSuggestionRound((r) => (r + 1) % SUGGESTED_POOLS.length);

    try {
      const res = await fetch("/api/gunnbjorn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history: priorHistory }),
      });

      const { answer } = await res.json();

      setWarriorState("answering");
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "gunnbjorn",
          content: answer,
          timestamp: new Date(),
        };
        return updated;
      });

      const total = (answer?.length ?? 0) * 18;
      setTimeout(() => setWarriorState("done"), total + 500);
      setTimeout(() => setWarriorState("idle"), total + 1500);
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "gunnbjorn",
          content: "The fire burns low. Ask again.",
          timestamp: new Date(),
        };
        return updated;
      });
      setWarriorState("idle");
    } finally {
      setIsThinking(false);
    }
  }

  const lastGunnbjornIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "gunnbjorn") return i;
    }
    return -1;
  })();

  return (
    <section
      style={{
        background: "#080808",
        padding: "100px 0 80px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          flexWrap: "wrap",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* LEFT — warrior */}
        <div
          className="gb-warrior-col"
          style={{
            flex: "1 1 380px",
            minWidth: 260,
            maxWidth: 480,
            position: "relative",
          }}
        >
          {/* Floating runes */}
          <span className="gb-rune gb-rune-1" aria-hidden="true">ᚠ</span>
          <span className="gb-rune gb-rune-2" aria-hidden="true">ᚱ</span>
          <span className="gb-rune gb-rune-3" aria-hidden="true">ᛏ</span>
          <span className="gb-rune gb-rune-4" aria-hidden="true">ᛟ</span>
          <AssembledViking state={warriorState} />
        </div>

        {/* RIGHT — interaction */}
        <div style={{ flex: "1 1 520px", minWidth: 280 }}>
          <span
            className="font-display"
            style={{
              fontSize: "0.65rem",
              color: "#d4a843",
              letterSpacing: "0.35em",
              display: "block",
              marginBottom: 18,
            }}
          >
            GUNNBJÖRN — GUARDIAN OF VÍKINGAHEIMAR
          </span>

          <h2
            className="font-display"
            style={{
              fontSize: "2rem",
              color: "#e8dcc8",
              lineHeight: 1.2,
              fontWeight: 400,
              marginBottom: 18,
            }}
          >
            He knows these walls.
          </h2>

          <p
            className="font-text"
            style={{
              fontSize: "0.9rem",
              color: "#6a6050",
              lineHeight: 1.7,
              maxWidth: 420,
              marginBottom: 8,
            }}
          >
            Gunnbjörn carries the knowledge of every exhibit, every artifact,
            and every panel in this museum. Ask him what you want to understand
            before you arrive. He speaks only of what is here — nothing more,
            nothing beyond these walls.
          </p>

          <p
            className="font-text"
            style={{
              fontSize: "0.72rem",
              color: "#4a4038",
              fontStyle: "italic",
              marginTop: 8,
              marginBottom: 28,
              maxWidth: 420,
            }}
          >
            Gunnbjörn&apos;s knowledge comes from Víkingaheimar&apos;s exhibits and
            panels only. His answers are a preview — the full story waits
            for you here in Njarðvík.
          </p>

          {/* Conversation container */}
          <div
            style={{
              background: "#0d0d0d",
              border: "1px solid #1a1a1a",
              borderRadius: 2,
              minHeight: 320,
              maxHeight: 480,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              ref={scrollRef}
              className="gb-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                minHeight: 200,
              }}
            >
              {messages.length === 0 && (
                <p
                  className="font-text"
                  style={{
                    color: "#3a3028",
                    fontSize: "0.78rem",
                    fontStyle: "italic",
                    textAlign: "center",
                    marginTop: 40,
                  }}
                >
                  The warrior waits. Ask him what you would know.
                </p>
              )}

              {messages.map((msg, i) => {
                if (msg.role === "user") {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                      <div style={{ maxWidth: "80%" }}>
                        <div
                          className="font-text"
                          style={{
                            background: "#1a1a1a",
                            borderRadius: "8px 8px 0 8px",
                            padding: "10px 14px",
                            fontSize: "0.85rem",
                            color: "#c8c0b0",
                          }}
                        >
                          {msg.content}
                        </div>
                        <div
                          style={{
                            fontSize: "0.6rem",
                            color: "#3a3028",
                            textAlign: "right",
                            marginTop: 3,
                          }}
                        >
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                }

                const isThinkingBubble = msg.content === "...";
                const isLatest = i === lastGunnbjornIndex;

                return (
                  <div
                    key={i}
                    style={{
                      borderLeft: "2px solid #d4a843",
                      padding: "10px 14px",
                      marginBottom: 16,
                      maxWidth: "90%",
                    }}
                  >
                    <div
                      className="font-display"
                      style={{
                        fontSize: "0.55rem",
                        color: "#d4a843",
                        letterSpacing: "0.25em",
                        marginBottom: 4,
                      }}
                    >
                      GUNNBJÖRN
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: "0.85rem",
                        color: "#e8dcc8",
                        lineHeight: 1.6,
                      }}
                    >
                      {isThinkingBubble ? (
                        <span className="gb-thinking-dots">
                          <span>᛫</span>
                          <span>᛫</span>
                          <span>᛫</span>
                        </span>
                      ) : isLatest ? (
                        <TypewriterText text={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                askGunnbjorn(input);
              }}
              style={{
                borderTop: "1px solid #1a1a1a",
                padding: "16px 20px",
                background: "#0a0a0a",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gunnbjörn..."
                disabled={isThinking}
                className="font-display gb-input"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid #2a2a2a",
                  color: "#e8dcc8",
                  fontSize: "0.85rem",
                  padding: "8px 0",
                  outline: "none",
                  transition: "border-color 300ms",
                }}
              />
              <button
                type="submit"
                disabled={isThinking || !input.trim()}
                className="font-display"
                style={{
                  background: "transparent",
                  border: "1px solid #d4a843",
                  color: "#d4a843",
                  padding: "8px 20px",
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  borderRadius: 1,
                  cursor: isThinking ? "not-allowed" : "pointer",
                  opacity: isThinking || !input.trim() ? 0.4 : 1,
                  transition: "background 200ms",
                }}
                onMouseEnter={(e) => {
                  if (!isThinking) e.currentTarget.style.background = "#d4a84320";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ASK
              </button>
            </form>
          </div>

          {/* Suggested questions — cycle through pools */}
          {!isThinking && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {SUGGESTED_POOLS[suggestionRound].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => askGunnbjorn(q)}
                  className="font-display gb-pill"
                  style={{
                    border: "1px solid #2a2a2a",
                    padding: "6px 14px",
                    fontSize: "0.65rem",
                    color: "#5a5040",
                    background: "transparent",
                    borderRadius: 1,
                    cursor: "pointer",
                    transition: "all 300ms",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        :root {
          --gb-eye-pulse: 0.9;
        }
        @keyframes gbEyePulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes gbCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes gbBreathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        @keyframes gbRuneDrift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gbDot {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .gb-breathe { animation: gbBreathe 4s ease-in-out infinite; transform-origin: center; }
        .gb-cursor { display: inline-block; margin-left: 1px; animation: gbCursorBlink 600ms step-end infinite; color: #d4a843; }
        .gb-rune {
          position: absolute;
          font-family: var(--font-display, 'Norse', serif);
          font-size: 4rem;
          color: #c8c0b0;
          opacity: 0.06;
          pointer-events: none;
          user-select: none;
        }
        .gb-rune-1 { top: 4%; left: 2%; animation: gbRuneDrift 12s ease-in-out infinite; }
        .gb-rune-2 { top: 6%; right: 4%; animation: gbRuneDrift 15s ease-in-out infinite; }
        .gb-rune-3 { bottom: 10%; left: 4%; animation: gbRuneDrift 18s ease-in-out infinite; }
        .gb-rune-4 { bottom: 8%; right: 2%; animation: gbRuneDrift 14s ease-in-out infinite; }
        .gb-input::placeholder { color: #3a3028; }
        .gb-input:focus { border-bottom-color: #d4a843 !important; }
        .gb-pill:hover { border-color: #d4a843 !important; color: #d4a843 !important; }
        .gb-thinking-dots span {
          display: inline-block;
          font-size: 1.5rem;
          color: #d4a843;
          margin: 0 3px;
          animation: gbDot 1.2s ease-in-out infinite;
        }
        .gb-thinking-dots span:nth-child(2) { animation-delay: 0.3s; }
        .gb-thinking-dots span:nth-child(3) { animation-delay: 0.6s; }
        .gb-scroll::-webkit-scrollbar { width: 6px; }
        .gb-scroll::-webkit-scrollbar-track { background: #0a0a0a; }
        .gb-scroll::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        @media (max-width: 767px) {
          .gb-warrior-col { max-width: 260px !important; margin: 0 auto; }
          .gb-warrior-col svg { max-height: 38vh !important; }
        }
      `}</style>
    </section>
  );
}
