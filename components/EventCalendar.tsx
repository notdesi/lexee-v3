"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { SegmentPillNav } from "@/components/SegmentPillNav";
import {
  eventsForDay,
  formatCalendarDayHeading,
  formatCalendarPeriodLabel,
  getMonthGridDays,
  getWeekDays,
  getWeekdayLabels,
  isSameDay,
  isSameMonth,
  shiftCalendarDate,
  type CalendarTimeframe,
} from "@/lib/event-calendar";
import { formatEventTimeRange, type WorkspaceEvent } from "@/lib/workspace";

const TIMEFRAME_OPTIONS: { value: CalendarTimeframe; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

type EventCalendarProps = {
  events: readonly WorkspaceEvent[];
  timeframe: CalendarTimeframe;
  onTimeframeChange: (value: CalendarTimeframe) => void;
  anchorDate: Date;
  onAnchorDateChange: (date: Date) => void;
  selectedEventId: string | null;
  onEventSelect: (eventId: string) => void;
};

function EventCalendarButton({
  event,
  selected,
  onSelect,
  compact = false,
}: {
  event: WorkspaceEvent;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-md border px-2 py-1 text-left ui-t-colors",
        compact ? "text-[11px] leading-4" : "text-[12px] leading-4",
        selected
          ? "border-neutral-300 bg-neutral-200 text-neutral-950"
          : "border-[color:var(--chat-outline)] bg-neutral-50 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-100",
      ].join(" ")}
    >
      <span className="block font-medium text-neutral-600">
        {formatEventTimeRange(event.startsAt, event.endsAt)}
      </span>
      <span className="mt-0.5 block truncate font-medium text-neutral-950">{event.title}</span>
    </button>
  );
}

export function EventCalendar({
  events,
  timeframe,
  onTimeframeChange,
  anchorDate,
  onAnchorDateChange,
  selectedEventId,
  onEventSelect,
}: EventCalendarProps) {
  const today = new Date();
  const periodLabel = formatCalendarPeriodLabel(anchorDate, timeframe);
  const weekdayLabels = getWeekdayLabels();

  const shiftAnchor = (direction: -1 | 1) => {
    onAnchorDateChange(shiftCalendarDate(anchorDate, timeframe, direction));
  };

  return (
    <div className="rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--chat-outline)] px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous period"
            onClick={() => shiftAnchor(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next period"
            onClick={() => shiftAnchor(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <h3 className="ml-1 text-body-md font-medium text-neutral-950">{periodLabel}</h3>
        </div>

        <SegmentPillNav
          options={TIMEFRAME_OPTIONS}
          value={timeframe}
          onChange={onTimeframeChange}
          ariaLabel="Calendar timeframe"
          variant="chip"
        />
      </div>

      {timeframe === "month" ? (
        <div className="p-3">
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-[color:var(--chat-outline)] bg-[color:var(--chat-outline)]">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="bg-neutral-100 px-2 py-2 text-center text-[11px] font-medium leading-4 text-neutral-500"
              >
                {label}
              </div>
            ))}
            {getMonthGridDays(anchorDate).map((day) => {
              const dayEvents = eventsForDay(events, day);
              const inMonth = isSameMonth(day, anchorDate);
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={day.toISOString()}
                  className={[
                    "min-h-[7.5rem] bg-neutral-50 p-2",
                    inMonth ? "" : "bg-neutral-100/70",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={[
                        "inline-flex h-6 min-w-6 items-center justify-center rounded-full text-[12px] leading-4",
                        isToday
                          ? "bg-neutral-900 font-medium text-neutral-50"
                          : inMonth
                            ? "font-medium text-neutral-950"
                            : "text-neutral-400",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <EventCalendarButton
                        key={event.id}
                        event={event}
                        selected={selectedEventId === event.id}
                        onSelect={() => onEventSelect(event.id)}
                        compact
                      />
                    ))}
                    {dayEvents.length > 2 ? (
                      <p className="px-1 text-[11px] leading-4 text-neutral-500">
                        +{dayEvents.length - 2} more
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {timeframe === "week" ? (
        <div className="grid grid-cols-7 gap-px overflow-hidden border-t border-[color:var(--chat-outline)] bg-[color:var(--chat-outline)]">
          {getWeekDays(anchorDate).map((day) => {
            const dayEvents = eventsForDay(events, day);
            const isToday = isSameDay(day, today);

            return (
              <div key={day.toISOString()} className="min-h-[18rem] bg-neutral-50 p-2">
                <div className="mb-2 border-b border-[color:var(--chat-outline)] pb-2">
                  <p className="text-[11px] leading-4 text-neutral-500">{weekdayLabels[day.getDay()]}</p>
                  <p
                    className={[
                      "mt-0.5 text-[13px] leading-5",
                      isToday ? "font-medium text-neutral-950" : "text-neutral-700",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {dayEvents.map((event) => (
                    <EventCalendarButton
                      key={event.id}
                      event={event}
                      selected={selectedEventId === event.id}
                      onSelect={() => onEventSelect(event.id)}
                      compact
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {timeframe === "day" ? (
        <div className="p-4">
          <p className="text-caption text-neutral-500">{formatCalendarDayHeading(anchorDate)}</p>
          {eventsForDay(events, anchorDate).length > 0 ? (
            <div className="mt-3 space-y-2">
              {eventsForDay(events, anchorDate).map((event) => (
                <EventCalendarButton
                  key={event.id}
                  event={event}
                  selected={selectedEventId === event.id}
                  onSelect={() => onEventSelect(event.id)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-body-md-secondary">No events scheduled for this day.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
