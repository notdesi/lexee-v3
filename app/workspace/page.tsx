"use client";

import { CalendarDays, Check, ChevronDown, LayoutList, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPanel } from "@/components/AnimatedPanel";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { EventCalendar } from "@/components/EventCalendar";
import { EventCard } from "@/components/EventCard";
import { EventDetailPanel } from "@/components/EventDetailPanel";
import { SegmentPillNav } from "@/components/SegmentPillNav";
import { TaskCard } from "@/components/TaskCard";
import type { CalendarTimeframe } from "@/lib/event-calendar";
import {
  CURRENT_WORKSPACE_USER,
  WORKSPACE_ITEMS,
  countEventsByAssignmentFilter,
  countTasksByAssignmentFilter,
  countWorkspaceItemsByType,
  formatWorkspaceActivity,
  isWorkspaceEvent,
  isWorkspaceNote,
  isWorkspaceTask,
  sortWorkspaceNotes,
  eventMatchesAssignmentFilter,
  taskMatchesAssignmentFilter,
  type EventAssignmentFilter,
  type EventViewMode,
  type NoteSortOption,
  type TaskAssignmentFilter,
  type WorkspaceEvent,
  type WorkspaceItemType,
} from "@/lib/workspace";
import { UI_CARD_INTERACTIVE } from "@/lib/ui-motion";

const TYPE_OPTIONS: { value: WorkspaceItemType; label: string }[] = [
  { value: "task", label: "Tasks" },
  { value: "event", label: "Events" },
  { value: "note", label: "Notes" },
];

const TASK_ASSIGNMENT_OPTIONS: { value: TaskAssignmentFilter; label: string }[] = [
  { value: "assigned-to-me", label: "Assigned to me" },
  { value: "assigned-by-me", label: "Assigned by me" },
];

const EVENT_ASSIGNMENT_OPTIONS: { value: EventAssignmentFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "assigned-to-me", label: "Assigned to me" },
];

const EVENT_VIEW_OPTIONS: { value: EventViewMode; label: string }[] = [
  { value: "list", label: "List" },
  { value: "calendar", label: "Calendar" },
];

const NOTE_SORT_OPTIONS: { value: NoteSortOption; label: string }[] = [
  { value: "last-updated", label: "Last updated" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "case", label: "Case" },
];

const EMPTY_TYPE_COPY: Record<WorkspaceItemType, string> = {
  task: "No tasks yet.",
  event: "No events yet.",
  note: "No notes yet.",
};

const EMPTY_TASK_ASSIGNMENT_COPY: Record<TaskAssignmentFilter, string> = {
  "assigned-to-me": "No tasks assigned to you.",
  "assigned-by-me": "No tasks assigned by you.",
};

const EMPTY_EVENT_ASSIGNMENT_COPY: Record<EventAssignmentFilter, string> = {
  all: "No events yet.",
  "assigned-to-me": "No events assigned to you.",
};

type AssignmentFilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

function AssignmentFilterDropdown<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  fallbackLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: AssignmentFilterOption<T>[];
  ariaLabel: string;
  fallbackLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const activeLabel = options.find((option) => option.value === value)?.label ?? fallbackLabel;

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
      >
        <span>{activeLabel}</span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-neutral-500 ui-t-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          strokeWidth={1.75}
        />
      </button>

      <AnimatedPopover
        open={open}
        className="absolute right-0 top-full z-50 mt-1.5 w-[13.5rem] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
      >
        {options.map((option) => {
          const isActive = option.value === value;
          const label =
            option.count != null ? `${option.label} (${option.count})` : option.label;
          return (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={[
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-body-md-secondary ui-t-colors",
                isActive
                  ? "bg-violet-100 text-neutral-950"
                  : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
              ].join(" ")}
            >
              <span className="min-w-0 flex-1">{label}</span>
              {isActive ? (
                <Check className="h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
              ) : null}
            </button>
          );
        })}
      </AnimatedPopover>
    </div>
  );
}

