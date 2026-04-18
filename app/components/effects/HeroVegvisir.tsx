"use client";

/**
 * HeroVegvisir — large, translucent Vegvisir compass stave that sits
 * behind the hero text as a subtle watermark.
 *
 * Uses the PNG at /Vegvisir.svg.png as a CSS mask-image so the black
 * stave shapes become visible and the white background is transparent.
 * The visible area is tinted heritage amber via a radial-gradient background.
 *
 * Entrance animation: the stave "carves into existence" over ~3 seconds,
 * then drifts in an ultra-slow infinite rotation with gentle opacity breathing.
 *
 * Respects prefers-reduced-motion: skips all animation, shows static.
 * pointer-events: none — never blocks interaction.
 */
export default function HeroVegvisir() {
  return (
    <>
      <style>{`
        @keyframes vegvisir-emerge {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.85) rotate(-15deg);
          }
          50% {
            opacity: 0.06;
            transform: translate(-50%, -50%) scale(0.95) rotate(-4deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }

        @keyframes vegvisir-drift {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes vegvisir-breathe {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.09;
          }
        }

        .vegvisir-stave {
          position: absolute;
          top: 5%;
          left: 50%;
          width: 85vh;
          height: 85vh;
          pointer-events: none;
          z-index: 1;

          mask-image: url('/Vegvisir.svg.png');
          -webkit-mask-image: url('/Vegvisir.svg.png');
          mask-size: contain;
          -webkit-mask-size: contain;
          mask-repeat: no-repeat;
          -webkit-mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-position: center;

          background: radial-gradient(
            circle at center,
            rgba(212, 165, 116, 0.12) 0%,
            rgba(212, 165, 116, 0.06) 50%,
            transparent 80%
          );

          /* Phase 1+2: emerge over 3s, then hold final state */
          animation:
            vegvisir-emerge 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards,
            vegvisir-drift 120s linear 3s infinite,
            vegvisir-breathe 10s ease-in-out 3s infinite;

          transform: translate(-50%, -50%) scale(0.85) rotate(-15deg);
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .vegvisir-stave {
            animation: none;
            opacity: 0.07;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }
      `}</style>

      <div className="vegvisir-stave" aria-hidden="true" />
    </>
  );
}
