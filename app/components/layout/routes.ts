import { ROUTES, type AppRoute } from "@/lib/site-routes";

export type NavItem = {
  label: string;
  href: AppRoute;
};

export const NAV_LINKS: NavItem[] = [
  { label: "Experience", href: ROUTES.experience },
  { label: "Plan Visit", href: ROUTES.visit },
  { label: "Tickets", href: ROUTES.tickets },
  { label: "Groups", href: ROUTES.groups },
  { label: "About", href: ROUTES.about },
];

export const DESKTOP_CTAS: NavItem[] = [
  { label: "Book Tickets", href: ROUTES.tickets },
  { label: "Plan Visit", href: ROUTES.visit },
];

export const MOBILE_QUICK_CTAS: NavItem[] = [
  { label: "Book Tickets", href: ROUTES.tickets },
  { label: "Plan Visit", href: ROUTES.visit },
  { label: "Groups", href: ROUTES.groups },
];