export default function WorkspacePage() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(true);
  const [type, setType] = useState<WorkspaceItemType>("task");
  const [taskAssignmentFilter, setTaskAssignmentFilter] = useState<TaskAssignmentFilter>("assigned-to-me");
  const [eventAssignmentFilter, setEventAssignmentFilter] = useState<EventAssignmentFilter>("all");
  const [eventViewMode, setEventViewMode] = useState<EventViewMode>("list");
  const [calendarTimeframe, setCalendarTimeframe] = useState<CalendarTimeframe>("month");
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => new Date(2026, 8, 1));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [noteSort, setNoteSort] = useState<NoteSortOption>("last-updated");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const useSplitLayout = type === "event" && eventViewMode === "calendar";

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!eventDetailOpen) return;
    window.dispatchEvent(new CustomEvent("lexee:right-panel-opened"));
  }, [eventDetailOpen]);

  const clearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  const typeCounts = useMemo(() => countWorkspaceItemsByType(WORKSPACE_ITEMS), []);

  const pillOptions = useMemo(
    () =>
      TYPE_OPTIONS.map((option) => ({
        ...option,
        count: typeCounts[option.value],
      })),
    [typeCounts],
  );

  const taskAssignmentCounts = useMemo(
    () => countTasksByAssignmentFilter(WORKSPACE_ITEMS, CURRENT_WORKSPACE_USER.id),
    [],
  );

  const taskAssignmentOptions = useMemo(
    () =>
      TASK_ASSIGNMENT_OPTIONS.map((option) => ({
        ...option,
        count: taskAssignmentCounts[option.value],
      })),
    [taskAssignmentCounts],
  );

  const eventAssignmentCounts = useMemo(
    () => countEventsByAssignmentFilter(WORKSPACE_ITEMS, CURRENT_WORKSPACE_USER.id),
    [],
  );

  const eventAssignmentOptions = useMemo(
    () =>
      EVENT_ASSIGNMENT_OPTIONS.map((option) => ({
        ...option,
        count: eventAssignmentCounts[option.value],
      })),
    [eventAssignmentCounts],
  );

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = WORKSPACE_ITEMS.filter((item) => {
      if (item.type !== type) return false;

      if (type === "task" && isWorkspaceTask(item)) {
        if (!taskMatchesAssignmentFilter(item, taskAssignmentFilter, CURRENT_WORKSPACE_USER.id)) {
          return false;
        }
      }

      if (type === "event" && isWorkspaceEvent(item)) {
        if (!eventMatchesAssignmentFilter(item, eventAssignmentFilter, CURRENT_WORKSPACE_USER.id)) {
          return false;
        }
      }

      if (!normalized) return true;

      const searchable = [item.title, item.matter];
      if (isWorkspaceEvent(item) && item.location) {
        searchable.push(item.location);
      }

      return searchable.some((value) => value.toLowerCase().includes(normalized));
    });

    if (type === "event") {
      return filtered
        .filter(isWorkspaceEvent)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    }

    if (type === "note") {
      return sortWorkspaceNotes(filtered.filter(isWorkspaceNote), noteSort);
    }

    return filtered;
  }, [eventAssignmentFilter, noteSort, query, taskAssignmentFilter, type]);

  const visibleEvents = useMemo(
    () => visibleItems.filter(isWorkspaceEvent),
    [visibleItems],
  );

  const selectedEvent = useMemo(
    () => visibleEvents.find((event) => event.id === selectedEventId) ?? null,
    [selectedEventId, visibleEvents],
  );

  const openEventDetail = useCallback((event: WorkspaceEvent) => {
    setSelectedEventId(event.id);
    setEventDetailOpen(true);
  }, []);

  const closeEventDetail = useCallback(() => {
    setEventDetailOpen(false);
    setSelectedEventId(null);
  }, []);

  const emptyCopy =
    type === "task"
      ? EMPTY_TASK_ASSIGNMENT_COPY[taskAssignmentFilter]
      : type === "event"
        ? EMPTY_EVENT_ASSIGNMENT_COPY[eventAssignmentFilter]
        : EMPTY_TYPE_COPY[type];

  return (
    <div
      className={[
        "flex h-[100dvh] min-h-0 w-full min-w-0 flex-1 bg-[var(--background)]",
        useSplitLayout ? "flex-row overflow-hidden" : "flex-col overflow-y-auto",
      ].join(" ")}
    >
      <div
        className={[
          "flex min-h-0 min-w-0 flex-1 flex-col px-8 py-8",
          useSplitLayout ? "overflow-y-auto" : "",
        ].join(" ")}
      >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-tiempos-text text-[32px] leading-none tracking-[-0.015em] text-neutral-950">
            Workspace
          </h1>

          <div className="flex shrink-0 items-center gap-1">
            {searchOpen ? (
              <div className="flex h-9 w-[min(100vw-12rem,240px)] items-center gap-1.5 rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-2 shadow-[var(--shadow-subtle)] ui-t-layout">
                <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
                <label htmlFor="workspace-search" className="sr-only">
                  Search workspace
                </label>
                <input
                  id="workspace-search"
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && query) clearSearch();
                  }}
                  placeholder="Search workspace"
                  className="min-w-0 flex-1 bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={clearSearch}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                aria-label="Search workspace"
                onClick={() => setSearchOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <SegmentPillNav
            options={pillOptions}
            value={type}
            onChange={setType}
            ariaLabel="Workspace type"
          />
        </div>

        {type === "task" ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div />
            <AssignmentFilterDropdown
              value={taskAssignmentFilter}
              onChange={setTaskAssignmentFilter}
              options={taskAssignmentOptions}
              ariaLabel="Filter tasks by assignment"
              fallbackLabel="Filter tasks"
            />
          </div>
        ) : null}

        {type === "event" ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div />
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 p-0.5 shadow-[var(--shadow-subtle)]">
                {EVENT_VIEW_OPTIONS.map((option) => {
                  const isActive = eventViewMode === option.value;
                  const Icon = option.value === "list" ? LayoutList : CalendarDays;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-label={`${option.label} view`}
                      aria-pressed={isActive}
                      onClick={() => setEventViewMode(option.value)}
                      className={[
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] leading-4 ui-t-colors",
                        isActive
                          ? "bg-neutral-200 font-medium text-neutral-950"
                          : "font-normal text-neutral-600 hover:text-neutral-900",
                      ].join(" ")}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <AssignmentFilterDropdown
                value={eventAssignmentFilter}
                onChange={setEventAssignmentFilter}
                options={eventAssignmentOptions}
                ariaLabel="Filter events by assignment"
                fallbackLabel="Filter events"
              />
            </div>
          </div>
        ) : null}

        {type === "note" ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div />
            <AssignmentFilterDropdown
              value={noteSort}
              onChange={setNoteSort}
              options={NOTE_SORT_OPTIONS}
              ariaLabel="Sort notes"
              fallbackLabel="Sort"
            />
          </div>
        ) : null}

        <div className="mt-8">
          {type === "event" && eventViewMode === "calendar" ? (
            <EventCalendar
              events={visibleEvents}
              timeframe={calendarTimeframe}
              onTimeframeChange={setCalendarTimeframe}
              anchorDate={calendarAnchorDate}
              onAnchorDateChange={setCalendarAnchorDate}
              selectedEventId={selectedEventId}
              onEventSelect={(eventId) => {
                const event = visibleEvents.find((entry) => entry.id === eventId);
                if (event) openEventDetail(event);
              }}
            />
          ) : visibleItems.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2.5">
              {visibleItems.map((item) => (
                <li key={item.id}>
                  {isWorkspaceTask(item) ? (
                    <TaskCard task={item} />
                  ) : isWorkspaceEvent(item) ? (
                    <EventCard event={item} />
                  ) : (
                    <div className={`flex h-full flex-col px-4 py-4 text-left ${UI_CARD_INTERACTIVE}`}>
                      <p className="text-body-md font-medium text-neutral-950">{item.title}</p>
                      <p className="mt-2 text-caption text-neutral-600">{item.matter}</p>
                      <p className="mt-3 text-[12px] leading-4 text-neutral-500">
                        {formatWorkspaceActivity(item.updatedAt)}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-12 text-center">
              <p className="text-body-md-secondary">{emptyCopy}</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {useSplitLayout ? (
        <AnimatedPanel open={eventDetailOpen && selectedEvent != null} className="shrink-0">
          {eventDetailOpen && selectedEvent ? (
            <EventDetailPanel event={selectedEvent} onClose={closeEventDetail} />
          ) : null}
        </AnimatedPanel>
      ) : null}
    </div>
  );
}
