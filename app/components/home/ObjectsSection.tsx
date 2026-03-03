type ObjectItemProps = {
  title: "Axe" | "Sword" | "Shield";
  description: string;
};

function AxeIcon() {
  return (
    <svg
      viewBox="0 0 64 72"
      fill="none"
      stroke="#111111"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[100px] w-auto md:h-[132px] transition-[stroke-width] duration-150 md:group-hover:[stroke-width:3]"
    >
      <line x1="32" y1="70" x2="32" y2="34" />
      <path d="M 32 34 L 14 16 L 10 6 L 22 10 L 32 20" />
      <path d="M 32 34 L 50 16 L 54 6 L 42 10 L 32 20" />
    </svg>
  );
}

function SwordIcon() {
  return (
    <svg
      viewBox="0 0 64 96"
      fill="none"
      stroke="#111111"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[100px] w-auto md:h-[132px] transition-[stroke-width] duration-150 md:group-hover:[stroke-width:3]"
    >
      <line x1="32" y1="12" x2="32" y2="76" />
      <path d="M 32 6 L 28 12 L 36 12 Z" />
      <line x1="20" y1="76" x2="44" y2="76" />
      <line x1="24" y1="82" x2="40" y2="82" />
      <path d="M 32 82 L 32 92" />
      <path d="M 32 92 Q 28 90 28 86" />
      <path d="M 32 92 Q 36 90 36 86" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      stroke="#111111"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[100px] w-auto md:h-[132px] transition-[stroke-width] duration-150 md:group-hover:[stroke-width:3]"
    >
      <circle cx="36" cy="36" r="28" />
      <line x1="36" y1="8" x2="36" y2="64" />
      <line x1="8" y1="36" x2="64" y2="36" />
      <circle cx="36" cy="36" r="8" />
    </svg>
  );
}

function ObjectItem({ title, description }: ObjectItemProps) {
  return (
    <div className="group flex flex-col items-center text-center gap-4">
      {title === "Axe" && <AxeIcon />}
      {title === "Sword" && <SwordIcon />}
      {title === "Shield" && <ShieldIcon />}
      <div className="flex flex-col items-center gap-1">
        <h3 className="font-sans text-[1.25rem] leading-[1.2] tracking-[-0.01em] text-[#111111]">
          {title}
        </h3>
        <p className="font-sans text-[1rem] leading-[1.25] text-[#111111]">{description}</p>
      </div>
    </div>
  );
}

export default function ObjectsSection() {
  return (
    <section
      aria-label="Objects"
      className="w-full px-6 py-[100px] md:py-[140px]"
      style={{ backgroundColor: "#f7f6f2", color: "#111111" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 items-start justify-items-center gap-14 md:gap-12 w-full">
        <ObjectItem title="Axe" description="A tool of survival — and conquest." />
        <ObjectItem title="Sword" description="Carried across oceans." />
        <ObjectItem title="Shield" description="Protection against the unknown." />
      </div>
    </section>
  );
}