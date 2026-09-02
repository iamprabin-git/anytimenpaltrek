"use client";

import { useEffect, useState } from "react";
import { getAgentInquiries, updateAgentInquiryStatus, type AgentInquiry } from "@/lib/agent-api";

export default function AgentInquiriesPage() {
  const [inquiries, setInquiries] = useState<AgentInquiry[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setInquiries(await getAgentInquiries());
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load inquiries."));
  }, []);

  async function handleStatusChange(id: number, status: string) {
    setMessage("");
    setError("");

    try {
      const result = await updateAgentInquiryStatus(id, status);
      setMessage(result.message);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update inquiry status.");
    }
  }

  return (
    <div>
      <h1 className="panel-title mb-2">Inquiry Management</h1>
      <p className="mb-8 text-sm text-muted">Respond to customer contact form submissions.</p>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {inquiries.length === 0 ? (
          <p className="p-6 text-sm text-muted">No inquiries yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">Subject</th>
                <th className="p-4 text-left font-semibold">Message</th>
                <th className="p-4 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-border align-top last:border-0">
                  <td className="p-4 font-medium">{inquiry.name}</td>
                  <td className="p-4">{inquiry.email}</td>
                  <td className="p-4">{inquiry.phone || "—"}</td>
                  <td className="p-4">{inquiry.subject || "—"}</td>
                  <td className="max-w-xs p-4 text-muted">{inquiry.message}</td>
                  <td className="p-4">
                    <select
                      value={inquiry.status}
                      onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
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
