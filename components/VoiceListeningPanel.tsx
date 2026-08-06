"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";

type VoiceListeningPanelProps = {
  transcript: string;
  interimTranscript: string;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  disabledConfirm?: boolean;
};

export function VoiceListeningPanel({
  transcript,
  interimTranscript,
  error,
  onCancel,
  onConfirm,
  disabledConfirm = false,
}: VoiceListeningPanelProps) {
  const committed = transcript.trim();
  const interim = interimTranscript.trim();
  const displayText = [committed, interim].filter(Boolean).join(" ");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="flex flex-col gap-3">
      <p
        className={[
          "min-h-[28px] text-body-lg italic leading-7",
          displayText ? "text-neutral-500" : "text-neutral-400",
        ].join(" ")}
        aria-live="polite"
      >
        {displayText || "Listening…"}
      </p>

      {error ? (
        <p className="text-[12px] leading-4 text-neutral-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <div
          className="voice-dotted-line h-px min-w-0 flex-1"
          aria-hidden
        />
        <button
          type="button"
          aria-label="Cancel voice input"
          onClick={onCancel}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="Confirm voice input"
          onClick={onConfirm}
          disabled={disabledConfirm}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--button-primary-disabled-bg)] disabled:text-[var(--button-primary-disabled-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
        >
          <Check className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
