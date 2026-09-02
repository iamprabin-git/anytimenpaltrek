"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";
import MediaImage from "@/components/MediaImage";
import {
  approveAgentUser,
  deleteAgentUser,
  exportAgentUsers,
  getAgentUsers,
  rejectAgentUser,
  saveAgentUserForm,
  type AgentUser,
} from "@/lib/agent-api";
import { hasPermission } from "@/lib/auth";

const SOCIAL_FIELDS = [
  { name: "social_facebook", label: "Facebook URL", key: "facebook" },
  { name: "social_instagram", label: "Instagram URL", key: "instagram" },
  { name: "social_twitter", label: "Twitter / X URL", key: "twitter" },
  { name: "social_linkedin", label: "LinkedIn URL", key: "linkedin" },
  { name: "social_youtube", label: "YouTube URL", key: "youtube" },
] as const;

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  google: "Google",
  agent: "Agent",
};

function sourceLabel(source: string | null | undefined) {
  if (!source) return "—";
  return SOURCE_LABELS[source] || source;
}

function CustomerForm({
  initial,
  submitLabel,
  onCancel,
  onSaved,
}: {
  initial?: AgentUser | null;
  submitLabel: string;
  onCancel?: () => void;
  onSaved: (message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await saveAgentUserForm(initial?.id ?? null, formData);
      onSaved(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="panel-card mb-8 space-y-6">
      {error ? <p className="text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name *</label>
          <input name="name" required defaultValue={initial?.name || ""} className="panel-input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email *</label>
          <input name="email" type="email" required defaultValue={initial?.email || ""} className="panel-input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{initial ? "New Password" : "Password *"}</label>
          <input
            name="password"
            type="password"
            required={!initial}
            placeholder={initial ? "Leave blank to keep current password" : "Minimum 8 characters"}
            className="panel-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input name="phone" defaultValue={initial?.phone || ""} className="panel-input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">WhatsApp Number</label>
          <input name="whatsapp_number" defaultValue={initial?.whatsapp_number || ""} className="panel-input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Document ID</label>
          <input name="document_id" defaultValue={initial?.document_id || ""} placeholder="Passport / ID number" className="panel-input" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Address</label>
          <textarea name="address" defaultValue={initial?.address || ""} rows={2} className="panel-input min-h-[80px]" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <input name="country" defaultValue={initial?.country || ""} className="panel-input" />
        </div>
        {initial ? (
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select name="status" defaultValue={initial.status} className="panel-input">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        ) : (
          <input type="hidden" name="status" value="active" />
        )}
      </div>

      <ImageUploadField
        label="Customer Photo"
        hint="Upload a profile or ID photo from your computer."
        name="avatar_file"
        removeName="remove_avatar"
        previewUrl={initial?.avatar_url}
        allowRemove
      />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Social Links</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SOCIAL_FIELDS.map((field) => (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium">{field.label}</label>
              <input
                name={field.name}
                type="url"
                defaultValue={initial?.social_links?.[field.key] || ""}
                placeholder="https://"
                className="panel-input"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving..." : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default function AgentCustomersPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading customers...</p>}>
      <AgentCustomersPageContent />
    </Suspense>
  );
}

function AgentCustomersPageContent() {
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AgentUser | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const canCreate = hasPermission("users.create");
  const canUpdate = hasPermission("users.update");
  const canApprove = hasPermission("users.approve");
  const canDelete = hasPermission("users.delete");
  const canView = hasPermission("users.view");
  const canViewCrm = hasPermission("crm.view");
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  async function load() {
    setUsers(
      await getAgentUsers({
        status: filter || undefined,
        search: debouncedSearch || undefined,
      })
    );
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load customers."));
  }, [filter, debouncedSearch]);

  useEffect(() => {
    if (!editId || users.length === 0) return;
    const match = users.find((user) => String(user.id) === editId);
    if (match && canUpdate) {
      setEditing(match);
      setShowForm(false);
    }
  }, [editId, users, canUpdate]);

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      await exportAgentUsers({
        status: filter || undefined,
        search: debouncedSearch || undefined,
      });
      setMessage("Customer list exported to Excel.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export customers.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">Customer Management</h1>
          <p className="text-sm text-muted">
            Manage customer profiles with contact details, document ID, photo, WhatsApp, and social links.
            {canViewCrm ? " Open CRM timelines for bookings, inquiries, loyalty points, and marketing history." : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canViewCrm ? (
            <>
              <Link href="/agent/crm" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
                CRM Dashboard
              </Link>
              {hasPermission("crm.campaigns.view") ? (
                <Link href="/agent/crm/campaigns" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
                  Campaigns
                </Link>
              ) : null}
            </>
          ) : null}
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-4 py-2">
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="">All</option>
          </select>
          {canView ? (
            <button type="button" onClick={handleExport} disabled={exporting} className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50">
              {exporting ? "Exporting..." : "Export to Excel"}
            </button>
          ) : null}
          {canCreate ? (
            <button
              type="button"
              onClick={() => {
                setShowForm(!showForm);
                setEditing(null);
              }}
              className="btn-primary"
            >
              {showForm ? "Cancel" : "Add Customer"}
            </button>
          ) : null}
        </div>
      </div>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, WhatsApp, document ID, address, country, or source..."
          className="panel-input max-w-2xl"
        />
      </div>

      {showForm && canCreate ? (
        <CustomerForm
          submitLabel="Create Customer"
          onCancel={() => setShowForm(false)}
          onSaved={(savedMessage) => {
            setShowForm(false);
            setMessage(savedMessage);
            load();
          }}
        />
      ) : null}

      {editing && canUpdate ? (
        <CustomerForm
          initial={editing}
          submitLabel="Save Changes"
          onCancel={() => setEditing(null)}
          onSaved={(savedMessage) => {
            setEditing(null);
            setMessage(savedMessage);
            load();
          }}
        />
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {users.length === 0 ? (
          <p className="p-6 text-sm text-muted">No customers found for this filter or search.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-4 text-left font-semibold">S.N.</th>
                <th className="p-4 text-left font-semibold">Photo</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">WhatsApp</th>
                <th className="p-4 text-left font-semibold">Document ID</th>
                <th className="p-4 text-left font-semibold">Source</th>
                <th className="p-4 text-left font-semibold">Country</th>
                <th className="p-4 text-left font-semibold">Status</th>
                {canViewCrm ? (
                  <>
                    <th className="p-4 text-left font-semibold">Loyalty</th>
                    <th className="p-4 text-left font-semibold">Bookings</th>
                    <th className="p-4 text-left font-semibold">Interactions</th>
                  </>
                ) : null}
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="p-4 text-muted">{index + 1}</td>
                  <td className="p-4">
                    {user.avatar_url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                        <MediaImage src={user.avatar_url} alt={user.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">
                    {canViewCrm ? (
                      <Link href={`/agent/crm/customers/${user.id}`} className="text-primary hover:underline">
                        {user.name}
                      </Link>
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone || "—"}</td>
                  <td className="p-4">{user.whatsapp_number || "—"}</td>
                  <td className="p-4">{user.document_id || "—"}</td>
                  <td className="p-4">{sourceLabel(user.registration_source)}</td>
                  <td className="p-4">{user.country || "—"}</td>
                  <td className="p-4 capitalize">{user.status}</td>
                  {canViewCrm ? (
                    <>
                      <td className="p-4">{user.loyalty_points ?? 0}</td>
                      <td className="p-4">{user.bookings_count ?? 0}</td>
                      <td className="p-4">{user.interaction_count ?? 0}</td>
                    </>
                  ) : null}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {canViewCrm ? (
                        <Link
                          href={`/agent/crm/customers/${user.id}`}
                          className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white"
                        >
                          CRM Timeline
                        </Link>
                      ) : null}
                      {canUpdate ? (
                        <button type="button" onClick={() => setEditing(user)} className="rounded-lg border border-border px-3 py-1.5 text-sm">
                          Edit
                        </button>
                      ) : null}
                      {user.status === "pending" && canApprove ? (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const result = await approveAgentUser(user.id);
                                setMessage(result.message);
                                load();
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Failed to approve customer.");
                              }
                            }}
                            className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const result = await rejectAgentUser(user.id);
                                setMessage(result.message);
                                load();
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Failed to reject customer.");
                              }
                            }}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const result = await deleteAgentUser(user.id);
                              setMessage(result.message);
                              load();
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Failed to delete customer.");
                            }
                          }}
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
