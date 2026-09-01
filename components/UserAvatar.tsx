import Image from "next/image";

export type UserAvatarUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

type UserAvatarProps = {
  user: UserAvatarUser;
  size?: "xs" | "sm" | "md";
  className?: string;
};

const SIZE_CLASS = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-7 w-7 text-[11px]",
} as const;

export function UserAvatar({ user, size = "sm", className = "" }: UserAvatarProps) {
  const sizeClass = SIZE_CLASS[size];

  if (user.avatarUrl) {
    return (
      <span
        className={[
          "relative inline-flex shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100",
          sizeClass,
          className,
        ].join(" ")}
      >
        <Image
          src={user.avatarUrl}
          alt={user.name}
          width={size === "md" ? 28 : size === "sm" ? 24 : 20}
          height={size === "md" ? 28 : size === "sm" ? 24 : 20}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden={!user.name}
      title={user.name}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-violet-100 font-medium leading-none text-violet-800",
        sizeClass,
        className,
      ].join(" ")}
    >
      {getInitials(user.name)}
    </span>
  );
}

type UserAvatarStackProps = {
  users: readonly UserAvatarUser[];
  maxVisible?: number;
  size?: "xs" | "sm" | "md";
};

export function UserAvatarStack({ users, maxVisible = 4, size = "sm" }: UserAvatarStackProps) {
  if (users.length === 0) return null;

  const visible = users.slice(0, maxVisible);
  const overflow = users.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((user, index) => (
        <UserAvatar
          key={user.id}
          user={user}
          size={size}
          className={index > 0 ? "-ml-1.5 ring-2 ring-neutral-50" : "ring-2 ring-neutral-50"}
        />
      ))}
      {overflow > 0 ? (
        <span
          className={[
            "-ml-1.5 inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 font-medium leading-none text-neutral-700 ring-2 ring-neutral-50",
            SIZE_CLASS[size],
          ].join(" ")}
          title={`${overflow} more`}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
