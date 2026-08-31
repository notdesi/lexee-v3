"use client";

import { ArrowDownUp, Check, MoreVertical, Pin, Search, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { SegmentPillNav } from "@/components/SegmentPillNav";
import { useCaseWorkspace } from "@/hooks/useCaseWorkspace";
import {
  CASES as INITIAL_CASES,
  formatLastActivity,
  type CaseRecord,
  type CaseScope,
} from "@/lib/cases";
import { pinCase, unpinCase } from "@/lib/case-workspace";

type SortOption = "last-updated" | "date-created" | "alphabetical";

const SCOPE_OPTIONS = [
  { value: "lead" as const, label: "Lead" },
  { value: "intake" as const, label: "Intake" },
  { value: "matter" as const, label: "Matter" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "last-updated", label: "Last updated" },
  { value: "date-created", label: "Date created" },
  { value: "alphabetical", label: "Alphabetical" },
];

const EMPTY_SCOPE_COPY: Record<CaseScope, string> = {
  lead: "No leads yet.",
  intake: "No intakes yet.",
  matter: "No matters yet.",
};

function SortMenu({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const activeLabel = SORT_OPTIONS.find((option) => option.value === value)?.label ?? "Sort";

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
        aria-label="Sort cases"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
      >
        <ArrowDownUp className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
        <span>{activeLabel}</span>
      </button>

      <AnimatedPopover
        open={open}
        className="absolute right-0 top-full z-50 mt-1.5 w-[11.5rem] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
      >
        {SORT_OPTIONS.map((option) => {
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
              <span className="min-w-0 flex-1">{option.label}</span>
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

const caseMenuItemClass =
  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-violet-50 hover:text-neutral-950";

const caseMenuItemDangerClass =
  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-md-secondary text-red-600 ui-t-colors hover:bg-red-50 hover:text-red-700";

function CaseCardMenu({
  pinned,
  open,
  onOpenChange,
  onPin,
  onDelete,
}: {
  pinned: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!open);
        }}
        className={[
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 ui-t-opacity",
          "hover:bg-neutral-200/80 hover:text-neutral-800",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300",
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        ].join(" ")}
      >
        <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <AnimatedPopover
        open={open}
        className="absolute right-0 top-full z-50 mt-1.5 w-[11.5rem] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
      >
        <button
          type="button"
          role="menuitem"
          className={caseMenuItemClass}
          onClick={(event) => {
            event.stopPropagation();
            onPin();
            onOpenChange(false);
          }}
        >
          <Pin
            className={[
              "h-[18px] w-[18px] shrink-0 text-neutral-950",
              pinned ? "fill-neutral-950" : "fill-none",
            ].join(" ")}
            strokeWidth={1.5}
          />
          {pinned ? "Unpin" : "Pin"}
        </button>
        <div className="my-1.5 h-px bg-neutral-200" role="presentation" />
        <button
          type="button"
          role="menuitem"
          className={caseMenuItemDangerClass}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
            onOpenChange(false);
          }}
        >
          <Trash2 className="h-[18px] w-[18px] shrink-0 text-red-600" strokeWidth={1.5} />
          Delete
        </button>
      </AnimatedPopover>
    </div>
  );
}

export default function CasesPage() {
  const router = useRouter();
  const workspace = useCaseWorkspace();
  const pinnedIds = useMemo(
    () => new Set(workspace.pinnedCases.map((entry) => entry.id)),
    [workspace.pinnedCases],
  );
  const [cases, setCases] = useState<CaseRecord[]>(() => INITIAL_CASES);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [scope, setScope] = useState<CaseScope>("lead");
  const [sort, setSort] = useState<SortOption>("last-updated");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const togglePin = (record: CaseRecord) => {
    if (pinnedIds.has(record.id)) {
      unpinCase(record.id);
      return;
    }
    const result = pinCase({
      id: record.id,
      label: record.name,
      scope: record.scope,
    });
    if (!result.ok) {
      setNotice(result.message);
    }
  };

  const deleteCase = (id: string) => {
    const nextCases = cases.filter((record) => record.id !== id);
    unpinCase(id);
    setCases(nextCases);
    setOpenMenuId(null);
  };

  const visibleCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const scoped = cases.filter((record) => record.scope === scope);
    const filtered = normalized
      ? scoped.filter(
          (record) =>
            record.name.toLowerCase().includes(normalized) ||
            record.caseNumber.toLowerCase().includes(normalized),
        )
      : scoped;

    const sorted = [...filtered];
    if (sort === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "date-created") {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      sorted.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
    return sorted;
  }, [cases, query, scope, sort]);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--background)] px-8 py-8">
      {notice ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <p className="rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-4 py-2 text-body-md text-neutral-950 shadow-[var(--shadow-popup)]">
            {notice}
          </p>
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-tiempos-text text-[32px] leading-none tracking-[-0.015em] text-neutral-950">
            Cases
          </h1>

          <div className="flex shrink-0 items-center gap-1">
            {searchOpen ? (
              <div className="flex h-9 w-[min(100vw-12rem,240px)] items-center gap-1.5 rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-2 shadow-[var(--shadow-subtle)] ui-t-layout">
                <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
                <label htmlFor="cases-search" className="sr-only">
                  Search cases
                </label>
                <input
                  id="cases-search"
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") closeSearch();
                  }}
                  placeholder="Search cases"
                  className="min-w-0 flex-1 bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={closeSearch}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Search cases"
                onClick={() => setSearchOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            )}

            <SortMenu value={sort} onChange={setSort} />

            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-3 text-body-md text-neutral-950 shadow-[var(--shadow-subtle)] ui-t-colors hover:bg-neutral-100"
            >
              <Upload className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
              Import
            </button>
          </div>
        </div>

        <div className="mt-8">
          <SegmentPillNav
            options={SCOPE_OPTIONS}
            value={scope}
            onChange={setScope}
            ariaLabel="Case type"
          />
        </div>

        <div className="mt-8">
          {visibleCases.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3">
              {visibleCases.map((record) => (
                <li key={record.id} className="group">
                  <div
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/cases/${record.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/cases/${record.id}`);
                      }
                    }}
                    className="relative flex h-full cursor-pointer flex-col rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 px-4 py-4 text-left shadow-[var(--shadow-card)] ui-t-colors hover:border-neutral-300 hover:bg-neutral-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-body-md font-medium text-neutral-950">{record.name}</p>
                      </div>
                      <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                      <CaseCardMenu
                        pinned={pinnedIds.has(record.id)}
                        open={openMenuId === record.id}
                        onOpenChange={(open) => setOpenMenuId(open ? record.id : null)}
                        onPin={() => togglePin(record)}
                        onDelete={() => deleteCase(record.id)}
                      />
                      </div>
                    </div>
                    <p className="mt-2 text-caption text-neutral-600">{record.caseNumber}</p>
                    <p className="mt-3 text-[12px] leading-4 text-neutral-500">
                      {formatLastActivity(record.updatedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-12 text-center">
              <p className="text-body-md-secondary">{EMPTY_SCOPE_COPY[scope]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
