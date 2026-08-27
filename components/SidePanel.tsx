"use client";

import Image from "next/image";
import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  Briefcase,
  ChevronRight,
  CircleCheck,
  History,
  MessageSquareHeart,
  MoreVertical,
  PackageOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Pin,
  Plus,
  Search,
  Settings,
  SunMoon,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { SettingsModal } from "@/components/SettingsModal";
import { uiMotionTransition } from "@/lib/ui-motion";
import {
  HISTORY_CHAT_ENTRIES,
  SHARED_HISTORY_CONVERSATION_ID,
} from "@/lib/history-chat";

type SidePanelItem = {
  key: string;
  label: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
};

type RecentChatEntry = { id: string; label: string; pinned: boolean };

export function SidePanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedHistoryConversationId, setSelectedHistoryConversationId] = useState<string | null>(
    null,
  );
  const [recentEntries, setRecentEntries] = useState<RecentChatEntry[]>(() =>
    HISTORY_CHAT_ENTRIES.map((e) => ({ ...e, pinned: false })),
  );
  const [historyRowMenuId, setHistoryRowMenuId] = useState<string | null>(null);
  const recentMenuRef = useRef<HTMLDivElement | null>(null);
  const [recentExpanded, setRecentExpanded] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [appearanceMenuOpen, setAppearanceMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const storedTheme = window.localStorage.getItem("theme");
    return storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : "light";
  });
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      const target = event.target as Node;
      if (!profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
        setAppearanceMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!collapsed) return;
    setProfileMenuOpen(false);
    setAppearanceMenuOpen(false);
    setHistoryRowMenuId(null);
  }, [collapsed]);

  useEffect(() => {
    const onActiveConversation = (event: Event) => {
      const id = (event as CustomEvent<{ conversationId: string | null }>).detail?.conversationId;
      if (id === null) setSelectedHistoryConversationId(null);
    };
    const onHistoryNavSelected = (event: Event) => {
      const navId = (event as CustomEvent<{ navId?: string }>).detail?.navId;
      if (navId) setSelectedHistoryConversationId(navId);
    };
    window.addEventListener("lexee:active-conversation-changed", onActiveConversation);
    window.addEventListener("lexee:history-nav-selected", onHistoryNavSelected);
    return () => {
      window.removeEventListener("lexee:active-conversation-changed", onActiveConversation);
      window.removeEventListener("lexee:history-nav-selected", onHistoryNavSelected);
    };
  }, []);

  useEffect(() => {
    if (!historyRowMenuId) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (recentMenuRef.current?.contains(target)) return;
      setHistoryRowMenuId(null);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [historyRowMenuId]);

  useEffect(() => {
    if (!historyRowMenuId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHistoryRowMenuId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [historyRowMenuId]);

  const sortedRecentEntries = useMemo(() => {
    const pinned = recentEntries.filter((e) => e.pinned);
    const unpinned = recentEntries.filter((e) => !e.pinned);
    return [...pinned, ...unpinned];
  }, [recentEntries]);

  const openRecentConversation = (entryId: string) => {
    setSelectedHistoryConversationId(entryId);
    setHistoryRowMenuId(null);
    if (pathname === "/") {
      window.dispatchEvent(
        new CustomEvent("lexee:open-history-conversation", {
          detail: { conversationId: SHARED_HISTORY_CONVERSATION_ID },
        }),
      );
      return;
    }
    window.sessionStorage.setItem("lexee:pending-history-nav", entryId);
    router.push("/");
  };

  const handlePinRecent = (id: string) => {
    setRecentEntries((prev) => prev.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)));
    setHistoryRowMenuId(null);
  };

  const handleRenameRecent = (entry: RecentChatEntry) => {
    const next = window.prompt("Rename conversation", entry.label);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    setRecentEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, label: trimmed } : e)));
    setHistoryRowMenuId(null);
  };

  const handleDeleteRecent = (id: string) => {
    setRecentEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedHistoryConversationId === id) {
      setSelectedHistoryConversationId(null);
    }
    setHistoryRowMenuId(null);
  };

  const reduceMotion = useReducedMotion();

  const recentMenuItemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-inter text-[14px] font-normal leading-5 text-neutral-950 ui-t-colors hover:bg-neutral-100";

  const primaryNavItems: SidePanelItem[] = [
      {
        key: "new-chat",
        label: "New chat",
        icon: Plus,
        onClick: () => {
          if (pathname === "/") {
            window.dispatchEvent(new CustomEvent("lexee:new-chat"));
            return;
          }
          router.push("/");
        },
      },
      {
        key: "search",
        label: "Search",
        icon: Search,
        onClick: () => {
          router.push("/search");
        },
      },
      {
        key: "artifacts",
        label: "Artifacts",
        icon: PackageOpen,
        onClick: () => {
          router.push("/artifacts");
        },
      },
      {
        key: "skills",
        label: "Skills",
        icon: Brain,
        onClick: () => {
          router.push("/skills");
        },
      },
      {
        key: "todo",
        label: "To-Do",
        icon: CircleCheck,
        onClick: () => {
          // Prototype: replace with real to-do page later.
        },
      },
      {
        key: "jobs",
        label: "Jobs",
        icon: Briefcase,
        onClick: () => {
          // Prototype: replace with real jobs page later.
        },
      },
      {
        key: "share-feedback",
        label: "Help & Feedback",
        icon: MessageSquareHeart,
        onClick: () => {
          router.push("/feedback");
        },
      },
      {
        key: "history",
        label: "History",
        icon: History,
        onClick: () => {
          // Prototype: replace with real chat history later.
        },
      },
  ];

  /**
   * One primary nav row highlighted at a time. When a history thread is open on `/`,
   * no primary item is active — the nested history row shows selection instead.
   */
  const activeNavKey = (() => {
    if (pathname === "/search") return "search";
    if (pathname === "/skills" || pathname.startsWith("/skills/")) return "skills";
    if (pathname === "/feedback") return "share-feedback";
    if (pathname === "/artifacts") return "artifacts";
    if (pathname === "/") {
      if (selectedHistoryConversationId) return null;
      if (selectedKey === "history") return "history";
      if (
        selectedKey === "artifacts" ||
        selectedKey === "todo" ||
        selectedKey === "jobs" ||
        selectedKey === "share-feedback"
      ) {
        return selectedKey;
      }
      return "new-chat";
    }
    return selectedKey || null;
  })();

  const renderSidebarNavRow = (item: SidePanelItem) => {
    const Icon = item.icon;
    const canExpand = item.key === "history";
    const isActive = activeNavKey === item.key;
    const isHistory = item.key === "history";
    const isNewChat = item.key === "new-chat";
    return (
      <div key={item.key} className={isHistory ? "mt-8" : undefined}>
        <div
          className={[
            "group mx-2 flex w-[calc(100%-16px)] items-center rounded-[6px] ui-t-colors",
            "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950",
            isActive ? "bg-neutral-200 text-neutral-950" : "",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label={collapsed ? item.label : undefined}
            onClick={() => {
              setSelectedKey(item.key);
              if (isHistory) {
                setRecentExpanded((value) => !value);
              }
              item.onClick?.();
            }}
            className="flex min-w-0 flex-1 items-center gap-2 px-[10px] py-[6px] text-left text-inherit hover:text-inherit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300"
          >
            {Icon ? (
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center",
                  isNewChat
                    ? "h-6 w-6 rounded-full bg-neutral-300 text-neutral-950"
                    : "",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </span>
            ) : null}
            <span
              aria-hidden={collapsed}
              className={[
                "min-w-0 truncate transition-[opacity,max-width] duration-200 ease-out motion-reduce:transition-none",
                isHistory
                  ? "text-[12px] leading-4"
                  : "text-body-md-secondary leading-[20px]",
                collapsed
                  ? "max-w-0 overflow-hidden opacity-0"
                  : "max-w-[200px] opacity-100",
                isActive && !collapsed ? "text-neutral-950" : "",
              ].join(" ")}
            >
              {item.label}
            </span>
          </button>
          {!collapsed && canExpand ? (
            <button
              type="button"
              aria-label={recentExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
              aria-expanded={recentExpanded}
              onClick={() => {
                setRecentExpanded((value) => !value);
              }}
              className="mr-1 inline-flex shrink-0 items-center justify-center rounded-sm px-1 py-1 text-neutral-700 opacity-0 ui-t-opacity hover:text-neutral-950 group-hover:opacity-100"
            >
              <ChevronRight
                className={[
                  "h-4 w-4 ui-t-transform",
                  recentExpanded ? "rotate-90" : "",
                ].join(" ")}
                strokeWidth={1.75}
              />
            </button>
          ) : null}
        </div>

        {!collapsed && isHistory && recentExpanded ? (
          <div className="mt-0 flex flex-col gap-0.5 pb-1 px-2">
            {sortedRecentEntries.map((entry) => {
              const entryActive =
                pathname === "/" && selectedHistoryConversationId === entry.id;
              return (
                <div
                  key={entry.id}
                  ref={historyRowMenuId === entry.id ? recentMenuRef : undefined}
                  className="relative"
                >
                  <div
                    className={[
                      "group flex w-full items-center gap-0.5 rounded-[6px] font-inter text-[14px] leading-[22px] ui-t-colors",
                      entryActive
                        ? "bg-neutral-200 text-neutral-950"
                        : "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate px-2 py-2 text-left text-inherit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300"
                      onClick={() => openRecentConversation(entry.id)}
                    >
                      {entry.label}
                    </button>
                    <button
                      type="button"
                      aria-expanded={historyRowMenuId === entry.id}
                      aria-haspopup="menu"
                      aria-label="More options"
                      className={[
                        "mr-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 ui-t-opacity",
                        "hover:bg-neutral-200/80 hover:text-neutral-800",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300",
                        historyRowMenuId === entry.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100",
                      ].join(" ")}
                      onClick={(event) => {
                        event.stopPropagation();
                        setHistoryRowMenuId((open) => (open === entry.id ? null : entry.id));
                      }}
                    >
                      <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {historyRowMenuId === entry.id ? (
                      <motion.div
                        role="menu"
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 2, scale: 0.99 }}
                        transition={uiMotionTransition(reduceMotion, 0.15)}
                        className="absolute right-0 top-full z-[100] mt-1.5 w-[11.5rem] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_4px_24px_rgba(18,18,18,0.12)]"
                      >
                      <button
                        type="button"
                        role="menuitem"
                        className={recentMenuItemClass}
                        onClick={() => handlePinRecent(entry.id)}
                      >
                        <Pin
                          className={[
                            "h-[18px] w-[18px] shrink-0 text-neutral-950",
                            entry.pinned ? "fill-neutral-950" : "fill-none",
                          ].join(" ")}
                          strokeWidth={1.5}
                        />
                        {entry.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={recentMenuItemClass}
                        onClick={() => handleRenameRecent(entry)}
                      >
                        <Pencil className="h-[18px] w-[18px] shrink-0 text-neutral-950" strokeWidth={1.5} />
                        Rename
                      </button>
                      <div className="my-1.5 h-px bg-neutral-200" role="presentation" />
                      <button
                        type="button"
                        role="menuitem"
                        className={`${recentMenuItemClass} text-[#8b2942] hover:bg-neutral-100 hover:text-[#6d1f33]`}
                        onClick={() => handleDeleteRecent(entry.id)}
                      >
                        <Trash2 className="h-[18px] w-[18px] shrink-0 text-[#8b2942]" strokeWidth={1.5} />
                        Delete
                      </button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  const widthClass = collapsed ? "w-16" : "w-[clamp(192px,18.75vw,240px)]";
  const widthTransitionClass =
    "transition-[width] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none motion-reduce:duration-0";

  return (
    <div
      className={["relative z-40 shrink-0 self-start", widthClass, widthTransitionClass].join(
        " ",
      )}
    >
      <aside
        className={[
          "fixed left-0 top-0 z-0 flex h-[100dvh] flex-col border-r border-neutral-200 bg-neutral-50",
          widthClass,
          widthTransitionClass,
        ].join(" ")}
      >
        <div className="flex h-14 shrink-0 items-center">
          {collapsed ? (
            <div className="flex w-16 shrink-0 items-center justify-center">
              <button
                type="button"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 ui-t-colors"
                onClick={() => setCollapsed(false)}
                aria-label="Expand sidebar"
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <Image
                    src="/lexee-symbol.svg"
                    alt=""
                    width={24}
                    height={24}
                    priority
                    aria-hidden
                    className="ui-t-opacity group-hover:opacity-0"
                  />
                  <PanelLeftOpen
                    className="absolute h-[18px] w-[18px] opacity-0 ui-t-opacity group-hover:opacity-100"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="flex h-14 min-w-0 flex-1 items-center justify-start px-[10px] rounded-md -translate-x-px"
              aria-label="Lexee"
            >
              <span className="truncate font-tiempos-headline text-[20px] leading-none tracking-[-0.01em] text-neutral-950">
                Lexee
              </span>
            </button>
          )}

          <div className="flex flex-1 items-center justify-end pr-3">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-md",
                "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950",
                "transition-opacity duration-200 ease-out motion-reduce:transition-none",
                collapsed ? "pointer-events-none opacity-0" : "opacity-100",
              ].join(" ")}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ToggleIcon
                className="h-[18px] w-[18px] text-neutral-700"
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden py-2">
          <div className="flex flex-col gap-1">
            {primaryNavItems.map((item) => renderSidebarNavRow(item))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-neutral-200 p-2">
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen((open) => !open);
                setAppearanceMenuOpen(false);
              }}
              className={[
                "w-full rounded-[6px] px-[10px] py-[6px]",
                "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 ui-t-colors",
                collapsed ? "flex items-center justify-center" : "flex items-center gap-2",
              ].join(" ")}
              aria-label="Profile selector"
            >
              <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-neutral-200">
                <Image
                  src="/matt-murdock.webp"
                  alt="Matt Murdock"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </span>
              <span
                className={[
                  "min-w-0 overflow-hidden text-left transition-[opacity,max-width] duration-200 ease-out motion-reduce:transition-none",
                  collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100",
                ].join(" ")}
                aria-hidden={collapsed}
              >
                <span className="block truncate text-body-md text-neutral-950">
                  Matt Murdock
                </span>
                <span className="block truncate text-caption text-neutral-500">
                  Attorney
                </span>
              </span>
            </button>

            <AnimatedPopover
              open={profileMenuOpen}
              className="absolute bottom-full left-0 z-50 mb-2 flex items-end gap-2"
            >
                <div className="w-[260px] rounded-xl border border-neutral-300 bg-neutral-50 p-2 shadow-[var(--shadow-panel)]">
                  <div className="rounded-lg px-2 py-2">
                    <p className="text-body-md text-neutral-950">Matt Murdock</p>
                    <p className="text-caption text-neutral-500">
                      murdock@aswelaslaw.com
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setAppearanceMenuOpen(false);
                      setSettingsModalOpen(true);
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body-md-secondary text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
                  >
                    <Settings className="h-4 w-4" strokeWidth={1.75} />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppearanceMenuOpen((open) => !open)}
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body-md-secondary text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
                    aria-expanded={appearanceMenuOpen}
                  >
                    <SunMoon className="h-4 w-4" strokeWidth={1.75} />
                    <span>Appearance</span>
                    <ChevronRight
                      className="ml-auto h-4 w-4 text-neutral-500"
                      strokeWidth={1.75}
                    />
                  </button>
                </div>

                <AnimatedPopover
                  open={appearanceMenuOpen}
                  className="w-[168px] shrink-0 rounded-xl border border-neutral-300 bg-neutral-50 p-2 shadow-[var(--shadow-panel)]"
                >
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={[
                        "flex w-full items-center rounded-md px-2 py-2 text-left text-[12px] leading-4",
                        theme === "light"
                          ? "bg-neutral-200 text-neutral-950"
                          : "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950",
                      ].join(" ")}
                    >
                      Light mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={[
                        "mt-1 flex w-full items-center rounded-md px-2 py-2 text-left text-[12px] leading-4",
                        theme === "dark"
                          ? "bg-neutral-200 text-neutral-950"
                          : "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950",
                      ].join(" ")}
                    >
                      Dark mode
                    </button>
                </AnimatedPopover>
            </AnimatedPopover>
          </div>
        </div>
      </aside>

      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
}
