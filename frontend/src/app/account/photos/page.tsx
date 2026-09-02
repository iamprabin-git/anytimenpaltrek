"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";
import MediaImage from "@/components/MediaImage";
import { deleteUserPhoto, getUserPhotos, uploadUserPhoto, type UserPhoto } from "@/lib/user-api";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    getUserPhotos().then(setPhotos).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (caption.trim()) {
      formData.set("caption", caption.trim());
    }

    try {
      const result = await uploadUserPhoto(formData);
      setPhotos((current) => [result.photo, ...current]);
      setCaption("");
      setFormKey((value) => value + 1);
      setStatus("success");
      setFeedback(result.message);
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Failed to upload photo.");
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteUserPhoto(id);
      setPhotos((current) => current.filter((photo) => photo.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Photo Upload</h2>
        <p className="text-muted text-sm">Upload photos from your trips. Our team may feature them on the website.</p>
      </div>

      <form key={formKey} onSubmit={handleSubmit} className="panel-card space-y-4">
        <ImageUploadField name="photo_file" label="Photo" hint="Upload PNG, JPG, WEBP, or GIF from your computer (max 5MB)." />
        <div>
          <label htmlFor="caption" className="mb-1 block text-sm font-medium">
            Caption (optional)
          </label>
          <input
            id="caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {status === "success" ? <p className="text-sm font-medium text-green-600">{feedback}</p> : null}
        {status === "error" ? <p className="text-sm font-medium text-red-600">{feedback}</p> : null}

        <button type="submit" disabled={status === "loading"} className="btn-primary disabled:opacity-50">
          {status === "loading" ? "Uploading..." : "Upload Photo"}
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Photos</h3>
        {photos.length === 0 ? (
          <p className="text-muted">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <div className="relative aspect-[4/3]">
                  <MediaImage src={photo.image_url} alt={photo.caption || "Uploaded photo"} fill className="object-cover" />
                </div>
                <div className="p-4">
                  {photo.caption ? <p className="text-sm font-medium">{photo.caption}</p> : null}
                  <p className="mt-1 text-xs text-muted">{formatDate(photo.created_at)}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className="mt-3 text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === photo.id ? "Deleting..." : "Delete photo"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
