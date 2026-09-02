"use client";

import { useEffect, useState } from "react";
import {
  createAdminAgent,
  deleteAdminAgent,
  getAdminAgents,
  updateAdminAgent,
  type AdminAgent,
} from "@/lib/admin-api";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminAgent | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await getAdminAgents();
    setAgents(data.agents);
    setRoles(data.roles);
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load agents."));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const passwordConfirmation = formData.get("password_confirmation") as string;

    if (password !== passwordConfirmation) {
      setError("Password and confirm password do not match.");
      return;
    }

    try {
      await createAdminAgent({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        agent_role: formData.get("agent_role") as string,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage("Agent created successfully.");
      setShowForm(false);
      e.currentTarget.reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent.");
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;

    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const passwordConfirmation = formData.get("password_confirmation") as string;

    if (password && password !== passwordConfirmation) {
      setError("Password and confirm password do not match.");
      return;
    }

    try {
      await updateAdminAgent(editing.id, {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        agent_role: formData.get("agent_role") as string,
        status: formData.get("status") as string,
        password: password || undefined,
        password_confirmation: passwordConfirmation || undefined,
      });
      setMessage("Agent updated successfully.");
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update agent.");
    }
  }

  async function toggleStatus(agent: AdminAgent) {
    try {
      await updateAdminAgent(agent.id, {
        status: agent.status === "active" ? "inactive" : "active",
      });
      setMessage(`Agent ${agent.status === "active" ? "deactivated" : "activated"} successfully.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update agent status.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this agent?")) return;
    try {
      await deleteAdminAgent(id);
      setMessage("Agent deleted successfully.");
      if (editing?.id === id) setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete agent.");
    }
  }

  function openEdit(agent: AdminAgent) {
    setShowForm(false);
    setEditing(agent);
    setError("");
    setMessage("");
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agents</h1>
          <p className="mt-1 text-sm text-muted">Create staff with Director, Manager, Accountant, or Reception roles.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
          }}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "Create Agent"}
        </button>
      </div>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      {showForm ? (
        <form onSubmit={handleCreate} className="mb-8 max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Create Agent</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name *</label>
              <input name="name" required className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone Number *</label>
              <input name="phone" required className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input name="email" type="email" required className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Role *</label>
              <select name="agent_role" required className="w-full rounded-lg border border-border bg-surface px-4 py-2">
                {Object.entries(roles).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password *</label>
              <input name="password" type="password" required minLength={8} className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm Password *</label>
              <input name="password_confirmation" type="password" required minLength={8} className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Save Agent
          </button>
        </form>
      ) : null}

      {editing ? (
        <form onSubmit={handleEdit} className="mb-8 max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Edit Agent</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name *</label>
              <input name="name" defaultValue={editing.name} required className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone Number *</label>
              <input name="phone" defaultValue={editing.phone || ""} required className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input name="email" type="email" defaultValue={editing.email} required className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Role *</label>
              <select name="agent_role" defaultValue={editing.agent_role} required className="w-full rounded-lg border border-border bg-surface px-4 py-2">
                {Object.entries(roles).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status *</label>
              <select name="status" defaultValue={editing.status} required className="w-full rounded-lg border border-border bg-surface px-4 py-2">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">New Password</label>
              <input name="password" type="password" minLength={8} placeholder="Leave blank to keep current" className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
              <input name="password_confirmation" type="password" minLength={8} className="w-full rounded-lg border border-border px-4 py-2" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {agents.length === 0 ? (
          <p className="p-6 text-sm text-muted">No agents found. Create your first agent to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Role</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{agent.name}</td>
                  <td className="p-4">{agent.agent_role_label || agent.agent_role}</td>
                  <td className="p-4">{agent.phone || "—"}</td>
                  <td className="p-4">{agent.email}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        agent.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(agent)}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-muted transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(agent)}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-muted transition-colors"
                      >
                        {agent.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" onClick={() => handleDelete(agent.id)} className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700">
                        Delete
                      </button>
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
