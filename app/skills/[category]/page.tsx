import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import {
  CATEGORY_ORDER,
  CATEGORY_HEADINGS,
  SKILLS,
  categoryToSlug,
  formatCreatedOn,
  skillsSortedByCreatedDesc,
  slugToCategory,
  type Skill,
} from "../skills-data";

type PageProps = {
  params: Promise<{ category: string }>;
};

export default async function SkillsCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = slugToCategory(slug);

  if (!category) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] px-8 py-8">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-body-md text-neutral-600">This skills category could not be found.</p>
          <Link
            href="/skills"
            className="mt-4 inline-block text-body-md font-medium text-violet-600 hover:text-violet-700"
          >
            Back to Skills
          </Link>
        </div>
      </div>
    );
  }

  const skills: Skill[] = skillsSortedByCreatedDesc(SKILLS.filter((s) => s.category === category));

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-2">
          <Link
            href="/skills"
            className="text-body-md text-violet-600 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
          >
            ← Skills
          </Link>
          <h1 className="text-lg font-medium text-neutral-600">
            {CATEGORY_HEADINGS[category]}
          </h1>
        </div>

        <ul className="mt-10 grid gap-3 grid-cols-2">
          {skills.map((skill) => (
            <li key={skill.id}>
              <Link
                href={`/?skill=${encodeURIComponent(skill.id)}`}
                className="flex h-full w-full flex-col rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-4 text-left shadow-[0_1px_2px_rgba(18,18,18,0.05)] transition-colors hover:border-violet-200 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-body-md font-medium text-neutral-950">{skill.title}</span>
                  <MoreHorizontal className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
                </div>
                <span className="mt-2 text-[12px] leading-4 text-neutral-600">
                  Created on {formatCreatedOn(skill.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return CATEGORY_ORDER.map((category) => ({
    category: categoryToSlug(category),
  }));
}
