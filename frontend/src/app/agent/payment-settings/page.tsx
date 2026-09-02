"use client";

import { useEffect, useState } from "react";
import MediaImage from "@/components/MediaImage";
import {
  getAgentPaymentSettings,
  updateAgentPaymentSettingsForm,
  type PaymentSettingsData,
} from "@/lib/agent-api";
import { hasPermission } from "@/lib/auth";
import { imageAccept, previewFile } from "@/lib/form-upload";

function appendCheckbox(formData: FormData, form: HTMLFormElement, name: string) {
  const input = form.elements.namedItem(name) as HTMLInputElement | null;
  formData.set(name, input?.checked ? "1" : "0");
}

export default function AgentPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null);
  const [bankMessage, setBankMessage] = useState("");
  const [bankError, setBankError] = useState("");
  const [bankSaving, setBankSaving] = useState(false);
  const [qrMessage, setQrMessage] = useState("");
  const [qrError, setQrError] = useState("");
  const [qrSaving, setQrSaving] = useState(false);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [removeQr, setRemoveQr] = useState(false);
  const canEdit = hasPermission("payment_settings.update");

  useEffect(() => {
    getAgentPaymentSettings()
      .then((data) => setSettings(data.payment_settings))
      .catch(() => setBankError("Failed to load payment settings."));
  }, []);

  useEffect(() => {
    return () => {
      if (qrPreview) URL.revokeObjectURL(qrPreview);
    };
  }, [qrPreview]);

  async function saveBankDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;

    setBankSaving(true);
    setBankMessage("");
    setBankError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    appendCheckbox(formData, form, "enabled");

    try {
      const result = await updateAgentPaymentSettingsForm(formData);
      setSettings(result.payment_settings);
      setBankMessage(result.message || "Bank account details saved.");
    } catch (err) {
      setBankError(err instanceof Error ? err.message : "Failed to save bank account details.");
    } finally {
      setBankSaving(false);
    }
  }

  async function saveQrImage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;

    setQrSaving(true);
    setQrMessage("");
    setQrError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const qrFile = formData.get("qr_file");

    if (qrFile instanceof File && qrFile.size > 0) {
      formData.set("qr_file", qrFile);
    } else {
      formData.delete("qr_file");
    }

    if (removeQr) {
      formData.set("remove_qr", "1");
    }

    if (!removeQr && !(qrFile instanceof File && qrFile.size > 0)) {
      setQrError("Choose a QR image to upload, or click Remove QR to delete the current image.");
      setQrSaving(false);
      return;
    }

    try {
      const result = await updateAgentPaymentSettingsForm(formData);
      setSettings(result.payment_settings);
      setRemoveQr(false);
      if (qrPreview) URL.revokeObjectURL(qrPreview);
      setQrPreview(null);
      setQrMessage(result.message || "QR image saved.");
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Failed to save QR image.");
    } finally {
      setQrSaving(false);
    }
  }

  if (!settings) {
    return <p className="text-muted">{bankError || "Loading payment settings..."}</p>;
  }

  const displayQr = removeQr ? null : qrPreview || settings.qr_code_url;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="panel-title mb-2">Payment QR & Bank Details</h1>
        <p className="text-sm text-muted">
          Configure bank transfer details and QR code shown to customers in their account panel when paying for bookings.
        </p>
      </div>

      <form onSubmit={saveBankDetails} className="panel-card space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Bank Account</h2>
          <p className="mt-1 text-sm text-muted">These details appear in the customer payment panel for booking payments.</p>
        </div>

        {bankMessage ? <p className="text-green-600">{bankMessage}</p> : null}
        {bankError ? <p className="text-red-600">{bankError}</p> : null}

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={settings.enabled}
            disabled={!canEdit}
            className="rounded border-border"
          />
          <span>Show payment details to customers</span>
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium">Section Title</label>
          <input
            name="title"
            defaultValue={settings.title}
            disabled={!canEdit}
            className="panel-input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Payment Instructions</label>
          <textarea
            name="instructions"
            defaultValue={settings.instructions}
            disabled={!canEdit}
            rows={3}
            className="panel-input min-h-[96px]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Bank Name</label>
            <input name="bank_name" defaultValue={settings.bank_name} disabled={!canEdit} className="panel-input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Account Name</label>
            <input name="account_name" defaultValue={settings.account_name} disabled={!canEdit} className="panel-input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Account Number</label>
            <input name="account_number" defaultValue={settings.account_number} disabled={!canEdit} className="panel-input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Branch</label>
            <input name="branch" defaultValue={settings.branch} disabled={!canEdit} className="panel-input" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">SWIFT / BIC Code</label>
            <input name="swift_code" defaultValue={settings.swift_code} disabled={!canEdit} className="panel-input" />
          </div>
        </div>

        {canEdit ? (
          <button type="submit" disabled={bankSaving} className="btn-primary disabled:opacity-50">
            {bankSaving ? "Saving..." : "Save Bank Account"}
          </button>
        ) : (
          <p className="text-sm text-muted">You have view-only access. Contact an admin to update payment settings.</p>
        )}
      </form>

      <form onSubmit={saveQrImage} encType="multipart/form-data" className="panel-card space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Payment QR Image</h2>
          <p className="mt-1 text-sm text-muted">Upload or remove the QR code shown alongside bank details in the customer panel.</p>
        </div>

        {qrMessage ? <p className="text-green-600">{qrMessage}</p> : null}
        {qrError ? <p className="text-red-600">{qrError}</p> : null}

        {displayQr ? (
          <div className="inline-block rounded-xl border border-border bg-white p-4">
            <div className="relative h-48 w-48">
              <MediaImage src={displayQr} alt="Payment QR code" fill className="object-contain" sizes="192px" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">No QR code uploaded yet.</p>
        )}

        {canEdit ? (
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-muted">
              Upload QR Image
              <input
                type="file"
                name="qr_file"
                accept={imageAccept}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setRemoveQr(false);
                  previewFile(file, setQrPreview);
                }}
              />
            </label>
            {(settings.qr_code_url || qrPreview) && !removeQr ? (
              <button
                type="button"
                onClick={() => {
                  setRemoveQr(true);
                  if (qrPreview) URL.revokeObjectURL(qrPreview);
                  setQrPreview(null);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-red-600 hover:bg-surface-muted"
              >
                Remove QR
              </button>
            ) : null}
          </div>
        ) : null}

        {canEdit ? (
          <button type="submit" disabled={qrSaving} className="btn-primary disabled:opacity-50">
            {qrSaving ? "Saving..." : "Save QR Image"}
          </button>
        ) : null}
      </form>
    </div>
  );
}
