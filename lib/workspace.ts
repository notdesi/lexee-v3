export type WorkspaceItemType = "task" | "event" | "note";

export type TaskPriority = "low" | "normal" | "high";

export type TaskStatus =
  | "awaiting-clarification"
  | "in-progress"
  | "not-started"
  | "acknowledged"
  | "completed";

export type WorkspaceUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

/** Signed-in workspace user (demo). */
export const CURRENT_WORKSPACE_USER: WorkspaceUser = {
  id: "user-matt",
  name: "Matt Murdock",
  avatarUrl: "/matt-murdock.webp",
};

export type TaskAssignmentFilter = "assigned-to-me" | "assigned-by-me";

export type EventAssignmentFilter = "all" | "assigned-to-me";

export type EventViewMode = "list" | "calendar";

export type NoteSortOption = "last-updated" | "alphabetical" | "case";

type WorkspaceItemBase = {
  id: string;
  title: string;
  matter: string;
  updatedAt: string;
};

export type WorkspaceTask = WorkspaceItemBase & {
  type: "task";
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  assignees: WorkspaceUser[];
  assignedBy: WorkspaceUser;
};

export type WorkspaceEvent = WorkspaceItemBase & {
  type: "event";
  startsAt: string;
  endsAt: string;
  location?: string;
  assignees: WorkspaceUser[];
};

export type WorkspaceNote = WorkspaceItemBase & {
  type: "note";
};

export type WorkspaceItem = WorkspaceTask | WorkspaceEvent | WorkspaceNote;

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  "awaiting-clarification": "Awaiting clarification",
  "in-progress": "In progress",
  "not-started": "Not started",
  acknowledged: "Acknowledged",
  completed: "Completed",
};

export function isWorkspaceTask(item: WorkspaceItem): item is WorkspaceTask {
  return item.type === "task";
}

export function isWorkspaceEvent(item: WorkspaceItem): item is WorkspaceEvent {
  return item.type === "event";
}

export function isWorkspaceNote(item: WorkspaceItem): item is WorkspaceNote {
  return item.type === "note";
}

export function sortWorkspaceNotes(
  notes: readonly WorkspaceNote[],
  sort: NoteSortOption,
): WorkspaceNote[] {
  const sorted = [...notes];
  if (sort === "alphabetical") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }
  if (sort === "case") {
    sorted.sort((a, b) => a.matter.localeCompare(b.matter) || a.title.localeCompare(b.title));
    return sorted;
  }
  sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return sorted;
}

export function isTaskAssignedToUser(task: WorkspaceTask, userId: string): boolean {
  return task.assignees.some((assignee) => assignee.id === userId);
}

export function isTaskAssignedByUser(task: WorkspaceTask, userId: string): boolean {
  return task.assignedBy.id === userId;
}

export function taskMatchesAssignmentFilter(
  task: WorkspaceTask,
  filter: TaskAssignmentFilter,
  userId: string,
): boolean {
  if (filter === "assigned-to-me") return isTaskAssignedToUser(task, userId);
  return isTaskAssignedByUser(task, userId);
}

export function countTasksByAssignmentFilter(
  items: readonly WorkspaceItem[],
  userId: string,
): Record<TaskAssignmentFilter, number> {
  return items.reduce(
    (counts, item) => {
      if (!isWorkspaceTask(item)) return counts;
      if (isTaskAssignedToUser(item, userId)) counts["assigned-to-me"] += 1;
      if (isTaskAssignedByUser(item, userId)) counts["assigned-by-me"] += 1;
      return counts;
    },
    { "assigned-to-me": 0, "assigned-by-me": 0 } satisfies Record<TaskAssignmentFilter, number>,
  );
}

export function isEventAssignedToUser(event: WorkspaceEvent, userId: string): boolean {
  return event.assignees.some((assignee) => assignee.id === userId);
}

export function eventMatchesAssignmentFilter(
  event: WorkspaceEvent,
  filter: EventAssignmentFilter,
  userId: string,
): boolean {
  if (filter === "all") return true;
  return isEventAssignedToUser(event, userId);
}

export function countEventsByAssignmentFilter(
  items: readonly WorkspaceItem[],
  userId: string,
): Record<EventAssignmentFilter, number> {
  const events = items.filter(isWorkspaceEvent);
  return {
    all: events.length,
    "assigned-to-me": events.filter((event) => isEventAssignedToUser(event, userId)).length,
  };
}

