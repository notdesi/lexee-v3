import type { WorkspaceEvent } from "@/lib/workspace";

export type CalendarTimeframe = "day" | "week" | "month";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function eventOccursOnDay(event: Pick<WorkspaceEvent, "startsAt">, day: Date): boolean {
  return isSameDay(new Date(event.startsAt), day);
}

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfDay(anchor);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function getMonthGridDays(anchor: Date): Date[] {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfDay(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function shiftCalendarDate(
  date: Date,
  timeframe: CalendarTimeframe,
  direction: -1 | 1,
): Date {
  const next = new Date(date);
  if (timeframe === "day") {
    next.setDate(next.getDate() + direction);
    return next;
  }
  if (timeframe === "week") {
    next.setDate(next.getDate() + direction * 7);
    return next;
  }
  next.setMonth(next.getMonth() + direction);
  return next;
}

export function formatCalendarPeriodLabel(date: Date, timeframe: CalendarTimeframe): string {
  if (timeframe === "day") {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (timeframe === "week") {
    const weekDays = getWeekDays(date);
    const start = weekDays[0];
    const end = weekDays[6];
    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    const startLabel = start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
    const endLabel = end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (sameMonth && sameYear) {
      return `${start.toLocaleDateString(undefined, { month: "long" })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
    }

    return `${startLabel} – ${endLabel}`;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function formatCalendarDayHeading(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function eventsForDay(events: readonly WorkspaceEvent[], day: Date): WorkspaceEvent[] {
  return events
    .filter((event) => eventOccursOnDay(event, day))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}
