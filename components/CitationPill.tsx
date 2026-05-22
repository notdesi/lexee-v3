import { FileText } from "lucide-react";

type CitationPillProps = {
  label: string;
  onClick?: () => void;
};

export function CitationPill({ label, onClick }: CitationPillProps) {
  const Component = onClick ? "button" : "span";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5",
        "text-[11px] font-medium leading-4 text-neutral-600 font-inter",
        onClick ? "ui-t-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300" : "",
      ].join(" ")}
    >
      <FileText className="h-3.5 w-3.5 text-neutral-500" strokeWidth={1.8} aria-hidden="true" />
      {label}
    </Component>
  );
}

