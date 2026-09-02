"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavLink } from "@/types/site-content";

interface HeaderNavDropdownProps {
  label: string;
  items: NavLink[];
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderNavDropdown({
  label,
  items,
  variant = "desktop",
  onNavigate,
}: HeaderNavDropdownProps) {
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const active = items.some((item) => isActivePath(pathname, item.href));

  useEffect(() => {
    if (variant !== "desktop" || !open) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, variant]);

  if (variant === "mobile") {
    return (
      <div>
        <button
          type="button"
          className="flex w-full items-center justify-between py-2 text-left font-medium text-foreground/80"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={active ? "text-primary" : undefined}>{label}</span>
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open ? (
          <div id={menuId} className="mt-1 space-y-1 pl-3">
            {items.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  isActivePath(pathname, item.href)
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground/80 hover:bg-surface-muted hover:text-primary"
                }`}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1 font-medium text-sm transition-colors ${
          active ? "text-primary" : "text-foreground/80 hover:text-primary"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 min-w-[14rem] overflow-hidden rounded-xl border border-border bg-surface py-2 shadow-lg"
        >
          {items.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              role="menuitem"
              className={`block px-4 py-2.5 text-sm transition-colors ${
                isActivePath(pathname, item.href)
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground/80 hover:bg-surface-muted hover:text-primary"
              }`}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
