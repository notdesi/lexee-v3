"use client";

import Link from "next/link";
import {
  Brain,
  CalendarPlus,
  ChevronRight,
  FilePenLine,
  ListTodo,
  Paperclip,
  Plus,
  StickyNote,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { SKILLS, skillsSortedByCreatedDesc, type Skill } from "@/app/skills/skills-data";

const composerIconButtonClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-neutral-100 hover:text-neutral-950";

const MAIN_MENU_WIDTH = 200;
const SKILLS_MENU_WIDTH = 216;
const MENU_GAP = 6;

const preventFocusSteal = (event: ReactMouseEvent) => {
  event.preventDefault();
};

type ComposerMode = "document-drafting" | "task" | "event" | "note";

type ModeConfig = {
  key: ComposerMode;
  label: string;
  icon: LucideIcon;
  menuIconClass: string;
  pillClass: string;
  pillIconClass: string;
};

const MODE_OPTIONS: ModeConfig[] = [
  {
    key: "document-drafting",
    label: "Document drafting",
    icon: FilePenLine,
    menuIconClass: "text-violet-600",
    pillClass: "bg-violet-50 text-violet-800",
    pillIconClass: "text-violet-600",
  },
  {
    key: "task",
    label: "Create task",
    icon: ListTodo,
    menuIconClass: "text-sky-700",
    pillClass: "bg-sky-50 text-sky-900",
    pillIconClass: "text-sky-700",
  },
  {
    key: "event",
    label: "Create event",
    icon: CalendarPlus,
    menuIconClass: "text-teal-700",
    pillClass: "bg-teal-50 text-teal-900",
    pillIconClass: "text-teal-700",
  },
  {
    key: "note",
    label: "Create note",
    icon: StickyNote,
    menuIconClass: "text-stone-600",
    pillClass: "bg-stone-100 text-stone-800",
    pillIconClass: "text-stone-600",
  },
];

const MODE_CONFIG = Object.fromEntries(MODE_OPTIONS.map((mode) => [mode.key, mode])) as Record<
  ComposerMode,
  ModeConfig
>;

const COMPOSER_SKILLS = skillsSortedByCreatedDesc(SKILLS);

type ChatComposerAddMenuProps = {
  selectedSkillId?: string | null;
  onSkillSelect?: (skill: Skill) => void;
};

export function ChatComposerAddMenu({
  selectedSkillId = null,
  onSkillSelect,
}: ChatComposerAddMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ComposerMode | null>(null);
  const [mainMenuStyle, setMainMenuStyle] = useState<CSSProperties>({});
  const [skillsMenuStyle, setSkillsMenuStyle] = useState<CSSProperties>({});
  const menuRef = useRef<HTMLDivElement | null>(null);
  const plusButtonRef = useRef<HTMLButtonElement | null>(null);
  const skillsButtonRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateMenuPositions = useCallback(() => {
    const plusButton = plusButtonRef.current;
    if (!plusButton) return;

    const plusRect = plusButton.getBoundingClientRect();
    setMainMenuStyle({
      position: "fixed",
      top: plusRect.bottom + MENU_GAP,
      left: plusRect.left,
      width: MAIN_MENU_WIDTH,
      zIndex: 60,
    });

    const skillsButton = skillsButtonRef.current;
    if (!skillsButton) return;

    const skillsRect = skillsButton.getBoundingClientRect();
    const openToRight = skillsRect.right + MENU_GAP + SKILLS_MENU_WIDTH <= window.innerWidth - 8;
    setSkillsMenuStyle({
      position: "fixed",
      top: skillsRect.top,
      left: openToRight
        ? skillsRect.right + MENU_GAP
        : skillsRect.left - MENU_GAP - SKILLS_MENU_WIDTH,
      width: SKILLS_MENU_WIDTH,
      zIndex: 61,
    });
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuPositions();
  }, [menuOpen, skillsOpen, updateMenuPositions]);

  useEffect(() => {
    if (!menuOpen) {
      setSkillsOpen(false);
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        (target.closest("[data-composer-menu]") || target.closest("[data-composer-skills-menu]"))
      ) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", updateMenuPositions);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", updateMenuPositions);
    };
  }, [menuOpen, updateMenuPositions]);

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
    closeMenu();
    fileInputRef.current?.click();
  };

  const selectSkill = (skill: Skill) => {
    onSkillSelect?.(skill);
    closeMenu();
  };

  const activeMode = selectedMode ? MODE_CONFIG[selectedMode] : null;
  const ActiveModeIcon = activeMode?.icon;

  const mainMenu =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <AnimatedPopover
            open
            variant="fade"
            className="overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
            style={mainMenuStyle}
          >
            <div role="menu" data-composer-menu>
              {MODE_OPTIONS.map((config) => {
                const ModeIcon = config.icon;
                return (
                  <button
                    key={config.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selectedMode === config.key}
                    className={menuItemClass}
                    onMouseDown={preventFocusSteal}
                    onClick={() => selectMode(config.key)}
                  >
                    <ModeIcon
                      className={["h-[18px] w-[18px] shrink-0", config.menuIconClass].join(" ")}
                      strokeWidth={1.5}
                    />
                    {config.label}
                  </button>
                );
              })}

              <div className="my-1.5 h-px bg-neutral-200" role="presentation" />

              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onMouseDown={preventFocusSteal}
                onClick={openFilePicker}
              >
                <Paperclip className="h-[18px] w-[18px] shrink-0 text-neutral-950" strokeWidth={1.5} />
                Attach file
              </button>
              <button
                ref={skillsButtonRef}
                type="button"
                role="menuitem"
                aria-expanded={skillsOpen}
                className={menuItemClass}
                onMouseDown={preventFocusSteal}
                onClick={() => setSkillsOpen((open) => !open)}
              >
                <Brain className="h-[18px] w-[18px] shrink-0 text-neutral-950" strokeWidth={1.5} />
                <span className="min-w-0 flex-1">Skills</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
              </button>
            </div>
          </AnimatedPopover>,
          document.body,
        )
      : null;

  const skillsMenu =
    menuOpen && skillsOpen && typeof document !== "undefined"
      ? createPortal(
          <AnimatedPopover
            open
            variant="fade"
            className="max-h-[min(18rem,calc(100dvh-5rem))] overflow-y-auto rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
            style={skillsMenuStyle}
          >
            <div role="menu" data-composer-skills-menu>
              {COMPOSER_SKILLS.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  role="menuitem"
                  aria-checked={selectedSkillId === skill.id}
                  className={menuItemClass}
                  onMouseDown={preventFocusSteal}
                  onClick={() => selectSkill(skill)}
                >
                  <span className="min-w-0 truncate">{skill.title}</span>
                </button>
              ))}
              <div className="my-1.5 h-px bg-neutral-200" role="presentation" />
              <Link
                href="/skills"
                role="menuitem"
                className={menuItemClass}
                onMouseDown={preventFocusSteal}
                onClick={closeMenu}
              >
                View all skills
              </Link>
            </div>
          </AnimatedPopover>,
          document.body,
        )
      : null;

  return (
    <div className="flex min-w-0 items-center">
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
          ref={plusButtonRef}
          type="button"
          aria-label="Add"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onMouseDown={preventFocusSteal}
          onClick={() => setMenuOpen((open) => !open)}
          className={[
            composerIconButtonClass,
            menuOpen ? "bg-neutral-200/80 text-neutral-950" : "",
          ].join(" ")}
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>

        {selectedMode && activeMode && ActiveModeIcon ? (
          <span
            className={[
              "pointer-events-auto absolute left-[calc(100%+0.375rem)] top-1/2 z-10 inline-flex max-w-[10.5rem] -translate-y-1/2 items-center gap-1.5 rounded-full px-3 py-1.5 text-body-md-secondary font-medium",
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
              onMouseDown={preventFocusSteal}
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

      {mainMenu}
      {skillsMenu}
    </div>
  );
}
