"use client";

import SocialNetworkIcon, { SocialIconBubble } from "@/components/SocialNetworkIcon";
import { useId } from "react";

export interface SocialMediaLink {
  key: string;
  label: string;
  href: string;
}

export default function SocialMediaLinks({ links }: { links: SocialMediaLink[] }) {
  const gradientId = useId().replace(/:/g, "");

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {links.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className="group flex min-w-[88px] flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-surface-muted"
        >
          <SocialIconBubble>
            <SocialNetworkIcon network={social.key} gradientId={`${gradientId}-${social.key}`} />
          </SocialIconBubble>
          <span className="text-xs font-medium text-foreground">{social.label}</span>
        </a>
      ))}
    </div>
  );
}
