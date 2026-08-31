"use client";

import { Check, ChevronDown, Package, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatedPopover } from "@/components/AnimatedPopover";

type Matter = { name: string; caseNumber: string };

type ArtifactStatus = "awaiting-review" | "approved" | "rejected" | "superseded";

type Artifact = {
  id: string;
  name: string;
  status: ArtifactStatus;
};

const MATTERS: Matter[] = [
  { name: "Test2 (Amacus)", caseNumber: "26-001592" },
  { name: "Murdock v. Metro Health", caseNumber: "2024-CV-01842" },
  { name: "People v. N. Castle Holdings", caseNumber: "2023-CR-09417" },
  { name: "State Bar Compliance - Q2", caseNumber: "ADM-2026-004" },
  { name: "Acme Insurance Intake", caseNumber: "CLM-2026-3318" },
  { name: "Nelson & Murdock Retainer Draft", caseNumber: "ENG-2025-112" },
  { name: "Geramita vs Ayal", caseNumber: "2025-CV-00671" },
];

const ARTIFACTS: Artifact[] = [];

const FILTERS: { key: ArtifactStatus; label: string }[] = [
  { key: "awaiting-review", label: "Awaiting review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "superseded", label: "Superseded" },
];

function MatterDropdown({
  matters,
  selectedMatter,
  onSelect,
}: {
  matters: Matter[];
  selectedMatter: Matter;
  onSelect: (matter: Matter) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  const filteredMatters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return matters;
    return matters.filter(
      (matter) =>
        matter.name.toLowerCase().includes(normalized) ||
        matter.caseNumber.toLowerCase().includes(normalized),
    );
  }, [matters, query]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
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
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-w-0 max-w-[420px] items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-neutral-800 ui-t-colors hover:bg-violet-50 hover:text-neutral-950"
        aria-label="Select matter"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="min-w-0 flex-1 overflow-hidden text-left">
          <span className="block truncate text-body-md">{selectedMatter.name}</span>
          <span className="mt-0.5 block truncate text-[12px] leading-4 text-neutral-500">
            {selectedMatter.caseNumber}
          </span>
        </span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-neutral-700 ui-t-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          strokeWidth={1.75}
        />
      </button>

      <AnimatedPopover
        open={open}
        className="absolute right-0 z-50 mt-2 w-[420px] rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-2 shadow-[var(--shadow-popup)]"
      >
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-2 py-2 focus-within:ring-2 focus-within:ring-violet-300/70">
          <Search className="h-4 w-4 text-neutral-500" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search matters"
            className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
          />
        </div>

        <div className="max-h-56 overflow-y-auto">
          {filteredMatters.length > 0 ? (
            filteredMatters.map((matter) => {
              const isActive = matter.name === selectedMatter.name;
              return (
                <button
                  key={matter.name}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelect(matter);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={[
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left",
                    isActive
                      ? "bg-violet-100 text-neutral-950"
                      : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
                  ].join(" ")}
                >
                  <span className="min-w-0 flex-1 overflow-hidden">
                    <span className="block truncate text-body-md-secondary">{matter.name}</span>
                    <span className="mt-0.5 block truncate text-[12px] leading-4 text-neutral-500">
                      {matter.caseNumber}
                    </span>
                  </span>
                  {isActive ? (
                    <Check className="ml-auto h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
                  ) : null}
                </button>
              );
            })
          ) : (
            <p className="px-2 py-2 text-[12px] leading-4 text-neutral-600">No matters found.</p>
          )}
        </div>
      </AnimatedPopover>
    </div>
  );
}

export default function ArtifactsPage() {
  const [selectedMatter, setSelectedMatter] = useState<Matter>(MATTERS[0]);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ArtifactStatus>("awaiting-review");

  const visibleArtifacts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ARTIFACTS.filter((artifact) => {
      if (artifact.status !== selectedFilter) return false;
      if (!normalized) return true;
      return artifact.name.toLowerCase().includes(normalized);
    });
  }, [query, selectedFilter]);

  return (
    <div className="flex h-[100dvh] min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--background)]">
      <div className="z-20 flex w-full shrink-0 justify-end bg-[var(--background)] px-4 pt-2 pb-2">
        <MatterDropdown
          matters={MATTERS}
          selectedMatter={selectedMatter}
          onSelect={setSelectedMatter}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 pb-8 pt-2">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-1 flex-col">
          <h1 className="font-tiempos-text text-[32px] leading-none tracking-[-0.015em] text-neutral-950">
            Awaiting your review
          </h1>
          <p className="mt-2 text-body-md-secondary">
            Browse, filter, and review this matter&apos;s artifacts.
          </p>

          <div className="mt-8 rounded-xl border border-neutral-200 bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-card)]">
            <label htmlFor="artifacts-filter" className="sr-only">
              Filter artifacts by name
            </label>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-3">
              <Package className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
              <input
                id="artifacts-filter"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by name..."
                className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {FILTERS.map((filter) => {
                const isSelected = selectedFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedFilter(filter.key)}
                    className={[
                      "rounded-full px-3 py-1.5 text-[12px] leading-4 ui-t-colors",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300",
                      isSelected
                        ? "border border-violet-200 bg-violet-100 text-neutral-950"
                        : "border border-neutral-300 bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                    ].join(" ")}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            {visibleArtifacts.length === 0 ? (
              <p className="text-body-md-secondary">Nothing&apos;s waiting on you.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
