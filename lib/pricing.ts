// Single source of truth for public ticket pricing.
// When the adult rate changes, update ADULT_PRICE_ISK.

export const ADULT_PRICE_ISK = 3420;

export type PricingLocale = "en" | "is";

const LOCALE_MAP: Record<PricingLocale, string> = {
  en: "en-US",
  is: "is-IS",
};

export function formatIsk(amount: number, locale: PricingLocale = "en"): string {
  return amount.toLocaleString(LOCALE_MAP[locale]);
}

export function getAdultPriceLabel(locale: PricingLocale = "en"): string {
  return `${formatIsk(ADULT_PRICE_ISK, locale)} ISK`;
}
