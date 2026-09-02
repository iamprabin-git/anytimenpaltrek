"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MediaImage from "@/components/MediaImage";
import { getCrmCustomers, type AgentUser } from "@/lib/agent-api";
import { hasPermission } from "@/lib/auth";

export default function AgentCrmCustomersPage() {
  const [customers, setCustomers] = useState<AgentUser[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const canManageUsers = hasPermission("users.view");

  async function load() {
    setCustomers(
      await getCrmCustomers({
        status: filter || undefined,
        search: search || undefined,
      })
    );
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load CRM customers."));
  }, [filter, search]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">Customer Insights</h1>
          <p className="text-sm text-muted">
            CRM view of customer engagement. Profiles are managed in Customer Management and linked to each timeline below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageUsers ? (
            <Link href="/agent/users" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
              Customer Management
            </Link>
          ) : null}
          <Link href="/agent/crm" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
            CRM Dashboard
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone..."
          className="min-w-[240px] flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {customers.length === 0 ? (
          <p className="p-6 text-sm text-muted">No customers found for this filter.</p>
        ) : (
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-4 text-left font-semibold">S.N.</th>
                <th className="p-4 text-left font-semibold">Photo</th>
                <th className="p-4 text-left font-semibold">Customer</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Country</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Loyalty Points</th>
                <th className="p-4 text-left font-semibold">Bookings</th>
                <th className="p-4 text-left font-semibold">Interactions</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={customer.id} className="border-b border-border last:border-0">
                  <td className="p-4 text-muted">{index + 1}</td>
                  <td className="p-4">
                    {customer.avatar_url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                        <MediaImage src={customer.avatar_url} alt={customer.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">
                    <Link href={`/agent/crm/customers/${customer.id}`} className="text-primary hover:underline">
                      {customer.name}
                    </Link>
                  </td>
                  <td className="p-4">{customer.email}</td>
                  <td className="p-4">{customer.country || "—"}</td>
                  <td className="p-4 capitalize">{customer.status}</td>
                  <td className="p-4">{customer.loyalty_points ?? 0}</td>
                  <td className="p-4">{customer.bookings_count ?? 0}</td>
                  <td className="p-4">{customer.interaction_count ?? 0}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/agent/crm/customers/${customer.id}`} className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white">
                        CRM Timeline
                      </Link>
                      {canManageUsers ? (
                        <Link href={`/agent/users?edit=${customer.id}`} className="rounded-lg border border-border px-3 py-1.5 text-sm">
                          Manage Profile
                        </Link>
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
