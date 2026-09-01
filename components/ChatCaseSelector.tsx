"use client";

import { Check, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { CASES, type CaseRecord } from "@/lib/cases";
import { JOB_SCOPE_LABELS } from "@/lib/jobs";

type ChatCaseSelectorProps = {
  selectedCaseName: string | null;
  onSelect: (caseRecord: CaseRecord) => void;
};

export function ChatCaseSelector({ selectedCaseName, onSelect }: ChatCaseSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedCase = useMemo(
    () => CASES.find((record) => record.name === selectedCaseName) ?? null,
    [selectedCaseName],
  );

  const filteredCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return CASES;
    return CASES.filter(
      (record) =>
        record.name.toLowerCase().includes(normalized) ||
        record.caseNumber.toLowerCase().includes(normalized),
    );
  }, [query]);

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
    <div
      ref={menuRef}
      className="flex items-center justify-center gap-2 px-3 py-2"
    >
      <p className="min-w-0 truncate text-[13px] leading-5 text-neutral-600">
        {selectedCase ? selectedCase.name : "No case selected"}
      </p>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-[13px] font-medium leading-5 text-violet-700 ui-t-colors hover:text-violet-900"
          aria-label="Select a case"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          Select a Case
        </button>

        <AnimatedPopover
          open={open}
          className="absolute bottom-full right-0 z-50 mb-2 w-[min(100vw-3rem,22rem)] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-2 shadow-[var(--shadow-popup)]"
        >
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-2 py-2 focus-within:ring-2 focus-within:ring-violet-300/70">
            <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cases"
              className="min-w-0 flex-1 bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          <div className="max-h-56 overflow-y-auto" role="menu">
            {filteredCases.length > 0 ? (
              filteredCases.map((record) => {
                const isActive = record.id === selectedCase?.id;
                return (
                  <button
                    key={record.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSelect(record);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={[
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left ui-t-colors",
                      isActive
                        ? "bg-violet-100 text-neutral-950"
                        : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
                    ].join(" ")}
                  >
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <span className="block truncate text-body-md-secondary">{record.name}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] leading-4 text-neutral-500">
                        <span>{record.caseNumber}</span>
                        <span aria-hidden>·</span>
                        <span>{JOB_SCOPE_LABELS[record.scope]}</span>
                      </span>
                    </span>
                    {isActive ? (
                      <Check className="h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <p className="px-2 py-2 text-[12px] leading-4 text-neutral-600">No cases found.</p>
            )}
          </div>
        </AnimatedPopover>
      </div>
    </div>
  );
}
