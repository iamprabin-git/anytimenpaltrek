"use client";

import { useEffect, useMemo, useState } from "react";
import StaffContactPanel from "@/components/StaffContactPanel";
import { getCompanySettings } from "@/lib/api";
import { getCompanyContactChannels } from "@/lib/company-contact";
import { getStaffMessages, sendStaffMessage, type StaffMessage } from "@/lib/user-api";
import type { CompanySettings } from "@/types";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactStaffPage() {
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [messages, setMessages] = useState<StaffMessage[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    getCompanySettings()
      .then(setCompany)
      .catch(() => setCompany(null));
    getStaffMessages()
      .then(setMessages)
      .catch(() => {});
  }, []);

  const contact = useMemo(() => getCompanyContactChannels(company), [company]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const result = await sendStaffMessage({ subject, message });
      setMessages((current) => [result.inquiry, ...current]);
      setSubject("");
      setMessage("");
      setStatus("success");
      setFeedback(result.message);
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Failed to send message.");
    }
  }

  return (
    <div className="max-w-5xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold mb-2">Contact to Staff</h2>
        <p className="text-muted text-sm">
          Reach our team by phone, WhatsApp, Viber, email, or social media. You can also send a message from your account below.
        </p>
      </div>

      <StaffContactPanel contact={contact} />

      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold mb-2">Send a Message</h3>
        <p className="text-sm text-muted mb-4">Write to our staff team and we will reply by email or phone.</p>

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
              Message
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
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Previous Messages</h3>
        {messages.length === 0 ? (
          <p className="text-muted">You have not sent any messages yet.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold">{item.subject}</p>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium capitalize">{item.status}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{item.message}</p>
                <p className="mt-3 text-xs text-muted">{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
