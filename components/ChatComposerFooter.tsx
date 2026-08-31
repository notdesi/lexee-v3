"use client";

import { ArrowUp } from "lucide-react";
import { ChatComposerAddMenu } from "@/components/ChatComposerAddMenu";

type ChatComposerFooterProps = {
  onSend: () => void;
  sendDisabled?: boolean;
};

export function ChatComposerFooter({
  onSend,
  sendDisabled = false,
}: ChatComposerFooterProps) {
  return (
    <div className="mt-1.5 flex shrink-0 items-center justify-between">
      <ChatComposerAddMenu />
      <button
        type="button"
        aria-label="Send message"
        onClick={onSend}
        disabled={sendDisabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--button-primary-disabled-bg)] disabled:text-[var(--button-primary-disabled-fg)] disabled:hover:bg-[var(--button-primary-disabled-bg)]"
      >
        <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
    </div>
  );
}
