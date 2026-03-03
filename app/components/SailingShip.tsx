"use client";

export default function SailingShip() {
  return (
    <>
      <style jsx>{`
        @keyframes riseUp {
          0% {
            bottom: -60px;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            bottom: 30px;
            opacity: 0;
          }
        }

        .sailing-ship {
          animation: riseUp 1.2s ease-in-out forwards;
          position: fixed;
          font-size: 24px;
          white-space: nowrap;
          filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
        }
      `}</style>
      
      <svg
        className="sailing-ship"
        width="60"
        height="40"
        viewBox="0 0 60 40"
      >
        {/* Hull */}
        <path d="M 10 25 L 15 30 L 45 30 L 50 25 Z" fill="#000000" stroke="#000000" strokeWidth="1" />
        
        {/* Water line */}
        <path d="M 8 32 Q 15 34, 30 32 T 52 32" fill="none" stroke="#000000" strokeWidth="1" opacity="0.8" />
        
        {/* Mast */}
        <line x1="30" y1="25" x2="30" y2="5" stroke="#000000" strokeWidth="2" />
        
        {/* Sail */}
        <path d="M 30 8 L 45 28 L 32 28 Z" fill="#000000" stroke="#000000" strokeWidth="1" />
        <path d="M 30 12 L 25 28 L 28 28 Z" fill="#000000" stroke="#000000" strokeWidth="0.5" />
        
        {/* Flag */}
        <path d="M 30 5 L 40 8 L 38 12 Z" fill="#000000" stroke="#000000" strokeWidth="0.5" />
      </svg>
    </>
  );
}
