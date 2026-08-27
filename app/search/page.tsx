"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeScopes, setActiveScopes] = useState<SearchScope[]>(ALL_SCOPES);

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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="font-tiempos-headline text-[32px] leading-none tracking-[-0.015em] text-neutral-950">
          Search
        </h1>
        <p className="mt-2 text-body-md-secondary">
          Search across projects (lead, intake, matter), skills, and chat history.
        </p>

        <div className="mt-8">
          <label htmlFor="app-search" className="sr-only">
            Search anything in this app
          </label>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-3 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
            <input
              id="app-search"
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

        <div className="mt-8 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-50 shadow-[var(--shadow-card)]">
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
  );
}
