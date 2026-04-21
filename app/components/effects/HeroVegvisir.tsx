"use client";

/**
 * HeroVegvisir — large, translucent white Vegvísir compass stave
 * behind the hero text. The source PNG is black-on-white; CSS filter
 * inverts it to white so it glows softly against the dark hero.
 *
 * Entrance: "carved into existence" over 3s, then ultra-slow drift.
 * pointer-events: none — never blocks interaction.
 */
export default function HeroVegvisir() {
  return (
    <>
      <style>{`
        @keyframes vegvisir-emerge {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.85) rotate(-15deg);
          }
          50% {
            opacity: 0.06;
            transform: translateX(-50%) scale(0.95) rotate(-4deg);
          }
          100% {
            opacity: 0.12;
            transform: translateX(-50%) scale(1) rotate(0deg);
          }
        }

        @keyframes vegvisir-drift {
          from { transform: translateX(-50%) rotate(0deg); }
          to   { transform: translateX(-50%) rotate(360deg); }
        }

        @keyframes vegvisir-breathe {
          0%, 100% { opacity: 0.08; }
          50%      { opacity: 0.14; }
        }

        .vegvisir-stave {
          position: absolute;
          top: 5%;
          left: 50%;
          width: 85vh;
          height: 85vh;
          pointer-events: none;
          z-index: 1;
          object-fit: contain;

          /* Invert black→white, then tint slightly warm */
          filter: invert(1) sepia(0.15) saturate(0.6) brightness(1.2);

          opacity: 0;
          transform: translateX(-50%) scale(0.85) rotate(-15deg);

          animation:
            vegvisir-emerge 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards,
            vegvisir-drift 120s linear 3s infinite,
            vegvisir-breathe 10s ease-in-out 3s infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .vegvisir-stave {
            animation: none;
            opacity: 0.10;
            transform: translateX(-50%) scale(1) rotate(0deg);
          }
        }
      `}</style>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="vegvisir-stave"
        src="/Vegvisir.svg.png"
        alt=""
        aria-hidden="true"
      />
    </>
  );
}
