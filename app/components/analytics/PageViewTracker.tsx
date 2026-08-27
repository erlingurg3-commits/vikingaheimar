"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendTrack, externalReferrerHost } from "@/lib/track-client";

export default function PageViewTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    sendTrack({
      type: "pageview",
      // usePathname() is string | null in Next 16; TrackPayload.path is
      // string | undefined, and the route coalesces a missing path to null.
      path: pathname ?? undefined,
      referrer_host: isFirst.current ? externalReferrerHost() : null,
    });
    isFirst.current = false;
  }, [pathname]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        sendTrack(
          { type: "ping", path: window.location.pathname },
          { beacon: true },
        );
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}
