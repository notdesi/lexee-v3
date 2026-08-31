"use client";

import Link from "next/link";
import {
  Brain,
  ChevronRight,
  CircleCheck,
  FilePenLine,
  Paperclip,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { SKILLS, skillsSortedByCreatedDesc } from "@/app/skills/skills-data";

const composerIconButtonClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-neutral-100 hover:text-neutral-950";

type ComposerMode = "draft" | "todo";

type ModeConfig = {
  label: string;
  icon: LucideIcon;
  menuIconClass: string;
  pillClass: string;
  pillIconClass: string;
};

const MODE_CONFIG: Record<ComposerMode, ModeConfig> = {
  draft: {
    label: "Draft",
    icon: FilePenLine,
    menuIconClass: "text-violet-600",
    pillClass: "bg-violet-50 text-violet-800",
    pillIconClass: "text-violet-600",
  },
  todo: {
    label: "To-Do",
    icon: CircleCheck,
    menuIconClass: "text-amber-600",
    pillClass: "bg-amber-50 text-amber-900",
    pillIconClass: "text-amber-600",
  },
};

const COMPOSER_SKILLS = skillsSortedByCreatedDesc(SKILLS);

export function ChatComposerAddMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ComposerMode | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      setSkillsOpen(false);
      return;
    }
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

  const closeMenu = () => {
    setMenuOpen(false);
    setSkillsOpen(false);
  };

  const selectMode = (mode: ComposerMode) => {
    setSelectedMode(mode);
    closeMenu();
  };

  const clearMode = () => {
    setSelectedMode(null);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
    closeMenu();
  };

  const activeMode = selectedMode ? MODE_CONFIG[selectedMode] : null;
  const ActiveModeIcon = activeMode?.icon;

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <div ref={menuRef} className="relative shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          multiple
          onChange={() => {
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />

        <button
          type="button"
          aria-label="Add"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
          className={[
            composerIconButtonClass,
            menuOpen ? "bg-neutral-200/80 text-neutral-950" : "",
          ].join(" ")}
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>

        <AnimatedPopover
          open={menuOpen}
          className="absolute top-full left-0 z-50 mt-1.5 flex items-start gap-1.5"
        >
          <div
            role="menu"
            className="w-[12.5rem] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
          >
            {(Object.entries(MODE_CONFIG) as [ComposerMode, ModeConfig][]).map(
              ([mode, config]) => {
                const ModeIcon = config.icon;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selectedMode === mode}
                    className={menuItemClass}
                    onClick={() => selectMode(mode)}
                  >
                    <ModeIcon
                      className={["h-[18px] w-[18px] shrink-0", config.menuIconClass].join(" ")}
                      strokeWidth={1.5}
                    />
                    {config.label}
                  </button>
                );
              },
            )}

            <div className="my-1.5 h-px bg-neutral-200" role="presentation" />

            <button type="button" role="menuitem" className={menuItemClass} onClick={openFilePicker}>
              <Paperclip className="h-[18px] w-[18px] shrink-0 text-neutral-950" strokeWidth={1.5} />
              Attach file
            </button>
            <button
              type="button"
              role="menuitem"
              aria-expanded={skillsOpen}
              className={menuItemClass}
              onClick={() => setSkillsOpen((open) => !open)}
            >
              <Brain className="h-[18px] w-[18px] shrink-0 text-neutral-950" strokeWidth={1.5} />
              <span className="min-w-0 flex-1">Skills</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
            </button>
          </div>

          <AnimatedPopover
            open={skillsOpen}
            className="w-[13.5rem] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
          >
            <div role="menu">
              {COMPOSER_SKILLS.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={closeMenu}
                >
                  <span className="min-w-0 truncate">{skill.title}</span>
                </button>
              ))}
              <div className="my-1.5 h-px bg-neutral-200" role="presentation" />
              <Link
                href="/skills"
                role="menuitem"
                className={menuItemClass}
                onClick={closeMenu}
              >
                View all skills
              </Link>
            </div>
          </AnimatedPopover>
        </AnimatedPopover>
      </div>

      {selectedMode && activeMode && ActiveModeIcon ? (
        <span
          className={[
            "inline-flex max-w-[10.5rem] shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-body-md-secondary font-medium",
            activeMode.pillClass,
          ].join(" ")}
        >
          <ActiveModeIcon
            className={["h-4 w-4 shrink-0", activeMode.pillIconClass].join(" ")}
            strokeWidth={1.75}
          />
          <span className="min-w-0 truncate">{activeMode.label}</span>
          <button
            type="button"
            aria-label={`Remove ${activeMode.label} mode`}
            onClick={clearMode}
            className={[
              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ui-t-colors hover:bg-black/5",
              activeMode.pillIconClass,
            ].join(" ")}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </span>
      ) : null}
    </div>
  );
}
