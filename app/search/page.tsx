"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Legacy /search URL: open the search modal and return to the main shell.
 * Static export friendly (no next.config redirect required).
 */
export default function SearchRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    window.dispatchEvent(new Event("lexee:open-search"));
    router.replace("/");
  }, [router]);

  return null;
}
