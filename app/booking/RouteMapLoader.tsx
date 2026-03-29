"use client";

import dynamic from "next/dynamic";

const IslendingurRouteMap = dynamic(
  () => import("@/app/components/IslendingurRouteMap"),
  { ssr: false },
);

export default function RouteMapLoader() {
  return <IslendingurRouteMap />;
}
