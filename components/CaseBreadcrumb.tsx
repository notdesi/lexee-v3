import Link from "next/link";
import { ChevronRight } from "lucide-react";

type CaseBreadcrumbProps = {
  caseName: string;
};

export function CaseBreadcrumb({ caseName }: CaseBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
      <Link
        href="/cases"
        className="shrink-0 text-body-md-secondary text-neutral-600 ui-t-colors hover:text-neutral-950"
      >
        Cases
      </Link>
      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 text-neutral-400"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="min-w-0 truncate text-body-md text-neutral-950">{caseName}</span>
    </nav>
  );
}
