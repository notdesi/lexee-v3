"use client";

import { ArrowUp } from "lucide-react";
import type { Skill } from "@/app/skills/skills-data";
import { ChatComposerAddMenu } from "@/components/ChatComposerAddMenu";
import type { ComposerMode } from "@/lib/task-launches";

type ChatComposerFooterProps = {
  onSend: () => void;
  sendDisabled?: boolean;
  selectedSkillId?: string | null;
  onSkillSelect?: (skill: Skill) => void;
  selectedMode?: ComposerMode | null;
  onModeChange?: (mode: ComposerMode | null) => void;
};

export function ChatComposerFooter({
  onSend,
  sendDisabled = false,
  selectedSkillId = null,
  onSkillSelect,
  selectedMode = null,
  onModeChange,
}: ChatComposerFooterProps) {
  return (
    <div className="mt-1.5 flex shrink-0 items-center justify-between">
      <ChatComposerAddMenu
        selectedSkillId={selectedSkillId}
        onSkillSelect={onSkillSelect}
        selectedMode={selectedMode}
        onModeChange={onModeChange}
      />
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
