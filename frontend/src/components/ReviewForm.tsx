"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GalleryUploadField from "@/components/GalleryUploadField";
import ImageUploadField from "@/components/ImageUploadField";
import { submitReviewForm } from "@/lib/api";
import { getAuthUser, type AuthUser } from "@/lib/auth";

export default function ReviewForm() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    setUser(getAuthUser());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="rounded-xl border border-border bg-surface-muted p-8 animate-pulse" aria-hidden="true">
        <div className="mx-auto h-6 w-40 rounded bg-border" />
        <div className="mx-auto mt-3 h-4 w-56 rounded bg-border" />
      </div>
    );
  }

  if (!user || user.role !== "user") {
    return (
      <div className="rounded-xl border border-border bg-surface-muted p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Login required</h2>
        <p className="mt-2 text-sm text-muted">Only registered customers can submit reviews with photos.</p>
        <Link href="/login?redirect=/reviews/write" className="btn-primary mt-6 inline-block">
          Log in to write a review
        </Link>
      </div>
    );
  }

  if (user.status !== "active") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-bold text-amber-900">Account pending approval</h2>
        <p className="mt-2 text-sm text-amber-800">
          Your account must be approved by our team before you can write a review.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("rating", String(rating));

    try {
      const result = await submitReviewForm(formData);
      setStatus("success");
      setMessage(result.message);
      form.reset();
      setRating(5);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
      <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
        <p className="font-medium text-foreground">Reviewing as {user.name}</p>
        <p className="text-muted">{user.email}</p>
      </div>

      <div>
        <label htmlFor="author_country" className="mb-2 block text-sm font-medium text-foreground">
          Country
        </label>
        <input
          id="author_country"
          name="author_country"
          defaultValue={user.country || ""}
          className="panel-input"
        />
      </div>

      <ImageUploadField
        name="avatar_file"
        label="Your Photo (optional)"
        hint="Upload a profile photo to show with your review."
        previewUrl={user.avatar_url}
      />

      <GalleryUploadField
        label="Trip Photos (optional)"
        hint="Upload photos from your trek or tour. You can select multiple images."
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Rating *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`text-2xl transition-colors ${value <= rating ? "text-accent" : "text-gray-300"}`}
              aria-label={`Rate ${value} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-medium text-foreground">
          Your Review *
        </label>
        <textarea
          id="content"
          name="content"
          required
          minLength={20}
          rows={6}
          placeholder="Share your experience trekking or touring with us (minimum 20 characters)..."
          className="panel-input resize-none"
        />
      </div>

      {status === "success" ? <p className="font-medium text-green-600">{message}</p> : null}
      {status === "error" ? <p className="font-medium text-red-600">{message}</p> : null}

      <button type="submit" disabled={status === "loading"} className="btn-primary disabled:opacity-50">
        {status === "loading" ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
