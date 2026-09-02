"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MediaImage from "@/components/MediaImage";
import {
  createCrmInteraction,
  getCrmCustomer,
  updateCrmLoyalty,
  type AgentUser,
  type CrmTimelineEvent,
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

function typeLabel(type: string) {
  return type.replaceAll("_", " ");
}

export default function AgentCrmCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = Number(params.id);
  const [customer, setCustomer] = useState<AgentUser | null>(null);
  const [timeline, setTimeline] = useState<CrmTimelineEvent[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [noteType, setNoteType] = useState<"note" | "call" | "email">("note");
  const [loyaltyPoints, setLoyaltyPoints] = useState("0");
  const [loyaltyNote, setLoyaltyNote] = useState("");
  const canLogInteractions = hasPermission("crm.interactions.create");
  const canManageCampaigns = hasPermission("crm.campaigns.manage");
  const canManageUsers = hasPermission("users.view");
  const canUpdateUsers = hasPermission("users.update");

  async function load() {
    const data = await getCrmCustomer(customerId);
    setCustomer(data.customer);
    setTimeline(data.timeline);
    setLoyaltyPoints(String(data.customer.loyalty_points ?? 0));
  }

  useEffect(() => {
    if (!Number.isFinite(customerId)) return;
    load().catch(() => setError("Failed to load customer timeline."));
  }, [customerId]);

  async function handleAddInteraction(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const result = await createCrmInteraction(customerId, {
        type: noteType,
        title: noteTitle,
        description: noteDescription || undefined,
      });
      setMessage(result.message);
      setNoteTitle("");
      setNoteDescription("");
      setTimeline(result.timeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log interaction.");
    }
  }

  async function handleUpdateLoyalty(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const result = await updateCrmLoyalty(customerId, {
        loyalty_points: Number(loyaltyPoints),
        note: loyaltyNote || undefined,
      });
      setMessage(result.message);
      setCustomer(result.customer);
      setTimeline(result.timeline);
      setLoyaltyNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update loyalty points.");
    }
  }

  if (!customer && !error) {
    return <p className="text-muted">Loading customer timeline...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">{customer?.name || "Customer Timeline"}</h1>
          <p className="text-sm text-muted">Unified CRM view of bookings, inquiries, reviews, wishlist activity, campaigns, and agent notes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageUsers && canUpdateUsers ? (
            <Link href={`/agent/users?edit=${customerId}`} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
              Manage Profile
            </Link>
          ) : null}
          <Link href="/agent/crm/customers" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
            Customer Insights
          </Link>
          {canManageUsers ? (
            <Link href="/agent/users" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
              Customer Management
            </Link>
          ) : null}
        </div>
      </div>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      {customer ? (
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {customer.avatar_url ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border">
                  <MediaImage src={customer.avatar_url} alt={customer.name} fill className="object-cover" sizes="64px" />
                </div>
              ) : null}
              <div>
                <p className="text-xl font-semibold text-foreground">{customer.name}</p>
                <p className="text-sm text-muted">{customer.email}</p>
                <p className="mt-2 text-sm text-muted">
                  {customer.phone || "No phone"} · {customer.country || "No country"} ·{" "}
                  <span className="capitalize">{customer.status}</span>
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-surface-muted p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Loyalty Points</p>
                <p className="mt-1 text-2xl font-bold text-primary">{customer.loyalty_points ?? 0}</p>
              </div>
              <div className="rounded-lg bg-surface-muted p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Bookings</p>
                <p className="mt-1 text-2xl font-bold text-primary">{customer.bookings_count ?? 0}</p>
              </div>
              <div className="rounded-lg bg-surface-muted p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Interactions</p>
                <p className="mt-1 text-2xl font-bold text-primary">{timeline.length}</p>
              </div>
              <div className="rounded-lg bg-surface-muted p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Source</p>
                <p className="mt-1 text-sm font-semibold capitalize text-foreground">{customer.registration_source || "—"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {canLogInteractions ? (
              <form onSubmit={handleAddInteraction} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Log Interaction</h2>
                <div className="space-y-3">
                  <select value={noteType} onChange={(e) => setNoteType(e.target.value as "note" | "call" | "email")} className="panel-input">
                    <option value="note">Note</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                  </select>
                  <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required placeholder="Title" className="panel-input" />
                  <textarea
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                    placeholder="Details"
                    rows={4}
                    className="panel-input"
                  />
                  <button type="submit" className="btn-primary w-full">
                    Save Interaction
                  </button>
                </div>
              </form>
            ) : null}

            {canManageCampaigns ? (
              <form onSubmit={handleUpdateLoyalty} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Loyalty Points</h2>
                <div className="space-y-3">
                  <input
                    type="number"
                    min="0"
                    value={loyaltyPoints}
                    onChange={(e) => setLoyaltyPoints(e.target.value)}
                    className="panel-input"
                  />
                  <textarea
                    value={loyaltyNote}
                    onChange={(e) => setLoyaltyNote(e.target.value)}
                    placeholder="Optional note for the timeline"
                    rows={3}
                    className="panel-input"
                  />
                  <button type="submit" className="btn-primary w-full">
                    Update Points
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Interaction Timeline</h2>
        </div>
        {timeline.length === 0 ? (
          <p className="p-6 text-sm text-muted">No interactions recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {timeline.map((event) => (
              <div key={event.id} className="px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    {event.description ? <p className="mt-2 text-sm leading-7 text-muted">{event.description}</p> : null}
                    {event.metadata?.agent_name ? (
                      <p className="mt-2 text-xs text-muted">Logged by {String(event.metadata.agent_name)}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs capitalize">{typeLabel(event.type)}</span>
                    <p className="mt-2 text-xs text-muted">{formatDate(event.occurred_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
