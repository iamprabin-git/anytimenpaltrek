"use client";

import { useRef } from "react";
import MediaImage from "@/components/MediaImage";
import { imageAccept } from "@/lib/form-upload";
import { isGoogleAvatarUrl, resolveAvatarUrl } from "@/lib/media";

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string | null;
  previewUrl?: string | null;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onFileSelect?: (file: File | null) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-20 w-20 text-xl",
  lg: "h-28 w-28 text-3xl",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function ProfileAvatar({
  name,
  avatarUrl,
  previewUrl,
  size = "lg",
  editable = false,
  onFileSelect,
  onRemove,
  showRemove = false,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resolved = previewUrl || resolveAvatarUrl({ avatar_url: avatarUrl, avatar: avatarUrl });
  const dimensions = sizeClasses[size];
  const isGooglePhoto = isGoogleAvatarUrl(resolved) && !previewUrl;

  function handleFileChange(file: File | null) {
    onFileSelect?.(file);
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        {resolved ? (
          <div className={`relative overflow-hidden rounded-full border-2 border-border bg-surface-muted ${dimensions}`}>
            <MediaImage src={resolved} alt={name} fill className="object-cover" sizes="112px" />
          </div>
        ) : (
          <div
            className={`flex items-center justify-center rounded-full border-2 border-border bg-primary/10 font-semibold text-primary ${dimensions}`}
          >
            {initials(name) || "?"}
          </div>
        )}
      </div>

      {editable ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Upload photo
            </button>
            {showRemove && onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-surface-muted"
              >
                Remove photo
              </button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={imageAccept}
            className="hidden"
            onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
          />
          {isGooglePhoto ? (
            <p className="text-xs text-muted">Using your Google profile photo. Upload a new image to replace it.</p>
          ) : (
            <p className="text-xs text-muted">JPG, PNG, WEBP or GIF. Max 5 MB.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Compact avatar for headers and menus. */
export function ProfileAvatarBadge({
  name,
  avatarUrl,
  className = "h-8 w-8 text-xs",
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  const resolved = resolveAvatarUrl({ avatar_url: avatarUrl, avatar: avatarUrl });

  if (resolved) {
    return (
      <span className={`relative inline-flex shrink-0 overflow-hidden rounded-full border border-border ${className}`}>
        <MediaImage src={resolved} alt={name} fill className="object-cover" sizes="32px" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 font-semibold text-primary ${className}`}
    >
      {initials(name) || "?"}
    </span>
  );
}
