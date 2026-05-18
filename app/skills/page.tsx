"use client";

import { MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  CATEGORY_HEADINGS,
  CATEGORY_ORDER,
  RECENT_PER_CATEGORY,
  SKILLS,
  categoryToSlug,
  formatCreatedOn,
  mostRecentSkills,
  type Skill,
} from "./skills-data";

export default function SkillsPage() {
  const [query, setQuery] = useState("");

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
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-spectral text-[32px] leading-none tracking-[-0.02em] text-neutral-950">
              Skills
            </h1>
            <p className="mt-2 text-body-md-secondary">
              You can select a skill to chat with it or create a new skill.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--button-primary-disabled-bg)] px-4 text-body-md text-[var(--button-primary-disabled-fg)] disabled:cursor-not-allowed"
            aria-label="Create new skill"
          >
            New Skill
          </button>
        </div>

        <div className="mt-8">
          <label htmlFor="skills-search" className="sr-only">
            Search skills
          </label>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-3 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
            <input
              id="skills-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search skills"
              className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-10">
          {sections.map(({ category, skills }) => (
            <section key={category} aria-labelledby={`skills-section-${category}`}>
              <div className="flex items-center justify-between gap-4">
                <h2 id={`skills-section-${category}`} className="text-sm font-medium text-neutral-600">
                  {CATEGORY_HEADINGS[category]}
                </h2>
                <Link
                  href={`/skills/${categoryToSlug(category)}`}
                  className="shrink-0 text-body-md font-medium text-violet-600 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                >
                  See all
                </Link>
              </div>
              {skills.length === 0 ? (
                <p className="mt-3 text-body-md text-neutral-600">No matching skills in this category.</p>
              ) : (
                <ul className="mt-4 grid gap-3 grid-cols-2">
                  {skills.map((skill) => (
                    <li key={skill.id}>
                      <Link
                        href={`/?skill=${encodeURIComponent(skill.id)}`}
                        className="flex h-full w-full flex-col rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-4 text-left shadow-[var(--shadow-card)] transition-colors hover:border-violet-200 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
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
