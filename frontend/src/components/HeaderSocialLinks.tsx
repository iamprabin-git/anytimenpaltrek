"use client";

import { useId } from "react";
import SocialNetworkIcon from "@/components/SocialNetworkIcon";
import { toFooterSocialLinks } from "@/lib/social-links";

export default function HeaderSocialLinks({
  dynamic,
}: {
  dynamic: Record<string, unknown> | null | undefined;
}) {
  const gradientId = useId().replace(/:/g, "");
  const links = toFooterSocialLinks(dynamic);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
      {links.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className="transition-transform hover:scale-105"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
            <SocialNetworkIcon
              network={social.key}
              gradientId={`header-${gradientId}-${social.key}`}
              className="h-3.5 w-3.5"
            />
          </span>
        </a>
      ))}
    </div>
  );
}
