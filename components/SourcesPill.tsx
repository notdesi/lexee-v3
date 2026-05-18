import { BookMarked } from "lucide-react";

type SourcesPillProps = {
  count: number;
  onClick?: () => void;
};

export function SourcesPill({ count, onClick }: SourcesPillProps) {
  const label = `${count} Sources`;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open panel: ${count} sources`}
      className={[
        "inline-flex items-center gap-1 rounded-full border border-violet-200/90 bg-violet-50 px-2 py-0.5",
        "text-[11px] font-medium leading-4 text-violet-700/95 font-inter",
        "hover:border-violet-300 hover:bg-violet-100 hover:text-violet-900",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300",
      ].join(" ")}
    >
      <BookMarked className="h-3.5 w-3.5 text-violet-500" strokeWidth={1.85} aria-hidden="true" />
      {label}
    </button>
  );
}
