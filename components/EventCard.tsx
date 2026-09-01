import { Clock, MapPin, Scale } from "lucide-react";
import { UserAvatarStack, type UserAvatarUser } from "@/components/UserAvatar";
import { WorkspaceChip } from "@/components/WorkspaceChip";
import { formatEventTimeRange } from "@/lib/workspace";
import { UI_CARD_INTERACTIVE } from "@/lib/ui-motion";

export type EventCardData = {
  id: string;
  title: string;
  matter: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  assignees: readonly UserAvatarUser[];
};

type EventCardProps = {
  event: EventCardData;
  className?: string;
};

export function EventCard({ event, className = "" }: EventCardProps) {
  const timeRange = formatEventTimeRange(event.startsAt, event.endsAt);

  return (
    <div
      className={`flex h-full flex-col gap-2 px-3 py-2.5 text-left ${UI_CARD_INTERACTIVE} ${className}`}
    >
      <WorkspaceChip
        icon={Clock}
        label={timeRange}
        chipClassName="bg-sky-50"
        iconClassName="text-sky-600"
        labelClassName="font-medium text-sky-700"
      />

      <p className="line-clamp-2 text-[14px] font-medium leading-5 text-neutral-950">{event.title}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <WorkspaceChip icon={Scale} label={event.matter} iconClassName="text-sky-600" />
        {event.location ? (
          <WorkspaceChip icon={MapPin} label={event.location} iconClassName="text-neutral-500" />
        ) : null}
      </div>

      {event.assignees.length > 0 ? (
        <div className="mt-auto flex justify-end pt-0.5">
          <UserAvatarStack users={event.assignees} size="xs" />
        </div>
      ) : null}
    </div>
  );
}
