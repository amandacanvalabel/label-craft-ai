"use client";

import { useEffect } from "react";

// Fires once per browser session — avoids counting reloads as new views
export default function TrackPageView() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "cl_tracked_home";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/track/view", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
