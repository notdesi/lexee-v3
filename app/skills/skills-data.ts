export type SkillCategory = "document" | "case_knowledge" | "workflow" | "cloudlex";

export type Skill = {
  id: string;
  title: string;
  category: SkillCategory;
  caseCategory: "Slip and Fall" | "Trip and Fall" | "MVA" | "Mass Tort";
  createdAt: string;
};

export const CATEGORY_ORDER: SkillCategory[] = ["document", "case_knowledge", "workflow", "cloudlex"];

export const CATEGORY_HEADINGS: Record<SkillCategory, string> = {
  document: "Document-based",
  case_knowledge: "Case knowledge",
  workflow: "Workflow-based",
  cloudlex: "Cloudlex",
};

export const SKILLS: Skill[] = [
  {
    id: "doc-summons",
    title: "Summons",
    category: "document",
    caseCategory: "MVA",
    createdAt: "2026-05-04T14:00:00.000Z",
  },
  {
    id: "doc-demand",
    title: "Demand letter",
    category: "document",
    caseCategory: "Slip and Fall",
    createdAt: "2026-05-02T09:15:00.000Z",
  },
  {
    id: "ck-med-summary",
    title: "Medical Summary",
    category: "case_knowledge",
    caseCategory: "MVA",
    createdAt: "2026-05-05T16:20:00.000Z",
  },
  {
    id: "ck-med-chrono",
    title: "Medical Chronology",
    category: "case_knowledge",
    caseCategory: "Trip and Fall",
    createdAt: "2026-05-04T11:00:00.000Z",
  },
  {
    id: "wf-lead-intake",
    title: "Lead to intake",
    category: "workflow",
    caseCategory: "Mass Tort",
    createdAt: "2026-05-05T09:00:00.000Z",
  },
  {
    id: "wf-litigation",
    title: "Task creation",
    category: "workflow",
    caseCategory: "Slip and Fall",
    createdAt: "2026-05-03T15:40:00.000Z",
  },
  {
    id: "clx-explore-features",
    title: "Expore features",
    category: "cloudlex",
    caseCategory: "Mass Tort",
    createdAt: "2026-05-07T07:20:00.000Z",
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
  if (category === "cloudlex") return "cloudlex";
  return category === "case_knowledge" ? "case-knowledge" : category;
}

export function slugToCategory(slug: string): SkillCategory | null {
  if (slug === "document" || slug === "workflow" || slug === "cloudlex") return slug;
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
