"use client";

import { useEffect, useState } from "react";
import MediaImage from "@/components/MediaImage";
import {
  approveAgentReview,
  deleteAgentReview,
  getAgentReviews,
  rejectAgentReview,
  type AgentReview,
} from "@/lib/agent-api";
import { hasPermission } from "@/lib/auth";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: string) {
  if (status === "approved") return "bg-green-100 text-green-800";
  if (status === "rejected") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
}

export default function AgentReviewsPage() {
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [filter, setFilter] = useState("pending");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canApprove = hasPermission("reviews.approve");
  const canDelete = hasPermission("reviews.delete");

  async function load() {
    setReviews(await getAgentReviews(filter || undefined));
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load reviews."));
  }, [filter]);

  async function runAction(action: () => Promise<{ message: string }>) {
    setMessage("");
    setError("");

    try {
      const result = await action();
      setMessage(result.message);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">Review Management</h1>
          <p className="text-sm text-muted">
            Customer reviews arrive here as pending. Managers approve them before they appear on the website reviews sections.
          </p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-4 py-2">
          <option value="pending">Pending approval</option>
          <option value="approved">Published</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {!canApprove ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You can view reviews, but only managers with approval permission can publish or reject them.
        </p>
      ) : null}

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {reviews.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            {filter === "pending" ? "No reviews waiting for manager approval." : "No reviews found for this filter."}
          </p>
        ) : (
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-4 text-left font-semibold">S.N.</th>
                <th className="p-4 text-left font-semibold">Photo</th>
                <th className="p-4 text-left font-semibold">Author</th>
                <th className="p-4 text-left font-semibold">Country</th>
                <th className="p-4 text-left font-semibold">Rating</th>
                <th className="p-4 text-left font-semibold">Review</th>
                <th className="p-4 text-left font-semibold">Gallery</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Submitted</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr key={review.id} className="border-b border-border align-top last:border-0">
                  <td className="p-4 text-muted">{index + 1}</td>
                  <td className="p-4">
                    {review.author_avatar ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                        <MediaImage src={review.author_avatar} alt={review.author_name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{review.author_name}</td>
                  <td className="p-4">{review.author_country || "—"}</td>
                  <td className="p-4">{review.rating}/5</td>
                  <td className="max-w-xs p-4 text-muted">{review.content}</td>
                  <td className="p-4">
                    {review.gallery_images && review.gallery_images.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {review.gallery_images.slice(0, 3).map((image, imageIndex) => (
                          <div key={`${image}-${imageIndex}`} className="relative h-10 w-14 overflow-hidden rounded border border-border">
                            <MediaImage src={image} alt={`Review photo ${imageIndex + 1}`} fill className="object-cover" sizes="56px" />
                          </div>
                        ))}
                        {review.gallery_images.length > 3 ? (
                          <span className="self-center text-xs text-muted">+{review.gallery_images.length - 3}</span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(review.status)}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-muted">{formatDate(review.created_at)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {review.status === "pending" && canApprove ? (
                        <>
                          <button
                            type="button"
                            onClick={() => runAction(() => approveAgentReview(review.id))}
                            className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => runAction(() => rejectAgentReview(review.id))}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => runAction(() => deleteAgentReview(review.id))}
                          className="px-3 py-1.5 text-sm text-red-600"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
