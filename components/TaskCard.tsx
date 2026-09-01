import {
  Check,
  Circle,
  CircleDashed,
  Flag,
  Loader2,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { UserAvatarStack, type UserAvatarUser } from "@/components/UserAvatar";
import { WorkspaceChip } from "@/components/WorkspaceChip";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/workspace";
import { UI_CARD_INTERACTIVE } from "@/lib/ui-motion";

const PRIORITY_CHIP: Record<
  TaskPriority,
  {
    chipClassName: string;
    iconClassName: string;
    labelClassName: string;
  }
> = {
  low: {
    chipClassName: "bg-neutral-100",
    iconClassName: "text-neutral-500",
    labelClassName: "text-neutral-600",
  },
  normal: {
    chipClassName: "bg-sky-50",
    iconClassName: "text-sky-600",
    labelClassName: "text-sky-600",
  },
  high: {
    chipClassName: "bg-rose-50",
    iconClassName: "text-rose-500",
    labelClassName: "text-rose-500",
  },
};

const STATUS_CHIP: Record<
  TaskStatus,
  { icon: LucideIcon; iconClassName: string }
> = {
  "awaiting-clarification": {
    icon: CircleDashed,
    iconClassName: "text-amber-500",
  },
  "in-progress": {
    icon: Loader2,
    iconClassName: "text-violet-600",
  },
  "not-started": {
    icon: Circle,
    iconClassName: "text-neutral-500",
  },
  acknowledged: {
    icon: Check,
    iconClassName: "text-sky-600",
  },
  completed: {
    icon: Check,
    iconClassName: "text-teal-600",
  },
};

export type TaskCardData = {
  id: string;
  title: string;
  matter: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  assignees: readonly UserAvatarUser[];
};

type TaskCardProps = {
  task: TaskCardData;
  className?: string;
};

export function TaskCard({ task, className = "" }: TaskCardProps) {
  const progress = Math.min(100, Math.max(0, task.progress));
  const priorityChip = PRIORITY_CHIP[task.priority];
  const statusChip = STATUS_CHIP[task.status];
  const StatusIcon = statusChip.icon;

  return (
    <div
      className={`flex h-full flex-col gap-2 px-3 py-2.5 text-left ${UI_CARD_INTERACTIVE} ${className}`}
    >
      <p className="line-clamp-2 text-[14px] font-medium leading-5 text-neutral-950">{task.title}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <WorkspaceChip
          icon={Flag}
          label={TASK_PRIORITY_LABELS[task.priority]}
          {...priorityChip}
        />
        <WorkspaceChip
          icon={StatusIcon}
          label={TASK_STATUS_LABELS[task.status]}
          iconClassName={statusChip.iconClassName}
        />
        <WorkspaceChip icon={Scale} label={task.matter} iconClassName="text-sky-600" />
      </div>

      <div className="mt-auto flex items-center gap-2 pt-0.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <div
            className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-200"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress}% complete`}
          >
            <div
              className="h-full rounded-full bg-violet-500 ui-t-layout"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] leading-4 text-neutral-500">{progress}%</span>
        </div>
        {task.assignees.length > 0 ? <UserAvatarStack users={task.assignees} size="xs" /> : null}
      </div>
    </div>
  );
}
