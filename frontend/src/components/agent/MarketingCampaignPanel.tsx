"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createCrmCampaign,
  getCrmCampaignRecipients,
  getCrmCampaigns,
  getCrmSummary,
  sendCrmCampaign,
  type CrmCampaign,
  type CrmCampaignRecipient,
  type CrmSummary,
} from "@/lib/agent-api";
import { hasPermission } from "@/lib/auth";

type MarketingChannel = "in_app" | "email" | "whatsapp";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: string) {
  if (status === "sent" || status === "ready") return "bg-green-100 text-green-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  if (status === "skipped") return "bg-neutral-100 text-neutral-700";
  return "bg-amber-100 text-amber-800";
}

function channelLabel(channel: string, labels?: Record<string, string>) {
  return labels?.[channel] || channel.replaceAll("_", " ");
}

function campaignUsesChannel(campaign: CrmCampaign, channel: MarketingChannel) {
  return (campaign.channels || ["in_app"]).includes(channel);
}

interface MarketingCampaignPanelProps {
  title: string;
  description: string;
  defaultChannels: MarketingChannel[];
  filterChannel?: MarketingChannel;
  showChannelPicker?: boolean;
  showWhatsAppRecipients?: boolean;
}

export default function MarketingCampaignPanel({
  title,
  description,
  defaultChannels,
  filterChannel,
  showChannelPicker = false,
  showWhatsAppRecipients = false,
}: MarketingCampaignPanelProps) {
  const [campaigns, setCampaigns] = useState<CrmCampaign[]>([]);
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [recipients, setRecipients] = useState<CrmCampaignRecipient[]>([]);
  const canManage = hasPermission("crm.campaigns.manage");

  const [form, setForm] = useState({
    name: "",
    campaign_type: "deal",
    segment: "all_active",
    segment_value: "",
    subject: "",
    message: "",
    channels: defaultChannels,
    send_now: false,
  });

  async function load() {
    const [campaignData, summaryData] = await Promise.all([getCrmCampaigns(), getCrmSummary()]);
    setCampaigns(campaignData);
    setSummary(summaryData);
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load marketing campaigns."));
  }, []);

  useEffect(() => {
    setForm((current) => ({ ...current, channels: defaultChannels }));
  }, [defaultChannels.join(",")]);

  const visibleCampaigns = useMemo(() => {
    if (!filterChannel) return campaigns;
    return campaigns.filter((campaign) => campaignUsesChannel(campaign, filterChannel));
  }, [campaigns, filterChannel]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const result = await createCrmCampaign({
        ...form,
        channels: form.channels.length > 0 ? form.channels : defaultChannels,
        segment_value: form.segment === "by_country" ? form.segment_value : undefined,
      });
      setMessage(result.message);
      setShowForm(false);
      setForm({
        name: "",
        campaign_type: "deal",
        segment: "all_active",
        segment_value: "",
        subject: "",
        message: "",
        channels: defaultChannels,
        send_now: false,
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save campaign.");
    }
  }

  async function handleSend(id: number) {
    setMessage("");
    setError("");

    try {
      const result = await sendCrmCampaign(id);
      setMessage(result.message);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send campaign.");
    }
  }

  async function handleViewRecipients(campaignId: number) {
    setError("");
    try {
      const data = await getCrmCampaignRecipients(campaignId);
      setRecipients(data.recipients);
      setSelectedCampaignId(campaignId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign recipients.");
    }
  }

  function toggleChannel(channel: MarketingChannel) {
    setForm((current) => {
      const exists = current.channels.includes(channel);
      const channels = exists ? current.channels.filter((item) => item !== channel) : [...current.channels, channel];
      return { ...current, channels: channels.length > 0 ? channels : [channel] };
    });
  }

  const channelLabels = summary?.channels;
  const brevo = summary?.brevo;
  const usesEmail = !filterChannel || filterChannel === "email" || defaultChannels.includes("email");

  return (
    <div>
      {usesEmail && brevo && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${brevo.configured ? "border-green-200 bg-green-50 text-green-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
          <p className="font-medium">
            Brevo email marketing: {brevo.configured ? "Connected" : "Not configured"}
          </p>
          <p className="mt-1 opacity-90">
            {brevo.configured
              ? `Campaign emails are sent through Brevo from ${brevo.sender_email || brevo.sender_name}.`
              : "CRM email campaigns will use Laravel mail until an admin enables Brevo in Company Settings."}
          </p>
        </div>
      )}

      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">{title}</h1>
          <p className="text-sm text-muted">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/agent/crm" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
            CRM Dashboard
          </Link>
          <Link href="/agent/crm/campaigns" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
            All Campaigns
          </Link>
          {canManage ? (
            <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
              {showForm ? "Close Form" : "New Campaign"}
            </button>
          ) : null}
        </div>
      </div>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      {canManage && showForm ? (
        <form onSubmit={handleCreate} className="mb-8 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Create Campaign</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Campaign name"
              className="panel-input"
            />
            <select value={form.campaign_type} onChange={(e) => setForm({ ...form, campaign_type: e.target.value })} className="panel-input">
              {Object.entries(summary?.campaign_types || {}).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} className="panel-input">
              {Object.entries(summary?.segments || {}).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {form.segment === "by_country" ? (
              <input
                value={form.segment_value}
                onChange={(e) => setForm({ ...form, segment_value: e.target.value })}
                placeholder="Country"
                className="panel-input"
              />
            ) : (
              <div />
            )}
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Message subject"
              className="panel-input md:col-span-2"
            />
            <textarea
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Message body. Use {name}, {loyalty_points}, {country}, {company_name}."
              rows={5}
              className="panel-input md:col-span-2"
            />
          </div>

          {showChannelPicker ? (
            <div className="mt-4 flex flex-wrap gap-4">
              {(Object.keys(channelLabels || {}) as MarketingChannel[]).map((channel) => (
                <label key={channel} className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" checked={form.channels.includes(channel)} onChange={() => toggleChannel(channel)} />
                  {channelLabel(channel, channelLabels)}
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Delivery channel: {defaultChannels.map((channel) => channelLabel(channel, channelLabels)).join(", ")}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={form.send_now} onChange={(e) => setForm({ ...form, send_now: e.target.checked })} />
              Send immediately after saving
            </label>
            <button type="submit" className="btn-primary">
              Save Campaign
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {visibleCampaigns.length === 0 ? (
          <p className="p-6 text-sm text-muted">No campaigns created yet.</p>
        ) : (
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-4 text-left font-semibold">S.N.</th>
                <th className="p-4 text-left font-semibold">Campaign</th>
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">Channels</th>
                <th className="p-4 text-left font-semibold">Segment</th>
                <th className="p-4 text-left font-semibold">Subject</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Delivered</th>
                <th className="p-4 text-left font-semibold">Sent</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCampaigns.map((campaign, index) => (
                <tr key={campaign.id} className="border-b border-border align-top last:border-0">
                  <td className="p-4 text-muted">{index + 1}</td>
                  <td className="p-4 font-medium">{campaign.name}</td>
                  <td className="p-4 capitalize">{campaign.campaign_type.replaceAll("_", " ")}</td>
                  <td className="p-4">
                    {(campaign.channels || ["in_app"]).map((channel) => channelLabel(channel, channelLabels)).join(", ")}
                  </td>
                  <td className="p-4">
                    {summary?.segments?.[campaign.segment] || campaign.segment}
                    {campaign.segment_value ? ` (${campaign.segment_value})` : ""}
                  </td>
                  <td className="max-w-xs p-4">{campaign.subject}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {filterChannel === "email" || campaign.channels?.includes("email") ? (
                      <span className="block">Email: {campaign.email_sent_count ?? 0}</span>
                    ) : null}
                    {filterChannel === "whatsapp" || campaign.channels?.includes("whatsapp") ? (
                      <span className="block">WhatsApp: {campaign.whatsapp_sent_count ?? 0}</span>
                    ) : null}
                    {!filterChannel ? (
                      <>
                        <span className="block">Email: {campaign.email_sent_count ?? 0}</span>
                        <span className="block">WhatsApp: {campaign.whatsapp_sent_count ?? 0}</span>
                        <span className="block">In-app: {campaign.in_app_sent_count ?? 0}</span>
                      </>
                    ) : null}
                  </td>
                  <td className="p-4 whitespace-nowrap text-muted">{formatDate(campaign.sent_at)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {canManage && campaign.status === "draft" ? (
                        <button type="button" onClick={() => handleSend(campaign.id)} className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white">
                          Send Now
                        </button>
                      ) : null}
                      {showWhatsAppRecipients && campaign.status === "sent" && campaignUsesChannel(campaign, "whatsapp") ? (
                        <button type="button" onClick={() => handleViewRecipients(campaign.id)} className="rounded-lg border border-border px-3 py-1.5 text-sm">
                          WhatsApp Links
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

      {selectedCampaignId && showWhatsAppRecipients ? (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">WhatsApp Delivery Links</h2>
            <p className="mt-1 text-sm text-muted">Open each customer chat in WhatsApp Web or the mobile app with the personalized message pre-filled.</p>
          </div>
          {recipients.filter((item) => item.channel === "whatsapp").length === 0 ? (
            <p className="p-6 text-sm text-muted">No WhatsApp recipients for this campaign.</p>
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  <th className="p-4 text-left font-semibold">Customer</th>
                  <th className="p-4 text-left font-semibold">WhatsApp</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {recipients
                  .filter((item) => item.channel === "whatsapp")
                  .map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <span className="font-medium">{item.customer?.name || "Customer"}</span>
                        <span className="mt-1 block text-xs text-muted">{item.customer?.email || "—"}</span>
                      </td>
                      <td className="p-4">{item.delivery_meta?.whatsapp_number || item.customer?.whatsapp_number || item.customer?.phone || "—"}</td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.delivery_meta?.whatsapp_url ? (
                          <a
                            href={String(item.delivery_meta.whatsapp_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white"
                          >
                            Open WhatsApp
                          </a>
                        ) : (
                          <span className="text-muted">No WhatsApp number</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  );
}
