"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CreditCard,
  LayoutGrid,
  Search,
  Settings2,
  X,
} from "lucide-react";
import type { ComponentType } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

type SettingsNavId = "configuration" | "usage" | "billing";

type SettingsNavItem = {
  id: SettingsNavId;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { id: "configuration", label: "Configuration", icon: Settings2 },
  { id: "usage", label: "Usage", icon: LayoutGrid },
  { id: "billing", label: "Billing and purchase history", icon: CreditCard },
];

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [activeNavId, setActiveNavId] = useState<SettingsNavId>("configuration");

  const overlayTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const };

  const filteredNavItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return SETTINGS_NAV_ITEMS;
    return SETTINGS_NAV_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(normalized),
    );
  }, [query]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveNavId("configuration");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="settings-modal"
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
            onMouseDown={handleClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex h-[min(82vh,720px)] w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-300 bg-[var(--background)] shadow-[var(--shadow-panel)]"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 14, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.99 }
            }
            transition={panelTransition}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Sidebar */}
            <aside className="flex w-[240px] shrink-0 flex-col border-r border-neutral-200 bg-neutral-50">
              <div className="px-3 pb-2 pt-4">
                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-[var(--background)] px-3 py-2 focus-within:border-violet-300/80 focus-within:ring-2 focus-within:ring-violet-200/60">
                  <Search
                    className="h-4 w-4 shrink-0 text-neutral-500"
                    strokeWidth={1.75}
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    aria-label="Search settings"
                    className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <nav
                className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 pt-2"
                aria-label="Settings"
              >
                <p className="px-2 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">
                  Settings
                </p>
                <div className="flex flex-col gap-0.5">
                  {filteredNavItems.length > 0 ? (
                    filteredNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeNavId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveNavId(item.id)}
                          className={[
                            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left ui-t-colors",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300",
                            isActive
                              ? "bg-neutral-200 text-neutral-950"
                              : "text-neutral-700 hover:bg-neutral-200/70 hover:text-neutral-950",
                          ].join(" ")}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0 text-neutral-600"
                            strokeWidth={1.75}
                          />
                          <span className="truncate text-body-md-secondary text-inherit">
                            {item.label}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-2.5 py-3 text-[12px] leading-4 text-neutral-500">
                      No matching settings
                    </p>
                  )}
                </div>
              </nav>
            </aside>

            {/* Content shell (empty for now) */}
            <div className="relative flex min-w-0 flex-1 flex-col bg-[var(--background)]">
              <div className="flex shrink-0 items-center justify-between gap-3 px-6 pb-2 pt-4">
                <h2
                  id={titleId}
                  className="font-tiempos-headline text-[22px] leading-none tracking-[-0.015em] text-neutral-950"
                >
                  {SETTINGS_NAV_ITEMS.find((item) => item.id === activeNavId)?.label ??
                    "Settings"}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                  aria-label="Close settings"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6" />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
