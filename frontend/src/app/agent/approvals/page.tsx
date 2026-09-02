"use client";

import { useEffect, useState } from "react";
import {
  approveAgentChange,
  getAgentApprovals,
  rejectAgentChange,
  type PendingChange,
} from "@/lib/agent-api";
import { hasPermission } from "@/lib/auth";

function statusClass(status: PendingChange["status"]) {
  if (status === "approved") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  if (status === "rejected") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
}

export default function AgentApprovalsPage() {
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [filter, setFilter] = useState("pending");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await getAgentApprovals(filter || undefined);
    setChanges(data.changes);
    setCanReview(data.can_review);
    setPendingCount(data.pending_count);
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load approval requests."));
  }, [filter]);

  async function handleApprove(id: number) {
    try {
      const result = await approveAgentChange(id);
      setMessage(result.message);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve change.");
    }
  }

  async function handleReject(id: number) {
    const note = window.prompt("Optional rejection note for the staff member:");
    if (note === null) return;

    try {
      const result = await rejectAgentChange(id, note || undefined);
      setMessage(result.message);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject change.");
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">Change Approvals</h1>
          <p className="text-sm text-muted">
            {canReview
              ? "Review and approve changes submitted by Accountant and Reception staff."
              : "Track your submitted changes waiting for manager approval."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canReview && pendingCount > 0 ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {pendingCount} pending
            </span>
          ) : null}
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-4 py-2">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>
      </div>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="space-y-4">
        {changes.length === 0 ? (
          <div className="panel-card">
            <p className="text-sm text-muted">No change requests found for this filter.</p>
          </div>
        ) : (
          changes.map((change) => (
            <div key={change.id} className="panel-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(change.status)}`}>
                      {change.status}
                    </span>
                    <span className="text-xs text-muted">{new Date(change.created_at).toLocaleString()}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{change.summary}</h2>
                  <p className="mt-1 text-sm text-muted">
                    Requested by {change.requester?.name || "Unknown"}
                    {change.requester?.agent_role_label ? ` (${change.requester.agent_role_label})` : ""}
                  </p>
                  {change.review_note ? <p className="mt-2 text-sm text-muted">Note: {change.review_note}</p> : null}
                </div>

                {change.status === "pending" && canReview && hasPermission("approvals.review") ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleApprove(change.id)} className="btn-primary">
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(change.id)}
                      className="rounded-lg border border-border px-4 py-2 text-sm text-red-600 hover:bg-surface-muted"
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
