"use client";

import MediaImage from "@/components/MediaImage";
import { useState } from "react";
import { imageAccept, logoAccept, previewFile } from "@/lib/form-upload";
import { resolveMediaUrl } from "@/lib/media";

type ImageUploadFieldProps = {
  name?: string;
  label?: string;
  hint?: string;
  previewUrl?: string | null;
  allowRemove?: boolean;
  removeName?: string;
  accept?: string;
};

export default function ImageUploadField({
  name = "image_file",
  label = "Image",
  hint = "Upload PNG, JPG, WEBP, or GIF from your computer (max 5MB).",
  previewUrl,
  allowRemove = false,
  removeName = "remove_image",
  accept = imageAccept,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(resolveMediaUrl(previewUrl));
  const [removed, setRemoved] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setRemoved(false);
    previewFile(file, setPreview);
  }

  function handleRemove() {
    setRemoved(true);
    setPreview(null);
  }

  const showPreview = preview && !removed;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {hint ? <p className="mb-3 text-xs text-muted">{hint}</p> : null}

      {showPreview ? (
        <div className="mb-4 flex items-center gap-4">
          <div className="relative h-24 w-36 overflow-hidden rounded-lg border border-border bg-surface-muted">
            <MediaImage src={preview} alt="Preview" fill className="object-cover" />
          </div>
          {allowRemove ? (
            <button type="button" onClick={handleRemove} className="text-sm text-red-600 hover:underline">
              Remove image
            </button>
          ) : null}
        </div>
      ) : null}

      <input
        type="file"
        name={name}
        accept={accept}
        onChange={handleFileChange}
        className="block w-full text-sm file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:bg-primary-dark"
      />

      {allowRemove ? <input type="hidden" name={removeName} value={removed ? "1" : "0"} /> : null}
    </div>
  );
}

export function LogoUploadField(props: Omit<ImageUploadFieldProps, "name" | "removeName" | "accept" | "allowRemove">) {
  return (
    <ImageUploadField
      {...props}
      name="logo_file"
      removeName="remove_logo"
      accept={logoAccept}
      allowRemove
      label={props.label || "Company Logo"}
      hint={props.hint || "Upload PNG, JPG, WEBP, or SVG from your computer (max 4MB)."}
    />
  );
}
