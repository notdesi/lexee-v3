"use client";

import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import type { Skill } from "@/app/skills/skills-data";
import { ChatComposerFooter } from "@/components/ChatComposerFooter";

type ChatComposerInputProps = {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  sendDisabled?: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput?: (event: FormEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
};

export function ChatComposerInput({
  message,
  onMessageChange,
  onSend,
  sendDisabled = false,
  textareaRef,
  onKeyDown,
  onInput,
  placeholder = "Type @ for case knowledge context",
}: ChatComposerInputProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
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
    setSelectedSkill(skill);
  };

  const clearSelectedSkill = () => {
    setSelectedSkill(null);
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
      />
    </>
  );
}
