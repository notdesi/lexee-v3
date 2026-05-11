"use client";

import Image from "next/image";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  ChevronRight,
  Folder,
  History,
  MonitorCog,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  SunMoon,
} from "lucide-react";

type SidePanelItem = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
};

export function SidePanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [appearanceMenuOpen, setAppearanceMenuOpen] = useState(false);
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
    const handleRightPanelOpened = () => {
      setCollapsed(true);
    };

    window.addEventListener("lexee:right-panel-opened", handleRightPanelOpened);
    return () => {
      window.removeEventListener("lexee:right-panel-opened", handleRightPanelOpened);
    };
  }, []);

  useEffect(() => {
    if (!collapsed) return;
    setProfileMenuOpen(false);
    setAppearanceMenuOpen(false);
  }, [collapsed]);

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
        key: "projects",
        label: "Projects",
        icon: Folder,
        onClick: () => {
          // Prototype: replace with real projects page later.
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
  ];

  const historyNavItem: SidePanelItem = {
    key: "history",
    label: "History",
    icon: History,
    onClick: () => {
      // Prototype: replace with real chat history later.
    },
  };

  const renderSidebarNavRow = (item: SidePanelItem) => {
    const Icon = item.icon;
    const canExpand = item.key === "projects" || item.key === "history";
    const isRouteActive =
      (item.key === "search" && pathname === "/search") ||
      (item.key === "skills" && pathname === "/skills") ||
      (item.key === "new-chat" && pathname === "/");
    const isActive = selectedKey === item.key || isRouteActive;
    return (
      <div key={item.key}>
        <div
          className={[
            "group mx-2 flex w-[calc(100%-16px)] items-center rounded-[6px]",
            "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950",
            isActive ? "bg-neutral-200 text-neutral-950" : "",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label={collapsed ? item.label : undefined}
            onClick={() => {
              setSelectedKey(item.key);
              item.onClick?.();
            }}
            className="flex min-w-0 flex-1 items-center gap-2 px-[10px] py-[6px] text-left text-inherit hover:text-inherit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300"
          >
            <span
              className={[
                "flex h-5 w-5 shrink-0 items-center justify-center",
                item.key === "new-chat"
                  ? "h-6 w-6 rounded-full bg-neutral-300 text-neutral-950"
                  : "",
              ].join(" ")}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={1.5}
              />
            </span>
            <span
              aria-hidden={collapsed}
              className={[
                "min-w-0 truncate text-body-md-secondary leading-[20px]",
                "transition-[opacity,max-width] duration-200 ease-out motion-reduce:transition-none",
                collapsed ? "max-w-0 overflow-hidden opacity-0" : "max-w-[200px] opacity-100",
                isActive && !collapsed ? "text-neutral-950" : "",
              ].join(" ")}
            >
              {item.label}
            </span>
          </button>
          {!collapsed && canExpand ? (
            <button
              type="button"
              aria-label={`Expand ${item.label}`}
              onClick={() => {
                if (item.key === "projects") {
                  setProjectsExpanded((value) => !value);
                }
                if (item.key === "history") {
                  setHistoryExpanded((value) => !value);
                }
              }}
              className="mr-1 inline-flex shrink-0 items-center justify-center rounded-sm px-1 py-1 text-neutral-700 opacity-0 transition-opacity hover:text-neutral-950 group-hover:opacity-100"
            >
              <ChevronRight
                className={[
                  "h-4 w-4 transition-transform",
                  item.key === "projects" && projectsExpanded ? "rotate-90" : "",
                  item.key === "history" && historyExpanded ? "rotate-90" : "",
                ].join(" ")}
                strokeWidth={1.75}
              />
            </button>
          ) : null}
        </div>

        {!collapsed && item.key === "projects" && projectsExpanded ? (
          <div className="mt-1 flex flex-col gap-1 pb-1 px-2">
            {["Lead", "Intake", "Matter"].map((subItem) => (
              <button
                key={subItem}
                type="button"
                className="rounded-[6px] px-2 py-1 text-left font-inter text-[12px] leading-4 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
              >
                {subItem}
              </button>
            ))}
          </div>
        ) : null}

        {!collapsed && item.key === "history" && historyExpanded ? (
          <div className="mt-1 flex flex-col gap-1 pb-1 px-2">
            <button
              type="button"
              onClick={() => {
                if (pathname === "/") {
                  window.dispatchEvent(
                    new CustomEvent("lexee:open-history-conversation", {
                      detail: { conversationId: "medical-summary-demo" },
                    }),
                  );
                  return;
                }
                window.sessionStorage.setItem(
                  "lexee:pending-history-conversation",
                  "medical-summary-demo",
                );
                router.push("/");
              }}
              className="w-full rounded-[6px] px-2 py-2 text-left font-inter text-[12px] leading-4 whitespace-nowrap truncate text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
            >
              Create Medical summary
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  const widthClass = collapsed ? "w-16" : "w-[clamp(192px,18.75vw,240px)]";
  const widthTransitionClass =
    "transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none motion-reduce:duration-0";

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
          <button
            type="button"
            className="flex h-14 w-16 shrink-0 items-center justify-center rounded-md -translate-x-px"
            onClick={() => {
              if (collapsed) setCollapsed(false);
            }}
            aria-label={collapsed ? "Expand sidebar" : "Lexee"}
          >
            <Image
              src="/lexee-symbol.svg"
              alt="Lexee"
              width={24}
              height={24}
              priority
            />
          </button>

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
          <div className="mt-10 flex flex-col gap-1">
            {renderSidebarNavRow(historyNavItem)}
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
                "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950",
                collapsed ? "flex items-center justify-center" : "flex items-center gap-2",
              ].join(" ")}
              aria-label="Profile selector"
            >
              <Image
                src="/matt-murdock.webp"
                alt="Matt Murdock"
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-full border border-neutral-200 object-cover"
              />
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

            {profileMenuOpen ? (
              <div className="absolute bottom-full left-0 z-50 mb-2 flex items-end gap-2">
                <div className="w-[260px] rounded-xl border border-neutral-300 bg-neutral-50 p-2 shadow-[0_8px_24px_rgba(18,18,18,0.12)]">
                  <div className="rounded-lg px-2 py-2">
                    <p className="text-body-md text-neutral-950">Matt Murdock</p>
                    <p className="text-caption text-neutral-500">
                      murdock@aswelaslaw.com
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body-md-secondary text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
                  >
                    <MonitorCog className="h-4 w-4" strokeWidth={1.75} />
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

                {appearanceMenuOpen ? (
                  <div className="w-[168px] shrink-0 rounded-xl border border-neutral-300 bg-neutral-50 p-2 shadow-[0_8px_24px_rgba(18,18,18,0.12)]">
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
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
