"use client";

import { ChevronLeft, ChevronRight, Clock, MapPin, Scale, X } from "lucide-react";
import { useEffect } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import {
  formatEventDateHeading,
  formatEventTimeRange,
  type WorkspaceEvent,
} from "@/lib/workspace";

type EventDetailPanelProps = {
  event: WorkspaceEvent;
  onClose: () => void;
};

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption text-neutral-500">{label}</p>
        <p className="mt-0.5 text-body-md text-neutral-950">{value}</p>
      </div>
    </div>
  );
}

export function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <aside className="flex h-[100dvh] w-[clamp(360px,32vw,440px)] shrink-0 flex-col border-l border-[color:var(--chat-outline)] bg-neutral-50">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--chat-outline)] px-5 py-4">
        <div className="min-w-0">
          <p className="text-caption text-neutral-500">Event details</p>
          <h2 className="mt-1 line-clamp-2 text-body-lg font-medium text-neutral-950">{event.title}</h2>
        </div>
        <button
          type="button"
          aria-label="Close event details"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        <DetailRow
          icon={Clock}
          label="When"
          value={`${formatEventDateHeading(event.startsAt)} · ${formatEventTimeRange(event.startsAt, event.endsAt)}`}
        />
        <DetailRow icon={Scale} label="Case" value={event.matter} />
        {event.location ? <DetailRow icon={MapPin} label="Location" value={event.location} /> : null}

        {event.assignees.length > 0 ? (
          <div>
            <p className="text-caption text-neutral-500">Assigned to</p>
            <ul className="mt-2 space-y-2">
              {event.assignees.map((assignee) => (
                <li key={assignee.id} className="flex items-center gap-2.5">
                  <UserAvatar user={assignee} size="sm" />
                  <span className="text-body-md text-neutral-950">{assignee.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
