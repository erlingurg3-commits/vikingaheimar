export const ROUTES = {
  home: "/",
  saga: "/saga",
  experience: "/experience",
  visit: "/visit",
  tickets: "/tickets",
  booking: "/booking",
  checkout: "/checkout",
  thankYou: "/thank-you",
  vikings: "/vikings",
  groups: "/groups",
  groupsRequest: "/groups/request",
  about: "/about",
  admin: "/admin",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[RouteKey];
