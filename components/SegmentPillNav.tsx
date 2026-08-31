"use client";

type SegmentPillNavOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentPillNavProps<T extends string> = {
  options: readonly SegmentPillNavOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
};

export function SegmentPillNav<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "Section navigation",
}: SegmentPillNavProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-4" role="tablist" aria-label={ariaLabel}>
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
              "rounded-lg px-3 py-1.5 text-[14px] leading-[22px] ui-t-colors",
              isActive
                ? "bg-neutral-200 font-medium text-neutral-950"
                : "font-normal text-neutral-600 hover:text-neutral-900",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
