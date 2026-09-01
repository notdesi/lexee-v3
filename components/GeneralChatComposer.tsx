"use client";

import { ArrowUp } from "lucide-react";
import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import type { Skill } from "@/app/skills/skills-data";
import { ChatCaseSelector } from "@/components/ChatCaseSelector";
import { ChatComposerAddMenu } from "@/components/ChatComposerAddMenu";
import type { CaseRecord } from "@/lib/cases";

type GeneralChatComposerProps = {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  sendDisabled?: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput?: (event: FormEvent<HTMLTextAreaElement>) => void;
  selectedCaseName: string | null;
  onCaseSelect: (caseRecord: CaseRecord) => void;
};

const GENERAL_CHAT_PLACEHOLDER = "Type @ for case knowledge context";

export function GeneralChatComposer({
  message,
  onMessageChange,
  onSend,
  sendDisabled = false,
  textareaRef,
  onKeyDown,
  onInput,
  selectedCaseName,
  onCaseSelect,
}: GeneralChatComposerProps) {
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

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Backspace" && selectedSkill) {
      const textarea = event.currentTarget;
      if (textarea.selectionStart === 0 && textarea.selectionEnd === 0) {
        event.preventDefault();
        setSelectedSkill(null);
        return;
      }
    }

    onKeyDown?.(event);
  };

  const handleSend = () => {
    onSend();
    setSelectedSkill(null);
  };

  return (
    <div className="flex w-[620px] max-w-full flex-col items-center">
      <div className="flex w-full flex-col rounded-[20px] border border-[#EDEDED] bg-white shadow-[0_2px_5px_0_#E3EAFF]">
        <div className="flex gap-[10px] p-4">
          <div className="relative min-h-[22px] w-full">
            {selectedSkill ? (
              <span
                ref={skillLabelRef}
                className="pointer-events-none absolute left-0 top-0 max-w-[11rem] truncate text-[16px] font-medium leading-[22px] text-violet-700"
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
              placeholder={selectedSkill ? "" : GENERAL_CHAT_PLACEHOLDER}
              style={selectedSkill ? { textIndent: skillIndent } : undefined}
              className="min-h-[22px] w-full resize-none overflow-hidden bg-transparent text-[16px] font-normal leading-[22px] tracking-normal text-neutral-950 placeholder:text-[#727272] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <ChatComposerAddMenu
            selectedSkillId={selectedSkill?.id ?? null}
            onSkillSelect={setSelectedSkill}
          />
          <button
            type="button"
            aria-label="Send message"
            onClick={handleSend}
            disabled={sendDisabled}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B8BFE9] text-white/75 ui-t-colors hover:bg-[#a8b0e3] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#B8BFE9]"
          >
            <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <ChatCaseSelector selectedCaseName={selectedCaseName} onSelect={onCaseSelect} />
    </div>
  );
}
