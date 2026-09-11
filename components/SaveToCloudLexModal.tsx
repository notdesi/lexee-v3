"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { uiMotionTransition } from "@/lib/ui-motion";

const DOCUMENT_CATEGORIES = [
  "Pleadings",
  "Discovery",
  "Motions",
  "Correspondence",
  "Medical Records",
  "Exhibits",
  "Other",
] as const;

export type SaveToCloudLexModalProps = {
  open: boolean;
  documentName: string;
  onClose: () => void;
  onSave: (payload: {
    category: string;
    name: string;
    sendForExpertApproval: boolean;
  }) => void;
};

export function SaveToCloudLexModal({
  open,
  documentName,
  onClose,
  onSave,
}: SaveToCloudLexModalProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [name, setName] = useState(documentName);
  const [sendForExpertApproval, setSendForExpertApproval] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCategory(DOCUMENT_CATEGORIES[0]);
    setName(documentName);
    setSendForExpertApproval(false);
    const frame = window.requestAnimationFrame(() => nameInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, documentName]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const overlayTransition = uiMotionTransition(reduceMotion, 0.18);
  const panelTransition = uiMotionTransition(reduceMotion, 0.22);

  const canSave = name.trim().length > 0;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="save-to-cloudlex-modal"
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-hidden
            onMouseDown={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md origin-center rounded-2xl border border-neutral-200 bg-[var(--background)] p-5 shadow-[var(--shadow-panel)]"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.99 }}
            transition={panelTransition}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2
              id={titleId}
              className="text-[17px] font-semibold leading-6 text-neutral-950"
            >
              Save to CloudLex
            </h2>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-medium text-neutral-600">
                  Document category
                </span>
                <span className="relative">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-[color:var(--chat-outline)] bg-[var(--background)] px-3 pr-9 text-body-md text-neutral-950 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-violet-300/70"
                  >
                    {DOCUMENT_CATEGORIES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-medium text-neutral-600">
                  Document name
                </span>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[color:var(--chat-outline)] bg-[var(--background)] px-3 text-body-md text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-neutral-400 focus:ring-2 focus:ring-violet-300/70"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={sendForExpertApproval}
                  onChange={(event) => setSendForExpertApproval(event.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-neutral-300 accent-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                />
                <span className="text-body-md text-neutral-950">
                  Send for expert approval
                </span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--chat-outline)] bg-[var(--background)] px-3.5 text-[13px] font-medium text-neutral-700 ui-t-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={() => {
                  if (!canSave) return;
                  onSave({
                    category,
                    name: name.trim(),
                    sendForExpertApproval,
                  });
                }}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#004E75] px-3.5 text-[13px] font-medium text-white ui-t-colors hover:bg-[#003a58] disabled:cursor-not-allowed disabled:bg-[#004E75]/50 disabled:text-white/70"
              >
                <Image
                  src="/cloudlex-logo.png"
                  alt=""
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 object-contain brightness-0 invert"
                  aria-hidden="true"
                />
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
