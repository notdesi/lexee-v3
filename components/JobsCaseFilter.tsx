"use client";

import { Check, ChevronDown, Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { CASES } from "@/lib/cases";
import {
  EMPTY_CASE_FILTER,
  isCaseFilterActive,
  type JobCaseFilterState,
} from "@/lib/jobs";

type JobsCaseFilterProps = {
  value: JobCaseFilterState;
  onChange: (value: JobCaseFilterState) => void;
};

function selectedCount(value: JobCaseFilterState): number {
  return value.caseIds.length + (value.includeUnassigned ? 1 : 0);
}

export function JobsCaseFilter({ value, onChange }: JobsCaseFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const active = isCaseFilterActive(value);
  const count = selectedCount(value);

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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const toggleCase = (caseId: string) => {
    onChange({
      ...value,
      caseIds: value.caseIds.includes(caseId)
        ? value.caseIds.filter((id) => id !== caseId)
        : [...value.caseIds, caseId],
    });
  };

  const toggleUnassigned = () => {
    onChange({ ...value, includeUnassigned: !value.includeUnassigned });
  };

  const removeCase = (caseId: string) => {
    onChange({ ...value, caseIds: value.caseIds.filter((id) => id !== caseId) });
  };

  const removeUnassigned = () => {
    onChange({ ...value, includeUnassigned: false });
  };

  const clearAll = () => {
    onChange(EMPTY_CASE_FILTER);
    setQuery("");
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={[
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] leading-4 ui-t-colors",
            active
              ? "border-neutral-300 bg-neutral-100 text-neutral-900"
              : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950",
          ].join(" ")}
          aria-label="Filter jobs by case"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Filter className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span>Cases</span>
          {active ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-200 px-1 text-[10px] font-medium leading-none text-neutral-700">
              {count}
            </span>
          ) : null}
          <ChevronDown
            className={[
              "h-3.5 w-3.5 shrink-0 text-neutral-500 ui-t-transform",
              open ? "rotate-180" : "",
            ].join(" ")}
            strokeWidth={1.75}
          />
        </button>

        <AnimatedPopover
          open={open}
          className="absolute left-0 z-50 mt-1.5 w-[min(320px,calc(100vw-2rem))] rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 p-2 shadow-[var(--shadow-popup)]"
        >
          <div className="mb-2 flex items-center gap-2 rounded-md border border-[color:var(--chat-outline)] bg-[var(--background)] px-2 py-1.5 focus-within:ring-2 focus-within:ring-violet-300/70">
            <Search className="h-3.5 w-3.5 shrink-0 text-neutral-500" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or number"
              className="w-full bg-transparent text-[13px] leading-5 text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          <div className="max-h-48 overflow-y-auto" role="listbox" aria-multiselectable="true">
            <button
              type="button"
              role="option"
              aria-selected={value.includeUnassigned}
              onClick={toggleUnassigned}
              className={[
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] leading-5 ui-t-colors",
                value.includeUnassigned
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
                  value.includeUnassigned
                    ? "border-neutral-400 bg-neutral-700 text-white"
                    : "border-neutral-300 bg-[var(--background)]",
                ].join(" ")}
              >
                {value.includeUnassigned ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                ) : null}
              </span>
              <span className="min-w-0 flex-1 truncate">No case</span>
            </button>

            {filteredCases.length > 0 ? (
              filteredCases.map((record) => {
                const selected = value.caseIds.includes(record.id);
                return (
                  <button
                    key={record.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggleCase(record.id)}
                    className={[
                      "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left ui-t-colors",
                      selected
                        ? "bg-neutral-100 text-neutral-950"
                        : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
                        selected
                          ? "border-neutral-400 bg-neutral-700 text-white"
                          : "border-neutral-300 bg-[var(--background)]",
                      ].join(" ")}
                    >
                      {selected ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : null}
                    </span>
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <span className="block truncate text-[13px] leading-5">{record.name}</span>
                      <span className="mt-0.5 block truncate text-[11px] leading-4 text-neutral-500">
                        {record.caseNumber}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-2 py-2 text-[12px] leading-4 text-neutral-600">No cases found.</p>
            )}
          </div>

          {active ? (
            <button
              type="button"
              onClick={clearAll}
              className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-[12px] leading-4 text-neutral-600 ui-t-colors hover:bg-neutral-100 hover:text-neutral-950"
            >
              Clear all
            </button>
          ) : null}
        </AnimatedPopover>
      </div>

      {value.includeUnassigned ? (
        <span className="inline-flex max-w-[160px] items-center gap-1 rounded-md border border-neutral-200 bg-[var(--background)] py-0.5 pl-2 pr-1 text-[11px] leading-4 text-neutral-700">
          <span className="truncate">No case</span>
          <button
            type="button"
            onClick={removeUnassigned}
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
            aria-label="Remove No case filter"
          >
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        </span>
      ) : null}

      {value.caseIds.map((caseId) => {
        const record = CASES.find((entry) => entry.id === caseId);
        if (!record) return null;
        return (
          <span
            key={caseId}
            className="inline-flex max-w-[180px] items-center gap-1 rounded-md border border-neutral-200 bg-[var(--background)] py-0.5 pl-2 pr-1 text-[11px] leading-4 text-neutral-700"
          >
            <span className="truncate">{record.name}</span>
            <button
              type="button"
              onClick={() => removeCase(caseId)}
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
              aria-label={`Remove ${record.name} filter`}
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          </span>
        );
      })}
    </div>
  );
}
