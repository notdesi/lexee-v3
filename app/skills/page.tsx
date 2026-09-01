"use client";

import { MoreHorizontal, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { UI_CARD_INTERACTIVE } from "@/lib/ui-motion";
import {
  CATEGORY_HEADINGS,
  CATEGORY_ORDER,
  RECENT_PER_CATEGORY,
  SKILLS,
  formatCreatedOn,
  mostRecentSkills,
  type Skill,
} from "./skills-data";

export default function SkillsPage() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  const clearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  const sections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matchesQuery = (skill: Skill) => {
      if (!normalized) return true;
      return skill.title.toLowerCase().includes(normalized);
    };

    return CATEGORY_ORDER.map((category) => {
      const filtered = SKILLS.filter((s) => s.category === category && matchesQuery(s));
      const skills = mostRecentSkills(filtered, RECENT_PER_CATEGORY);
      return { category, skills };
    });
  }, [query]);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-tiempos-text text-[32px] leading-none tracking-[-0.015em] text-neutral-950">
              Skills
            </h1>
            <p className="mt-2 text-body-md-secondary">
              Select a skill to chat with it.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {searchOpen ? (
              <div className="flex h-9 w-[min(100vw-12rem,240px)] items-center gap-1.5 rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-2 shadow-[var(--shadow-subtle)] ui-t-layout">
                <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
                <label htmlFor="skills-search" className="sr-only">
                  Search skills
                </label>
                <input
                  id="skills-search"
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && query) clearSearch();
                  }}
                  placeholder="Search skills"
                  className="min-w-0 flex-1 bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={clearSearch}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                aria-label="Search skills"
                onClick={() => setSearchOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-10">
          {sections.map(({ category, skills }) => (
            <section key={category} aria-labelledby={`skills-section-${category}`}>
              <h2 id={`skills-section-${category}`} className="text-sm font-medium text-neutral-600">
                {CATEGORY_HEADINGS[category]}
              </h2>
              {skills.length === 0 ? (
                <p className="mt-3 text-body-md text-neutral-600">No matching skills in this category.</p>
              ) : (
                <ul className="mt-4 grid gap-3 grid-cols-2">
                  {skills.map((skill) => (
                    <li key={skill.id}>
                      <Link
                        href={`/?skill=${encodeURIComponent(skill.id)}`}
                        className={`flex h-full w-full flex-col px-4 py-4 text-left ${UI_CARD_INTERACTIVE} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-body-md font-medium text-neutral-950">{skill.title}</span>
                          <MoreHorizontal className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
                        </div>
                        <span className="mt-2 text-[12px] leading-4 text-neutral-600">
                          Created on {formatCreatedOn(skill.createdAt)}
                        </span>
                        {skill.category !== "cloudlex" ? (
                          <span className="mt-3 inline-flex w-fit items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-medium leading-4 text-violet-700">
                            {skill.caseCategory}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
