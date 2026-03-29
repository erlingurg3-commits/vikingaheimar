"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const maxScroll = doc.scrollHeight - doc.clientHeight;
        const nextProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        setProgress(Math.min(1, Math.max(0, nextProgress)));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[1100] h-[2px] pointer-events-none bg-transparent">
      <div
        className="h-full origin-left transition-transform duration-100 motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})`, backgroundColor: "rgba(200,135,74,0.70)" }}
      />
    </div>
  );
}
