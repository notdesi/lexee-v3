import { FileText } from "lucide-react";
import { getDocumentFormatSizeClass, getDocumentFormatStyle } from "@/lib/document-format";

type DocumentFormatBadgeProps = {
  format: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
};

const ICON_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function DocumentFormatBadge({
  format,
  size = "sm",
  className,
  showIcon = false,
}: DocumentFormatBadgeProps) {
  const { label } = getDocumentFormatStyle(format);

  return (
    <span
      className={[
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-inter font-medium uppercase tracking-wide text-neutral-600",
        getDocumentFormatSizeClass(size),
        className,
      ].join(" ")}
    >
      {showIcon ? (
        <FileText className={`shrink-0 ${ICON_SIZE[size]}`} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
      {label}
    </span>
  );
}
