import type { ReactNode } from "react";

type DeckCardProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function DeckCard({ title, children, footer, className }: DeckCardProps) {
  return (
    <section
      className={`group relative overflow-hidden rounded-xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/80 via-[#14263b]/65 to-[#0f2238]/80 p-3 lg:p-4 shadow-[inset_0_1px_0_rgba(125,211,252,0.06)] transition-all duration-300 hover:border-emerald-300/35 hover:shadow-[0_0_24px_rgba(74,222,128,0.18),inset_0_1px_0_rgba(125,211,252,0.1)] ${className ?? ""}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-emerald-300/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <header className="mb-3">
        <h2 className="text-xs font-medium tracking-wide text-cyan-100/90">{title}</h2>
      </header>
      <div className="space-y-3">{children}</div>
      {footer ? <footer className="mt-3">{footer}</footer> : null}
    </section>
  );
}
