"use client";

import { useEffect, useState } from "react";
import { getSuggestions, submitSuggestion, type UserSuggestion } from "@/lib/user-api";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    getSuggestions().then(setSuggestions).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const result = await submitSuggestion({ subject, message });
      setSuggestions((current) => [result.suggestion, ...current]);
      setSubject("");
      setMessage("");
      setStatus("success");
      setFeedback(result.message);
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Failed to submit suggestion.");
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Suggestion</h2>
        <p className="text-muted text-sm">Share ideas to help us improve trips, services, or the website.</p>
      </div>

      <form onSubmit={handleSubmit} className="panel-card space-y-4">
        <div>
          <label htmlFor="subject" className="mb-1 block text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            Your suggestion
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-lg border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {status === "success" ? <p className="text-sm font-medium text-green-600">{feedback}</p> : null}
        {status === "error" ? <p className="text-sm font-medium text-red-600">{feedback}</p> : null}

        <button type="submit" disabled={status === "loading"} className="btn-primary disabled:opacity-50">
          {status === "loading" ? "Submitting..." : "Submit Suggestion"}
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Suggestions</h3>
        {suggestions.length === 0 ? (
          <p className="text-muted">No suggestions submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold">{item.subject}</p>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium capitalize">{item.status}</span>
                </div>
                <p className="mt-3 text-sm text-foreground whitespace-pre-wrap">{item.message}</p>
                <p className="mt-3 text-xs text-muted">{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
