import { ROUTES } from "@/lib/site-routes";

const configuredExternalUrl =
  process.env.NEXT_PUBLIC_TICKETING_URL?.trim() ?? "";

export const TICKETING_CONFIG = {
  externalUrl: configuredExternalUrl,
  usesExternalCheckout: configuredExternalUrl.length > 0,
} as const;

export function getBookTicketsLink() {
  if (TICKETING_CONFIG.usesExternalCheckout) {
    return {
      href: TICKETING_CONFIG.externalUrl,
      isExternal: true,
      target: "_blank" as const,
      rel: "noopener noreferrer",
    };
  }

  return {
    href: ROUTES.tickets,
    isExternal: false,
    target: undefined,
    rel: undefined,
  };
}