export const WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    id: "ws-task-1",
    title: "Review medical summary draft",
    matter: "Murdock v. Metro Health",
    type: "task",
    updatedAt: "2026-08-31T10:00:00Z",
    priority: "high",
    status: "in-progress",
    progress: 65,
    assignees: [
      { id: "user-matt", name: "Matt Murdock", avatarUrl: "/matt-murdock.webp" },
      { id: "user-karen", name: "Karen Page" },
    ],
    assignedBy: { id: "user-karen", name: "Karen Page" },
  },
  {
    id: "ws-task-2",
    title: "Approve demand letter for carrier",
    matter: "Murdock v. Metro Health",
    type: "task",
    updatedAt: "2026-08-30T16:30:00Z",
    priority: "high",
    status: "awaiting-clarification",
    progress: 40,
    assignees: [
      { id: "user-matt", name: "Matt Murdock", avatarUrl: "/matt-murdock.webp" },
      { id: "user-foggy", name: "Foggy Nelson" },
      { id: "user-karen", name: "Karen Page" },
    ],
    assignedBy: CURRENT_WORKSPACE_USER,
  },
  {
    id: "ws-task-3",
    title: "Follow up on Metro Health intake",
    matter: "Metro Health incident inquiry",
    type: "task",
    updatedAt: "2026-08-29T09:15:00Z",
    priority: "normal",
    status: "acknowledged",
    progress: 15,
    assignees: [{ id: "user-karen", name: "Karen Page" }],
    assignedBy: CURRENT_WORKSPACE_USER,
  },
  {
    id: "ws-task-4",
    title: "Confirm HIPAA authorization signatures",
    matter: "Geramita vs Ayal",
    type: "task",
    updatedAt: "2026-08-28T14:00:00Z",
    priority: "low",
    status: "not-started",
    progress: 0,
    assignees: [{ id: "user-foggy", name: "Foggy Nelson" }],
    assignedBy: CURRENT_WORKSPACE_USER,
  },
  {
    id: "ws-task-5",
    title: "File amended complaint with court",
    matter: "Geramita vs Ayal",
    type: "task",
    updatedAt: "2026-08-27T11:00:00Z",
    priority: "normal",
    status: "completed",
    progress: 100,
    assignees: [
      { id: "user-matt", name: "Matt Murdock", avatarUrl: "/matt-murdock.webp" },
      { id: "user-foggy", name: "Foggy Nelson" },
    ],
    assignedBy: { id: "user-foggy", name: "Foggy Nelson" },
  },
  {
    id: "ws-event-1",
    title: "Client deposition — Tyler Durden",
    matter: "Murdock v. Metro Health",
    type: "event",
    startsAt: "2026-09-05T14:00:00",
    endsAt: "2026-09-05T15:30:00",
    location: "County Courthouse, Room 204",
    assignees: [
      { id: "user-matt", name: "Matt Murdock", avatarUrl: "/matt-murdock.webp" },
      { id: "user-karen", name: "Karen Page" },
    ],
    updatedAt: "2026-08-31T08:00:00Z",
  },
  {
    id: "ws-event-2",
    title: "Mediation with liability carrier",
    matter: "Murdock v. Metro Health",
    type: "event",
    startsAt: "2026-09-12T10:30:00",
    endsAt: "2026-09-12T12:00:00",
    location: "Metro Tower, Conference Suite B",
    assignees: [
      { id: "user-matt", name: "Matt Murdock", avatarUrl: "/matt-murdock.webp" },
      { id: "user-foggy", name: "Foggy Nelson" },
    ],
    updatedAt: "2026-08-30T11:00:00Z",
  },
  {
    id: "ws-event-3",
    title: "Intake call with referral partner",
    matter: "Acme Insurance referral",
    type: "event",
    startsAt: "2026-09-03T16:00:00",
    endsAt: "2026-09-03T16:30:00",
    assignees: [{ id: "user-karen", name: "Karen Page" }],
    updatedAt: "2026-08-29T13:00:00Z",
  },
  {
    id: "ws-event-4",
    title: "Records review with paralegal",
    matter: "Geramita vs Ayal",
    type: "event",
    startsAt: "2026-09-08T09:00:00",
    endsAt: "2026-09-08T10:00:00",
    location: "Firm office, 3rd floor",
    assignees: [
      { id: "user-matt", name: "Matt Murdock", avatarUrl: "/matt-murdock.webp" },
    ],
    updatedAt: "2026-08-28T10:00:00Z",
  },
  {
    id: "ws-note-1",
    title: "Opposing counsel prefers email for scheduling",
    matter: "Geramita vs Ayal",
    type: "note",
    updatedAt: "2026-08-31T09:30:00Z",
  },
  {
    id: "ws-note-2",
    title: "Client mentioned prior shoulder injury (2019)",
    matter: "Murdock v. Metro Health",
    type: "note",
    updatedAt: "2026-08-30T15:00:00Z",
  },
  {
    id: "ws-note-3",
    title: "Records clerk — use portal ref #MH-8842",
    matter: "Metro Health incident inquiry",
    type: "note",
    updatedAt: "2026-08-27T10:00:00Z",
  },
];

export function countWorkspaceItemsByType(items: readonly WorkspaceItem[]): Record<WorkspaceItemType, number> {
  return items.reduce(
    (counts, item) => {
      counts[item.type] += 1;
      return counts;
    },
    { task: 0, event: 0, note: 0 } satisfies Record<WorkspaceItemType, number>,
  );
}

export function formatWorkspaceActivity(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWorkspaceEventSchedule(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatEventClockTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatEventTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return `${formatEventClockTime(start)} - ${formatEventClockTime(end)}`;
}

export function formatEventDateHeading(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
