import Link from "next/link";
import { ChevronRight } from "lucide-react";

type CaseChatBreadcrumbProps = {
  caseId: string;
  caseName: string;
  chatTitle: string;
};

const linkClass =
  "shrink-0 text-body-md-secondary text-neutral-600 ui-t-colors hover:text-neutral-950";

export function CaseChatBreadcrumb({
  caseId,
  caseName,
  chatTitle,
}: CaseChatBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
      <Link href="/cases" className={linkClass}>
        Cases
      </Link>
      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 text-neutral-400"
        strokeWidth={1.75}
        aria-hidden
      />
      <Link href={`/cases/${caseId}`} className={`min-w-0 truncate ${linkClass}`}>
        {caseName}
      </Link>
      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 text-neutral-400"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="min-w-0 truncate text-body-md text-neutral-950">{chatTitle}</span>
    </nav>
  );
}
