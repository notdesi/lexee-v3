import { getDocumentFormatSizeClass, getDocumentFormatStyle } from "@/lib/document-format";

type DocumentFormatBadgeProps = {
  format: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function DocumentFormatBadge({
  format,
  size = "sm",
  className,
}: DocumentFormatBadgeProps) {
  const { label } = getDocumentFormatStyle(format);

  return (
    <span
      className={[
        "inline-flex w-fit shrink-0 items-center rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-inter font-medium uppercase tracking-wide text-neutral-600",
        getDocumentFormatSizeClass(size),
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
