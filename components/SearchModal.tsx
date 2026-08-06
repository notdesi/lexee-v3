"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

type SearchScope = "lead" | "intake" | "matter" | "skills" | "history";

type SearchItem = {
  id: string;
  title: string;
  description: string;
  scope: SearchScope;
};

const SCOPE_LABELS: Record<SearchScope, string> = {
  lead: "Lead",
  intake: "Intake",
  matter: "Matter",
  skills: "Skills",
  history: "Chat History",
};

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "lead-1",
    title: "Metro Health incident intake lead",
    description: "Initial lead details captured for the hospital negligence inquiry.",
    scope: "lead",
  },
  {
    id: "intake-1",
    title: "Client interview notes - Murdock v. Metro Health",
    description: "First intake summary with timeline and known parties.",
    scope: "intake",
  },
  {
    id: "matter-1",
    title: "Murdock v. Metro Health",
    description: "Active matter containing filings, intake notes, and research drafts.",
    scope: "matter",
  },
  {
    id: "skills-1",
    title: "Matter Summary",
    description: "Skill for concise legal summaries from long case documents.",
    scope: "skills",
  },
  {
    id: "history-1",
    title: "Create Medical summary",
    description: "Previous chat where a medical chronology was requested.",
    scope: "history",
  },
];

const ALL_SCOPES: SearchScope[] = ["lead", "intake", "matter", "skills", "history"];

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchModal({ open, onClose }: SearchModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [activeScopes, setActiveScopes] = useState<SearchScope[]>(ALL_SCOPES);

  const overlayTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const };

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return SEARCH_ITEMS.filter((item) => {
      const inScope = activeScopes.includes(item.scope);
      if (!inScope) return false;
      if (!normalizedQuery) return true;
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeScopes, query]);

  const toggleScope = (scope: SearchScope) => {
    setActiveScopes((previous) => {
      if (previous.includes(scope)) {
        const next = previous.filter((value) => value !== scope);
        return next.length > 0 ? next : previous;
      }
      return [...previous, scope];
    });
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveScopes(ALL_SCOPES);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="search-modal"
          className="fixed inset-0 z-[200] flex items-start justify-center px-4 pb-10 pt-[8vh]"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-hidden
            onMouseDown={handleClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[min(82vh,840px)] w-full max-w-5xl origin-top flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-[var(--background)] shadow-[var(--shadow-panel)]"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 14, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.99 }
            }
            transition={panelTransition}
            onMouseDown={(event) => event.stopPropagation()}
          >
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-1 pt-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-tiempos-headline text-[28px] leading-none tracking-[-0.015em] text-neutral-950"
            >
              Search
            </h2>
            <p className="mt-2 text-body-md-secondary">
              Search across projects (lead, intake, matter), skills, and chat history.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            aria-label="Close search"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="p-4">
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-[var(--background)] px-3 py-2.5 focus-within:border-violet-300/80 focus-within:ring-2 focus-within:ring-violet-200/60">
                <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search anything in this app..."
                  className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {ALL_SCOPES.map((scope) => {
                  const isActive = activeScopes.includes(scope);
                  return (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => toggleScope(scope)}
                      className={[
                        "rounded-full px-3 py-1.5 text-[12px] leading-4 transition-colors",
                        isActive
                          ? "border border-violet-300 bg-violet-100 text-neutral-900"
                          : "bg-neutral-200/70 text-neutral-800 hover:bg-neutral-300/90 hover:text-neutral-950",
                      ].join(" ")}
                    >
                      {SCOPE_LABELS[scope]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-neutral-200/90">
              {filteredItems.length > 0 ? (
                <div className="flex flex-col gap-0.5 p-2">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-violet-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-body-md text-neutral-950">{item.title}</p>
                        <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-1 text-[12px] leading-4 text-neutral-700">
                          {SCOPE_LABELS[item.scope]}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] leading-4 text-neutral-600">{item.description}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-8 text-center">
                  <p className="text-body-md text-neutral-900">No results found</p>
                  <p className="mt-1 text-[12px] leading-4 text-neutral-600">
                    Try changing your filters or searching with different terms.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
