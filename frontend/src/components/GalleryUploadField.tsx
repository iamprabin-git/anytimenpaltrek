"use client";

import MediaImage from "@/components/MediaImage";
import { useState } from "react";
import { imageAccept } from "@/lib/form-upload";
import { hasMediaSrc } from "@/lib/media";

type GalleryUploadFieldProps = {
  label?: string;
  hint?: string;
  images?: string[] | null;
  fieldKey?: string;
};

export default function GalleryUploadField({
  label = "Gallery Images",
  hint = "Upload extra images shown as thumbnails on the detail page.",
  images = [],
  fieldKey = "",
}: GalleryUploadFieldProps) {
  const existing = (images || []).filter(hasMediaSrc);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);
  const fileInputName = fieldKey ? `gallery_files_${fieldKey}[]` : "gallery_files[]";
  const removeInputName = fieldKey ? `remove_gallery_indices_${fieldKey}[]` : "remove_gallery_indices[]";

  function toggleRemove(index: number) {
    setRemovedIndices((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {hint ? <p className="mb-3 text-xs text-muted">{hint}</p> : null}

      {existing.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-3">
          {existing.map((image, index) => {
            const removed = removedIndices.includes(index);

            return (
              <div key={`${image}-${index}`} className="space-y-2">
                <div
                  className={`relative h-20 w-28 overflow-hidden rounded-lg border ${
                    removed ? "border-red-300 opacity-50" : "border-border"
                  }`}
                >
                  <MediaImage src={image} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                </div>
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={removed}
                    onChange={() => toggleRemove(index)}
                  />
                  Remove
                </label>
                {removed ? (
                  <input type="hidden" name={removeInputName} value={String(index)} />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <input
        type="file"
        name={fileInputName}
        accept={imageAccept}
        multiple
        className="block w-full text-sm file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:bg-primary-dark"
      />
    </div>
  );
}
