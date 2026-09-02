"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProfileAvatarBadge } from "@/components/ProfileAvatar";
import { PanelIcon } from "@/components/panel/icons";

interface PanelUserMenuProps {
  name: string;
  avatarUrl?: string | null;
  profilePath: string;
  onLogout: () => void;
}

function menuButtonClass() {
  return "inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted";
}

export default function PanelUserMenu({ name, avatarUrl, profilePath, onLogout }: PanelUserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={menuButtonClass()}
        aria-label="Account menu"
        aria-expanded={open}
      >
        <ProfileAvatarBadge name={name} avatarUrl={avatarUrl} key={avatarUrl || "no-avatar"} />
        <span className="hidden max-w-[8rem] truncate sm:inline">{name}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-4 py-3 sm:hidden">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
          </div>
          <Link
            href={profilePath}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm text-foreground transition-colors hover:bg-surface-muted"
          >
            <PanelIcon name="profile" className="h-4 w-4 shrink-0" />
            Profile
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-surface-muted"
          >
            <PanelIcon name="logout" className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
