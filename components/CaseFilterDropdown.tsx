"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { CASES } from "@/lib/cases";
import {
  countDocumentsByCase,
  DOCUMENTS,
  type DocumentCaseFilter,
  type DocumentStatus,
} from "@/lib/documents";

type CaseFilterDropdownProps = {
  value: DocumentCaseFilter;
  onChange: (value: DocumentCaseFilter) => void;
  status?: DocumentStatus;
};

export function CaseFilterDropdown({ value, onChange, status }: CaseFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const caseCounts = useMemo(() => countDocumentsByCase(DOCUMENTS, status), [status]);
  const totalCounts = useMemo(() => countDocumentsByCase(DOCUMENTS), []);

  const options = useMemo(() => {
    // Keyed off the unscoped totals so the option list stays stable as the
    // status tab changes and the current selection can never disappear.
    const entries: { value: DocumentCaseFilter; label: string; count: number }[] = [
      { value: "all", label: "All cases", count: caseCounts.all },
      ...CASES.filter((record) => (totalCounts[record.id] ?? 0) > 0).map((record) => ({
        value: record.id,
        label: record.name,
        count: caseCounts[record.id] ?? 0,
      })),
    ];

    if (totalCounts.unassigned > 0) {
      entries.push({
        value: "unassigned",
        label: "No case",
        count: caseCounts.unassigned,
      });
    }

    return entries;
  }, [caseCounts, totalCounts]);

  const activeLabel = options.find((option) => option.value === value)?.label ?? "All cases";

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Filter documents by case"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
      >
        <span className="max-w-[14rem] truncate">{activeLabel}</span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-neutral-500 ui-t-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          strokeWidth={1.75}
        />
      </button>

      <AnimatedPopover
        open={open}
        className="absolute right-0 top-full z-50 mt-1.5 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
      >
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={[
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-body-md-secondary ui-t-colors",
                isActive
                  ? "bg-violet-100 text-neutral-950"
                  : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
              ].join(" ")}
            >
              <span className="min-w-0 flex-1 truncate">
                {option.label} ({option.count})
              </span>
              {isActive ? (
                <Check className="h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
              ) : null}
            </button>
          );
        })}
      </AnimatedPopover>
    </div>
  );
}
