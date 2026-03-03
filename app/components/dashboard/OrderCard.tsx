"use client";

type OrderCardProps = {
  id: string;
  email: string;
  totalAmount: number;
  status: string;
  created_at: string;
  visitDate: string;
  visitTime: string;
  ticketGeneral: number;
  ticketYouth: number;
  ticketFamily: number;
};

function formatDateDDMMYYYY(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = String(parsed.getFullYear());

  return `${day}/${month}/${year}`;
}

export default function OrderCard({
  id,
  email,
  totalAmount,
  status,
  created_at,
  visitDate,
  visitTime,
  ticketGeneral,
  ticketYouth,
  ticketFamily,
}: OrderCardProps) {
  const statusConfig = {
    pending: {
      bg: "bg-amber-900/30",
      border: "border-amber-500/30",
      text: "text-amber-300",
      label: "Pending",
    },
    confirmed: {
      bg: "bg-emerald-900/30",
      border: "border-emerald-500/30",
      text: "text-emerald-300",
      label: "Confirmed",
    },
    cancelled: {
      bg: "bg-red-900/30",
      border: "border-red-500/30",
      text: "text-red-300",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] ?? {
    bg: "bg-gray-900/30",
    border: "border-gray-500/30",
    text: "text-gray-300",
    label: status,
  };
  const bookedDate = formatDateDDMMYYYY(created_at);
  const arrivalDate = visitDate ? formatDateDDMMYYYY(visitDate) : "";
  const arrivalText = [arrivalDate, visitTime].filter(Boolean).join(" · ");

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 rounded-lg transition-all duration-300 blur" />

      <div className={`relative bg-gradient-to-br from-gray-900/30 to-black/50 border ${config.border} ${config.bg} rounded-xl p-4 backdrop-blur-md transition-all duration-300 hover:from-gray-900/50 hover:to-black/60 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10`}>
        {/* Order Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-gray-300 truncate">
              {id.slice(0, 8)}...
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">{email}</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.text} whitespace-nowrap ml-2`}>
            {config.label}
          </div>
        </div>

        {/* Order Details */}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-400">Total</span>
          <span className="font-semibold text-emerald-300">
            ISK {totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Tickets */}
        {(ticketGeneral > 0 || ticketYouth > 0 || ticketFamily > 0) && (
          <div className="text-xs text-gray-400 space-y-1 mb-3 pb-3 border-t border-white/5">
            {ticketGeneral > 0 && (
              <div className="flex justify-between pt-1">
                <span>{ticketGeneral}x General</span>
              </div>
            )}
            {ticketYouth > 0 && (
              <div className="flex justify-between pt-1">
                <span>{ticketYouth}x Youth</span>
              </div>
            )}
            {ticketFamily > 0 && (
              <div className="flex justify-between pt-1">
                <span>{ticketFamily}x Family</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="space-y-1">
          {arrivalText ? (
            <p className="text-xs text-gray-300">
              Arriving: <span className="text-gray-200">{arrivalText}</span>
            </p>
          ) : null}
          <p className="text-xs text-gray-500">Booked: {bookedDate}</p>
        </div>
      </div>
    </div>
  );
}
