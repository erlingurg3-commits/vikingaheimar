type BookingStep = "choose" | "details" | "confirm";

type BookingProgressProps = {
  currentStep: BookingStep;
  showDescription?: boolean;
};

const steps: Array<{ key: BookingStep; label: string }> = [
  { key: "choose", label: "Choose" },
  { key: "details", label: "Details" },
  { key: "confirm", label: "Confirm" },
];

function stepIsComplete(current: BookingStep, key: BookingStep) {
  const order: BookingStep[] = ["choose", "details", "confirm"];
  return order.indexOf(key) < order.indexOf(current);
}

function stepIsActive(current: BookingStep, key: BookingStep) {
  return current === key;
}

export default function BookingProgress({ currentStep, showDescription = true }: BookingProgressProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="space-y-3" aria-label="Booking progress">
      <div className="flex items-center gap-2" role="list" aria-label="Steps">
        {steps.map((step, index) => {
          const isActive = stepIsActive(currentStep, step.key);
          const isComplete = stepIsComplete(currentStep, step.key);

          return (
            <div key={step.key} className="flex items-center gap-2 flex-1" role="listitem">
              <div
                className={`h-8 min-w-8 px-2 rounded-full border text-xs font-semibold uppercase tracking-[0.08em] inline-flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-[#ece8df] border-[#bcb6aa] text-[#111111]"
                    : isComplete
                    ? "bg-[#f1efe8] border-[#d4d0c8] text-[#111111]"
                    : "bg-[#faf9f6] border-[#dcd7cf] text-[#6b6b6b]"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {step.label}
              </div>
              {index < steps.length - 1 && (
                <span
                  className={`h-[2px] w-full rounded-full transition-colors ${
                    currentIndex > index ? "bg-[#bcb6aa]" : "bg-[#dcd7cf]"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
      {showDescription && (
        <p className="text-sm text-[#6b6b6b]">
          {currentStep === "choose" && "Step 1 of 3: Choose your date, time, and tickets."}
          {currentStep === "details" && "Step 2 of 3: Add your guest details for confirmation."}
          {currentStep === "confirm" && "Step 3 of 3: Review your order and confirm booking."}
        </p>
      )}
    </div>
  );
}
