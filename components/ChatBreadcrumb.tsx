"use client";

import { Briefcase, ChevronDown, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedPopover } from "@/components/AnimatedPopover";

type ChatBreadcrumbProps = {
  title: string;
  onTitleChange: (title: string) => void;
  onMarkUnread: () => void;
  onAddToCase: () => void;
  onDelete: () => void;
};

const DEFAULT_TITLE = "New chat";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-violet-50 hover:text-neutral-950";

const menuItemDangerClass =
  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-md-secondary text-red-600 ui-t-colors hover:bg-red-50 hover:text-red-700";

export function ChatBreadcrumb({
  title,
  onTitleChange,
  onMarkUnread,
  onAddToCase,
  onDelete,
}: ChatBreadcrumbProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  useEffect(() => {
    if (!isEditingTitle) return;
    const el = titleInputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [isEditingTitle]);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const startRename = () => {
    setMenuOpen(false);
    setDraftTitle(title);
    setIsEditingTitle(true);
  };

  const cancelRename = () => {
    setDraftTitle(title);
    setIsEditingTitle(false);
  };

  const commitTitle = () => {
    const trimmed = draftTitle.trim();
    onTitleChange(trimmed || DEFAULT_TITLE);
    setIsEditingTitle(false);
  };

  return (
    <div ref={menuRef} className="relative inline-flex max-w-full min-w-0">
      <div
        className={[
          "inline-flex max-w-full min-w-0 items-stretch overflow-hidden rounded-lg ui-t-colors",
          isEditingTitle
            ? "bg-neutral-50 ring-1 ring-[color:var(--chat-outline)]"
            : "hover:bg-neutral-200/45",
        ].join(" ")}
      >
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitTitle();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancelRename();
              }
            }}
            size={Math.max(draftTitle.length, DEFAULT_TITLE.length, 8)}
            className="min-w-[5.5rem] max-w-[280px] bg-transparent px-3 py-2 text-body-md text-neutral-950 selection:bg-violet-100 focus:outline-none"
            aria-label="Conversation title"
          />
        ) : (
          <button
            type="button"
            onClick={startRename}
            className="min-w-0 max-w-[280px] truncate px-3 py-2 text-left text-body-md text-neutral-950 ui-t-colors hover:bg-neutral-200/70 hover:text-neutral-950"
            title="Click to rename"
          >
            {title}
          </button>
        )}

        <span className="my-2 w-px shrink-0 self-stretch bg-neutral-300/60" aria-hidden="true" />

        <button
          type="button"
          aria-label="Conversation options"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
          className={[
            "inline-flex shrink-0 items-center justify-center px-2 py-2 text-neutral-600 ui-t-colors",
            menuOpen
              ? "bg-neutral-200/80 text-neutral-950"
              : "hover:bg-neutral-200/70 hover:text-neutral-950",
          ].join(" ")}
        >
          <ChevronDown
            className={["h-4 w-4 ui-t-transform", menuOpen ? "rotate-180" : ""].join(" ")}
            strokeWidth={1.75}
          />
        </button>
      </div>

      <AnimatedPopover
        open={menuOpen}
        className="absolute left-0 top-full z-50 mt-1.5 w-[12.5rem] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
      >
        <button
          type="button"
          role="menuitem"
          className={menuItemClass}
          onClick={() => {
            onMarkUnread();
            setMenuOpen(false);
          }}
        >
          <EyeOff className="h-[18px] w-[18px] shrink-0 text-neutral-950" strokeWidth={1.5} />
          Mark as unread
        </button>
        <button type="button" role="menuitem" className={menuItemClass} onClick={startRename}>
          <Pencil className="h-[18px] w-[18px] shrink-0 text-neutral-950" strokeWidth={1.5} />
          Rename
        </button>
        <button
          type="button"
          role="menuitem"
          className={menuItemClass}
          onClick={() => {
            onAddToCase();
            setMenuOpen(false);
          }}
        >
          <Briefcase className="h-[18px] w-[18px] shrink-0 text-neutral-950" strokeWidth={1.5} />
          Add to case
        </button>
        <div className="my-1.5 h-px bg-neutral-200" role="presentation" />
        <button
          type="button"
          role="menuitem"
          className={menuItemDangerClass}
          onClick={() => {
            onDelete();
            setMenuOpen(false);
          }}
        >
          <Trash2 className="h-[18px] w-[18px] shrink-0 text-red-600" strokeWidth={1.5} />
          Delete
        </button>
      </AnimatedPopover>
    </div>
  );
}
