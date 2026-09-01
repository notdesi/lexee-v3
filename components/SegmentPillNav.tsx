"use client";

type SegmentPillNavOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type SegmentPillNavVariant = "segment" | "chip";

type SegmentPillNavProps<T extends string> = {
  options: readonly SegmentPillNavOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  variant?: SegmentPillNavVariant;
};

export function SegmentPillNav<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "Section navigation",
  variant = "segment",
}: SegmentPillNavProps<T>) {
  return (
    <div
      className={[
        "flex flex-wrap items-center",
        variant === "chip" ? "gap-2" : "gap-4",
      ].join(" ")}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={[
              "ui-t-colors",
              variant === "chip"
                ? [
                    "rounded-full border px-2.5 py-1 text-[12px] leading-4",
                    isActive
                      ? "border-neutral-300 bg-neutral-200 font-medium text-neutral-950"
                      : "border-[color:var(--chat-outline)] bg-neutral-50 font-normal text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900",
                  ].join(" ")
                : [
                    "rounded-lg px-3 py-1.5 text-[14px] leading-[22px]",
                    isActive
                      ? "bg-neutral-200 font-medium text-neutral-950"
                      : "font-normal text-neutral-600 hover:text-neutral-900",
                  ].join(" "),
            ].join(" ")}
          >
            {option.count != null ? `${option.label} (${option.count})` : option.label}
          </button>
        );
      })}
    </div>
  );
}
