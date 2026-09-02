"use client";

import { useEffect, useState } from "react";
import { LogoUploadField } from "@/components/ImageUploadField";
import {
  getAdminCompanySettings,
  updateAdminCompanySettingsForm,
  type CompanySettings,
} from "@/lib/admin-api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dynamicJson, setDynamicJson] = useState("{}");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminCompanySettings().then((data) => {
      setSettings(data);
      setDynamicJson(JSON.stringify(data.dynamic_settings || {}, null, 2));
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      JSON.parse(dynamicJson);
    } catch {
      setError("Dynamic settings must be valid JSON.");
      setSaving(false);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const parsedDynamic = JSON.parse(dynamicJson) as Record<string, unknown>;
    parsedDynamic.tagline = formData.get("tagline");
    parsedDynamic.support_hours = formData.get("support_hours");
    parsedDynamic.registration_number = formData.get("registration_number");
    parsedDynamic.tourism_license = formData.get("tourism_license");
    parsedDynamic.contact_whatsapp = formData.get("contact_whatsapp");
    parsedDynamic.contact_viber = formData.get("contact_viber");
    parsedDynamic.contact_map_embed_url = formData.get("contact_map_embed_url");
    parsedDynamic.staff_contacts = [1, 2, 3]
      .map((index) => ({
        name: String(formData.get(`staff_${index}_name`) || "").trim(),
        role: String(formData.get(`staff_${index}_role`) || "").trim(),
        phone: String(formData.get(`staff_${index}_phone`) || "").trim(),
        email: String(formData.get(`staff_${index}_email`) || "").trim(),
        whatsapp: String(formData.get(`staff_${index}_whatsapp`) || "").trim(),
        viber: String(formData.get(`staff_${index}_viber`) || "").trim(),
      }))
      .filter((staff) => staff.name);
    parsedDynamic.sister_companies = [1, 2, 3, 4]
      .map((index) => ({
        id: String(formData.get(`sister_${index}_id`) || `sister-${index}`).trim(),
        name: String(formData.get(`sister_${index}_name`) || "").trim(),
        description: String(formData.get(`sister_${index}_description`) || "").trim(),
        website: String(formData.get(`sister_${index}_website`) || "").trim(),
        location: String(formData.get(`sister_${index}_location`) || "").trim(),
        visible: formData.get(`sister_${index}_visible`) === "on",
      }))
      .filter((company) => company.name);
    formData.set("dynamic_settings", JSON.stringify(parsedDynamic));

    try {
      const result = await updateAdminCompanySettingsForm(formData);
      setSettings(result.settings);
      setMessage("Company settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="text-muted">Loading settings...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Company Settings</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4 max-w-3xl">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input name="company_name" defaultValue={settings.company_name} required className="w-full border border-border rounded-lg px-4 py-2" />
        </div>

        <LogoUploadField previewUrl={settings.logo_url || settings.logo} />

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea name="address" defaultValue={settings.address || ""} rows={3} className="w-full border border-border rounded-lg px-4 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" defaultValue={settings.phone || ""} className="w-full border border-border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" defaultValue={settings.email || ""} className="w-full border border-border rounded-lg px-4 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input name="website" defaultValue={settings.website || ""} className="w-full border border-border rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" defaultValue={settings.description || ""} rows={4} className="w-full border border-border rounded-lg px-4 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input name="tagline" defaultValue={String(settings.dynamic_settings?.tagline || "")} className="w-full border border-border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Support Hours Text</label>
            <input name="support_hours" defaultValue={String(settings.dynamic_settings?.support_hours || "")} className="w-full border border-border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Registration Number</label>
            <input name="registration_number" defaultValue={String(settings.dynamic_settings?.registration_number || "")} className="w-full border border-border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tourism License</label>
            <input name="tourism_license" defaultValue={String(settings.dynamic_settings?.tourism_license || "")} className="w-full border border-border rounded-lg px-4 py-2" />
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <h2 className="text-lg font-semibold">Staff & Messaging Contacts</h2>
          <p className="text-sm text-muted">Shown on the customer Contact to Staff page (WhatsApp, Viber, and staff details).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
              <input
                name="contact_whatsapp"
                defaultValue={String(settings.dynamic_settings?.contact_whatsapp || settings.phone || "")}
                className="w-full border border-border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Viber Number</label>
              <input
                name="contact_viber"
                defaultValue={String(settings.dynamic_settings?.contact_viber || settings.phone || "")}
                className="w-full border border-border rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {[1, 2, 3].map((index) => {
            const staff = Array.isArray(settings.dynamic_settings?.staff_contacts)
              ? (settings.dynamic_settings?.staff_contacts as Array<Record<string, string>>)[index - 1]
              : undefined;

            return (
              <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                <h3 className="font-medium">Staff Contact {index}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name={`staff_${index}_name`} defaultValue={staff?.name || ""} placeholder="Name" className="w-full border border-border rounded-lg px-4 py-2" />
                  <input name={`staff_${index}_role`} defaultValue={staff?.role || ""} placeholder="Role (e.g. Manager)" className="w-full border border-border rounded-lg px-4 py-2" />
                  <input name={`staff_${index}_phone`} defaultValue={staff?.phone || ""} placeholder="Phone" className="w-full border border-border rounded-lg px-4 py-2" />
                  <input name={`staff_${index}_email`} defaultValue={staff?.email || ""} placeholder="Email" className="w-full border border-border rounded-lg px-4 py-2" />
                  <input name={`staff_${index}_whatsapp`} defaultValue={staff?.whatsapp || ""} placeholder="WhatsApp" className="w-full border border-border rounded-lg px-4 py-2" />
                  <input name={`staff_${index}_viber`} defaultValue={staff?.viber || ""} placeholder="Viber" className="w-full border border-border rounded-lg px-4 py-2" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <h2 className="text-lg font-semibold">Contact Page</h2>
          <p className="text-sm text-muted">Map embed and sister companies shown on the public contact page.</p>
          <div>
            <label className="block text-sm font-medium mb-1">Google Maps Embed URL</label>
            <textarea
              name="contact_map_embed_url"
              defaultValue={String(settings.dynamic_settings?.contact_map_embed_url || "")}
              rows={3}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full border border-border rounded-lg px-4 py-2 font-mono text-sm"
            />
          </div>

          {[1, 2, 3, 4].map((index) => {
            const sister = Array.isArray(settings.dynamic_settings?.sister_companies)
              ? (settings.dynamic_settings?.sister_companies as Array<Record<string, unknown>>)[index - 1]
              : undefined;

            return (
              <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">Sister Company {index}</h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={`sister_${index}_visible`}
                      defaultChecked={sister?.visible !== false}
                    />
                    Visible
                  </label>
                </div>
                <input type="hidden" name={`sister_${index}_id`} defaultValue={String(sister?.id || `sister-${index}`)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    name={`sister_${index}_name`}
                    defaultValue={String(sister?.name || "")}
                    placeholder="Company name"
                    className="w-full border border-border rounded-lg px-4 py-2"
                  />
                  <input
                    name={`sister_${index}_location`}
                    defaultValue={String(sister?.location || "")}
                    placeholder="Location"
                    className="w-full border border-border rounded-lg px-4 py-2"
                  />
                  <input
                    name={`sister_${index}_website`}
                    defaultValue={String(sister?.website || "")}
                    placeholder="Website URL"
                    className="w-full border border-border rounded-lg px-4 py-2 md:col-span-2"
                  />
                  <textarea
                    name={`sister_${index}_description`}
                    defaultValue={String(sister?.description || "")}
                    placeholder="Short description"
                    rows={2}
                    className="w-full border border-border rounded-lg px-4 py-2 md:col-span-2"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Advanced Dynamic Parameters (JSON)</label>
          <p className="text-xs text-muted mb-2">Tagline, social links, license numbers, currency, etc.</p>
          <textarea value={dynamicJson} onChange={(e) => setDynamicJson(e.target.value)} rows={10} className="w-full border border-border rounded-lg px-4 py-2 font-mono text-sm" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
