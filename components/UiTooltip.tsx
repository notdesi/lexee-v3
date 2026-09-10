"use client";

import type { ReactNode } from "react";

type UiTooltipProps = {
  label: string;
  shortcut?: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

export function formatModShortcut(key: string): string {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  return `${isMac ? "⌘" : "Ctrl+"}${key.toUpperCase()}`;
}

export function UiTooltip({
  label,
  shortcut,
  children,
  side = "top",
  className,
}: UiTooltipProps) {
  const sideClass =
    side === "bottom"
      ? "top-full mt-1.5"
      : "bottom-full mb-1.5";

  return (
    <span className={["group/tooltip relative inline-flex", className].filter(Boolean).join(" ")}>
      {children}
      <span
        role="tooltip"
        className={[
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2",
          sideClass,
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1",
          "text-[11px] font-medium leading-4 text-neutral-50 shadow-[var(--shadow-popup)]",
          "opacity-0 ui-t-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
        ].join(" ")}
      >
        <span>{label}</span>
        {shortcut ? (
          <kbd className="rounded bg-neutral-700 px-1 py-px font-inter text-[10px] font-medium tracking-wide text-neutral-200">
            {shortcut}
          </kbd>
        ) : null}
      </span>
    </span>
  );
}
