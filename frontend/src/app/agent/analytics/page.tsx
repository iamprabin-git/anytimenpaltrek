"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAgentAnalytics, type AgentAnalytics } from "@/lib/agent-api";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value == null) return "0%";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function SimpleBarChart({
  items,
  valueKey,
  labelKey,
}: {
  items: Array<Record<string, string | number>>;
  valueKey: string;
  labelKey: string;
}) {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const width = `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`;

        return (
          <div key={String(item[labelKey])}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">{item[labelKey]}</span>
              <span className="font-medium text-foreground">{valueKey === "revenue" ? formatMoney(value) : value}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-muted">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAgentAnalytics(days)
      .then(setAnalytics)
      .catch(() => setError("Failed to load analytics."));
  }, [days]);

  const maxTrendRevenue = useMemo(() => {
    if (!analytics) return 1;
    return Math.max(...analytics.revenue_trend.map((item) => item.revenue), 1);
  }, [analytics]);

  if (!analytics && !error) {
    return <p className="text-muted">Loading analytics...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">Dashboard & Analytics</h1>
          <p className="text-sm text-muted">
            Track sales metrics, user behavior, conversion rates, and revenue performance for your trekking and tour business.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/agent" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
            Agent Dashboard
          </Link>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm">
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last 12 months</option>
          </select>
        </div>
      </div>

      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      {analytics ? (
        <>
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Sales Metrics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="panel-card">
                <p className="text-sm text-muted">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold text-primary">{formatMoney(analytics.sales.total_revenue)}</p>
              </div>
              <div className="panel-card">
                <p className="text-sm text-muted">Revenue ({days} days)</p>
                <p className="mt-2 text-3xl font-bold text-primary">{formatMoney(analytics.sales.period_revenue)}</p>
                <p className="mt-1 text-xs text-muted">Growth: {formatPercent(analytics.sales.revenue_growth_percent)}</p>
              </div>
              <div className="panel-card">
                <p className="text-sm text-muted">Paid Bookings</p>
                <p className="mt-2 text-3xl font-bold text-primary">{analytics.sales.paid_bookings}</p>
                <p className="mt-1 text-xs text-muted">{analytics.sales.period_paid_bookings} in selected period</p>
              </div>
              <div className="panel-card">
                <p className="text-sm text-muted">Average Order Value</p>
                <p className="mt-2 text-3xl font-bold text-primary">{formatMoney(analytics.sales.average_order_value)}</p>
                <p className="mt-1 text-xs text-muted">{analytics.sales.pending_bookings} pending bookings</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Conversion Rates</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Inquiry to Booking", value: analytics.conversion.inquiry_to_booking_rate },
                { label: "Registration to Booking", value: analytics.conversion.registration_to_booking_rate },
                { label: "Booking to Paid", value: analytics.conversion.booking_to_paid_rate },
                { label: "Period Booking to Paid", value: analytics.conversion.period_booking_to_paid_rate },
              ].map((item) => (
                <div key={item.label} className="panel-card">
                  <p className="text-sm text-muted">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-primary">{item.value}%</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">User Behavior</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-surface-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">Total Customers</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{analytics.user_behavior.total_customers}</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">New Customers</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{analytics.user_behavior.new_customers}</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">Inquiries</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{analytics.user_behavior.period_inquiries}</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">Wishlist Saves</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{analytics.user_behavior.period_wishlist_saves}</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">Reviews Submitted</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{analytics.user_behavior.period_reviews}</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">Booking Requests</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{analytics.sales.period_booking_requests}</p>
                </div>
              </div>
              {analytics.user_behavior.registrations_by_source.length > 0 ? (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Registrations by Source</h3>
                  <SimpleBarChart
                    items={analytics.user_behavior.registrations_by_source.map((item) => ({
                      label: item.source,
                      bookings: item.count,
                    }))}
                    valueKey="bookings"
                    labelKey="label"
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue Performance</h2>
              <div className="space-y-4">
                {analytics.revenue_trend.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-medium text-foreground">
                        {formatMoney(item.revenue)} · {item.bookings} paid
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-muted">
                      <div
                        className="h-3 rounded-full bg-primary transition-all"
                        style={{ width: `${Math.max((item.revenue / maxTrendRevenue) * 100, item.revenue > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Top Packages by Revenue</h2>
              </div>
              {analytics.top_packages.length === 0 ? (
                <p className="p-6 text-sm text-muted">No paid bookings yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-surface-muted">
                    <tr>
                      <th className="p-4 text-left font-semibold">Package</th>
                      <th className="p-4 text-left font-semibold">Revenue</th>
                      <th className="p-4 text-left font-semibold">Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.top_packages.map((item) => (
                      <tr key={item.package_id ?? item.title} className="border-b border-border last:border-0">
                        <td className="p-4 font-medium">{item.title}</td>
                        <td className="p-4">{formatMoney(item.revenue)}</td>
                        <td className="p-4">{item.bookings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue by Payment Method</h2>
                {analytics.payment_methods.length === 0 ? (
                  <p className="text-sm text-muted">No payment data yet.</p>
                ) : (
                  <SimpleBarChart
                    items={analytics.payment_methods.map((item) => ({
                      label: item.method,
                      revenue: item.revenue,
                    }))}
                    valueKey="revenue"
                    labelKey="label"
                  />
                )}
              </div>

              <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Booking Status Breakdown</h2>
                {analytics.booking_status_breakdown.length === 0 ? (
                  <p className="text-sm text-muted">No bookings yet.</p>
                ) : (
                  <SimpleBarChart
                    items={analytics.booking_status_breakdown.map((item) => ({
                      label: item.status,
                      bookings: item.count,
                    }))}
                    valueKey="bookings"
                    labelKey="label"
                  />
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
