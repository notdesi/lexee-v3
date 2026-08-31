"use client";

import { FileText } from "lucide-react";

type ChatDocumentsButtonProps = {
  count: number;
  onClick: () => void;
  active?: boolean;
};

export function ChatDocumentsButton({ count, onClick, active = false }: ChatDocumentsButtonProps) {
  if (count <= 0) return null;

  return (
    <button
      type="button"
      aria-label={`${count} generated document${count === 1 ? "" : "s"}`}
      onClick={onClick}
      className={[
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-600 ui-t-colors",
        "hover:bg-neutral-200/80 hover:text-neutral-950",
        active ? "bg-neutral-200/80 text-neutral-950" : "",
      ].join(" ")}
    >
      <FileText className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </button>
  );
}
