export const ROUTES = {
  home: "/",
  experience: "/experience",
  visit: "/visit",
  tickets: "/tickets",
  checkout: "/checkout",
  thankYou: "/thank-you",
  groups: "/groups",
  groupsRequest: "/groups/request",
  about: "/about",
  admin: "/admin",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[RouteKey];
