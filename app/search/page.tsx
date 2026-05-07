"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

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

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-spectral text-[32px] leading-none tracking-[-0.02em] text-neutral-950">
              Search
            </h1>
            <p className="mt-2 text-body-md-secondary">
              Search across projects (lead, intake, matter), skills, and chat history.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-neutral-300 bg-neutral-50 p-4">
          <div className="flex items-center gap-2 rounded-lg border border-violet-300/70 bg-neutral-50 px-3 py-2 focus-within:ring-2 focus-within:ring-violet-300/70">
            <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
            <input
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
                    "rounded-full border px-3 py-1.5 text-[12px] leading-4 transition-colors",
                    isActive
                      ? "border-violet-300 bg-violet-100 text-neutral-900"
                      : "border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900",
                  ].join(" ")}
                >
                  {SCOPE_LABELS[scope]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-300 bg-neutral-50 p-2">
          {filteredItems.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full rounded-lg border border-transparent px-3 py-3 text-left hover:border-violet-200 hover:bg-violet-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-body-md text-neutral-950">{item.title}</p>
                    <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-1 text-[12px] leading-4 text-neutral-700">
                      {SCOPE_LABELS[item.scope]}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-4 text-neutral-600">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-6 text-center">
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
