"use client";

/**
 * HeroVegvisir — large, translucent white Vegvísir compass stave
 * behind the hero text on the homepage. Static watermark, no rotation.
 */
export default function HeroVegvisir() {
  return (
    <>
      <style>{`
        @keyframes vegvisir-fadein {
          from { opacity: 0; }
          to   { opacity: 0.08; }
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
          transform: translateX(-50%);
          filter: invert(1) sepia(0.15) saturate(0.6) brightness(1.2);
          opacity: 0;
          animation: vegvisir-fadein 2.5s ease 0.4s forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .vegvisir-stave {
            animation: none;
            opacity: 0.08;
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
