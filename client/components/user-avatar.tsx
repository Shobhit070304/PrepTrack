"use client";

import { useState } from "react";
import type { User } from "@/types";

export function UserAvatar({ user, size = "h-8 w-8" }: { user: User; size?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P";
  const base = `${size} shrink-0 rounded-full border border-indigo-200/20`;
  if (user.pictureUrl && !imageFailed) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`${base} object-cover`} src={user.pictureUrl} alt={`${user.name} profile`} referrerPolicy="no-referrer" onError={() => setImageFailed(true)}/>
  );
  return <span className={`${base} grid place-items-center bg-indigo-400/15 text-xs font-semibold text-indigo-100`}>{initials}</span>;
}
