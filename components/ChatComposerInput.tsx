"use client";

import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import type { Skill } from "@/app/skills/skills-data";
import { ChatComposerFooter } from "@/components/ChatComposerFooter";
import type { ComposerMode } from "@/lib/task-launches";

type ChatComposerInputProps = {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  sendDisabled?: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput?: (event: FormEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  composerMode?: ComposerMode | null;
  onComposerModeChange?: (mode: ComposerMode | null) => void;
  selectedSkill?: Skill | null;
  onSkillSelect?: (skill: Skill | null) => void;
};

export function ChatComposerInput({
  message,
  onMessageChange,
  onSend,
  sendDisabled = false,
  textareaRef,
  onKeyDown,
  onInput,
  placeholder = "Ask me anything...",
  composerMode = null,
  onComposerModeChange,
  selectedSkill: selectedSkillProp,
  onSkillSelect,
}: ChatComposerInputProps) {
  const [internalSkill, setInternalSkill] = useState<Skill | null>(null);
  const selectedSkill = selectedSkillProp ?? internalSkill;

  const [skillIndent, setSkillIndent] = useState(0);
  const skillLabelRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!selectedSkill || !skillLabelRef.current) {
      setSkillIndent(0);
      return;
    }
    setSkillIndent(skillLabelRef.current.offsetWidth + 4);
  }, [selectedSkill]);

  const handleSkillSelect = (skill: Skill) => {
    if (onSkillSelect) onSkillSelect(skill);
    else setInternalSkill(skill);
  };

  const clearSelectedSkill = () => {
    if (onSkillSelect) onSkillSelect(null);
    else setInternalSkill(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Backspace" && selectedSkill) {
      const textarea = event.currentTarget;
      if (textarea.selectionStart === 0 && textarea.selectionEnd === 0) {
        event.preventDefault();
        clearSelectedSkill();
        return;
      }
    }

    onKeyDown?.(event);
  };

  const handleSend = () => {
    onSend();
    clearSelectedSkill();
    onComposerModeChange?.(null);
  };

  return (
    <>
      <div className="relative min-h-[48px] w-full">
        {selectedSkill ? (
          <span
            ref={skillLabelRef}
            className="pointer-events-none absolute left-0 top-px max-w-[11rem] truncate text-body-lg font-medium leading-6 text-violet-700"
          >
            {selectedSkill.title}
          </span>
        ) : null}
        <textarea
          ref={textareaRef}
          rows={1}
          onInput={onInput}
          onKeyDown={handleKeyDown}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder={selectedSkill ? "" : placeholder}
          style={selectedSkill ? { textIndent: skillIndent } : undefined}
          className="min-h-[48px] w-full resize-none overflow-hidden bg-transparent text-body-lg leading-6 text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
        />
      </div>

      <ChatComposerFooter
        onSend={handleSend}
        sendDisabled={sendDisabled}
        selectedSkillId={selectedSkill?.id ?? null}
        onSkillSelect={handleSkillSelect}
        selectedMode={composerMode}
        onModeChange={onComposerModeChange}
      />
    </>
  );
}
