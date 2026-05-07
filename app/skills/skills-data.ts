export type SkillCategory = "document" | "case_knowledge" | "workflow";

export type Skill = {
  id: string;
  title: string;
  category: SkillCategory;
  createdAt: string;
};

export const CATEGORY_ORDER: SkillCategory[] = ["document", "case_knowledge", "workflow"];

export const CATEGORY_HEADINGS: Record<SkillCategory, string> = {
  document: "Document-based",
  case_knowledge: "Case knowledge",
  workflow: "Workflow-based",
};

export const SKILLS: Skill[] = [
  {
    id: "doc-summons",
    title: "Summons",
    category: "document",
    createdAt: "2026-05-04T14:00:00.000Z",
  },
  {
    id: "doc-pleadings",
    title: "Pleadings",
    category: "document",
    createdAt: "2026-05-03T10:30:00.000Z",
  },
  {
    id: "doc-demand",
    title: "Demand letter",
    category: "document",
    createdAt: "2026-05-02T09:15:00.000Z",
  },
  {
    id: "ck-med-summary",
    title: "Medical Summary",
    category: "case_knowledge",
    createdAt: "2026-05-05T16:20:00.000Z",
  },
  {
    id: "ck-med-chrono",
    title: "Medical Chronology",
    category: "case_knowledge",
    createdAt: "2026-05-04T11:00:00.000Z",
  },
  {
    id: "ck-case-summaries",
    title: "Case Summaries",
    category: "case_knowledge",
    createdAt: "2026-05-01T08:45:00.000Z",
  },
  {
    id: "wf-lead-intake",
    title: "Lead to intake",
    category: "workflow",
    createdAt: "2026-05-05T09:00:00.000Z",
  },
  {
    id: "wf-litigation",
    title: "Litigation",
    category: "workflow",
    createdAt: "2026-05-03T15:40:00.000Z",
  },
];

export const RECENT_PER_CATEGORY = 3;

export function skillsSortedByCreatedDesc(skills: Skill[]): Skill[] {
  return [...skills].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function mostRecentSkills(skills: Skill[], max: number): Skill[] {
  return skillsSortedByCreatedDesc(skills).slice(0, max);
}

export function categoryToSlug(category: SkillCategory): string {
  return category === "case_knowledge" ? "case-knowledge" : category;
}

export function slugToCategory(slug: string): SkillCategory | null {
  if (slug === "document" || slug === "workflow") return slug;
  if (slug === "case-knowledge") return "case_knowledge";
  return null;
}

export function formatCreatedOn(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
