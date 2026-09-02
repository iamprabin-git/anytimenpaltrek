"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCrmSummary, type CrmSummary } from "@/lib/agent-api";
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

export default function AgentCrmDashboardPage() {
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [error, setError] = useState("");
  const canManageCampaigns = hasPermission("crm.campaigns.manage");

  useEffect(() => {
    getCrmSummary()
      .then(setSummary)
      .catch(() => setError("Failed to load CRM dashboard."));
  }, []);

  if (!summary && !error) {
    return <p className="text-muted">Loading CRM dashboard...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">CRM Dashboard</h1>
          <p className="text-sm text-muted">
            Track customer interactions and support marketing with personalized trek deals, loyalty updates, and seasonal promotions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/agent/crm/customers" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
            Customer Insights
          </Link>
          {hasPermission("users.view") ? (
            <Link href="/agent/users" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
              Customer Management
            </Link>
          ) : null}
          {hasPermission("users.view") ? (
            <Link href="/agent/users" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
              Customer Management
            </Link>
          ) : null}
          {hasPermission("crm.campaigns.view") ? (
            <>
              <Link href="/agent/crm/email-marketing" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
                Email Marketing
              </Link>
              <Link href="/agent/crm/whatsapp-marketing" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
                WhatsApp Marketing
              </Link>
              <Link href="/agent/crm/campaigns" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                All Campaigns
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      {summary ? (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Active Customers", value: summary.stats.active_customers },
              { label: "Pending Customers", value: summary.stats.pending_customers },
              { label: "Loyalty Members", value: summary.stats.loyalty_members },
              { label: "Draft Campaigns", value: summary.stats.draft_campaigns },
              { label: "Sent Campaigns", value: summary.stats.sent_campaigns },
            ].map((card) => (
              <div key={card.label} className="panel-card">
                <p className="text-sm text-muted">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-border bg-surface shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Interactions</h2>
              </div>
              {summary.recent_interactions.length === 0 ? (
                <p className="p-6 text-sm text-muted">No CRM notes logged yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {summary.recent_interactions.map((item) => (
                    <div key={item.id} className="px-6 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm text-muted">
                            {item.customer_name || "Customer"}
                            {item.agent_name ? ` · logged by ${item.agent_name}` : ""}
                          </p>
                          {item.description ? <p className="mt-2 text-sm text-foreground">{item.description}</p> : null}
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs capitalize">{item.type}</span>
                          <p className="mt-2 text-xs text-muted">{formatDate(item.created_at)}</p>
                        </div>
                      </div>
                      {item.customer_id ? (
                        <Link href={`/agent/crm/customers/${item.customer_id}`} className="mt-3 inline-block text-sm font-medium text-primary">
                          View customer timeline
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">Marketing Use Cases</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>Send personalized trek and tour deals to customers with past bookings.</li>
                <li>Notify loyalty members when their points balance changes.</li>
                <li>Launch seasonal promotions through email or WhatsApp.</li>
                <li>Use Email Marketing for automated customer emails.</li>
                <li>Use WhatsApp Marketing to open personalized chats with one click.</li>
                <li>Log calls, emails, and notes on each customer timeline.</li>
              </ul>
              {canManageCampaigns ? (
                <p className="mt-6 text-sm text-muted">
                  Use placeholders in campaign messages: <code className="text-foreground">{"{name}"}</code>,{" "}
                  <code className="text-foreground">{"{loyalty_points}"}</code>,{" "}
                  <code className="text-foreground">{"{country}"}</code>.
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
