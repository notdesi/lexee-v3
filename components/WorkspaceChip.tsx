import type { LucideIcon } from "lucide-react";

type WorkspaceChipProps = {
  icon: LucideIcon;
  label: string;
  iconClassName: string;
  labelClassName?: string;
  chipClassName?: string;
};

export function WorkspaceChip({
  icon: Icon,
  label,
  iconClassName,
  labelClassName = "text-neutral-700",
  chipClassName = "bg-neutral-100",
}: WorkspaceChipProps) {
  return (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5",
        chipClassName,
      ].join(" ")}
    >
      <Icon className={["h-3.5 w-3.5 shrink-0", iconClassName].join(" ")} strokeWidth={1.75} />
      <span className={["truncate text-[12px] leading-4", labelClassName].join(" ")}>{label}</span>
    </span>
  );
}
