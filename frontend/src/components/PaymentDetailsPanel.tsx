"use client";

import MediaImage from "@/components/MediaImage";
import type { PaymentSettingsData } from "@/lib/user-api";

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}

type PaymentDetailsPanelProps = {
  settings: PaymentSettingsData;
  compact?: boolean;
};

export default function PaymentDetailsPanel({ settings, compact = false }: PaymentDetailsPanelProps) {
  const hasBankDetails =
    settings.bank_name ||
    settings.account_name ||
    settings.account_number ||
    settings.branch ||
    settings.swift_code;

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact ? (
        <div>
          <h1 className="panel-title mb-2">{settings.title || "Payment Details"}</h1>
          {settings.instructions ? <p className="text-sm text-muted">{settings.instructions}</p> : null}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-foreground">{settings.title || "Payment Details"}</h2>
          {settings.instructions ? <p className="mt-1 text-sm text-muted">{settings.instructions}</p> : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {hasBankDetails ? (
          <div className="panel-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Bank Account</h2>
            <dl className="space-y-4">
              <DetailRow label="Bank Name" value={settings.bank_name} />
              <DetailRow label="Account Name" value={settings.account_name} />
              <DetailRow label="Account Number" value={settings.account_number} />
              <DetailRow label="Branch" value={settings.branch} />
              <DetailRow label="SWIFT / BIC" value={settings.swift_code} />
            </dl>
          </div>
        ) : null}

        {settings.qr_code_url ? (
          <div className="panel-card">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Scan to Pay</h2>
            <div className="mx-auto w-fit rounded-xl border border-border bg-white p-4">
              <div className="relative h-56 w-56">
                <MediaImage src={settings.qr_code_url} alt="Payment QR code" fill className="object-contain" sizes="224px" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
