export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
