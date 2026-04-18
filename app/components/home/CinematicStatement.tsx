export default function CinematicStatement() {
  return (
    <section
      aria-label="Cinematic statement"
      className="w-full min-h-[60vh] flex items-center justify-center px-6 py-[120px] lg:py-[180px]"
      style={{ backgroundColor: "#0f0f0f", color: "#ffffff" }}
    >
      <h2
        className="font-display font-normal text-center leading-[1.15] tracking-[-0.01em]"
        style={{ fontSize: "clamp(1.75rem, 4.3vw, 3.8rem)" }}
      >
        <span className="block whitespace-nowrap">Enter the Viking World.</span>
        <span className="block whitespace-nowrap">Where exploration began.</span>
      </h2>
    </section>
  );
}