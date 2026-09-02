import type { CompanySettings } from "@/types";
import PrintDocumentFooter from "@/components/print/PrintDocumentFooter";
import PrintReceiptHeader from "@/components/print/PrintReceiptHeader";
import { PAYMENT_MODES, paymentModeStatus } from "@/lib/payment-modes";
import type { PaymentSettingsData } from "@/lib/user-api";

interface PaymentDetailsReceiptProps {
  settings: PaymentSettingsData;
  company: CompanySettings | null;
  logoSrc?: string | null;
  printedAt: Date;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onlinePaymentEnabled: boolean;
}

function bankRows(settings: PaymentSettingsData) {
  return [
    { label: "Bank Name", value: settings.bank_name },
    { label: "Account Name", value: settings.account_name },
    { label: "Account Number", value: settings.account_number },
    { label: "Branch", value: settings.branch },
    { label: "SWIFT / BIC", value: settings.swift_code },
  ].filter((row) => row.value);
}

export default function PaymentDetailsReceipt({
  settings,
  company,
  logoSrc,
  printedAt,
  customerName,
  customerEmail,
  customerPhone,
  onlinePaymentEnabled,
}: PaymentDetailsReceiptProps) {
  const banks = bankRows(settings);

  return (
    <div className="hidden print:block">
      <PrintReceiptHeader
        title="Payment Receipt"
        subtitle="Accepted payment methods and bank details"
        company={company}
        logoSrc={logoSrc}
        printedAt={printedAt}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        documentRef={`PAY-${printedAt.getFullYear()}${String(printedAt.getMonth() + 1).padStart(2, "0")}${String(printedAt.getDate()).padStart(2, "0")}`}
        metaItems={[{ label: "Document", value: settings.title || "Payment Details" }]}
      />

      <section className="print-receipt-details">
        <h2 className="print-receipt-section-title">Modes of Payment</h2>
        <div className="print-receipt-table-wrap">
          <table className="print-receipt-table print-receipt-ticket-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Description</th>
                <th>How to Pay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_MODES.map((mode) => (
                <tr key={mode.id}>
                  <td style={{ fontWeight: 700 }}>{mode.name}</td>
                  <td>{mode.description}</td>
                  <td>{mode.instructions}</td>
                  <td>{paymentModeStatus(mode.id, onlinePaymentEnabled)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {settings.instructions ? (
        <section className="print-receipt-details">
          <h2 className="print-receipt-section-title">Payment Instructions</h2>
          <p style={{ fontSize: "0.84rem", lineHeight: 1.5 }}>{settings.instructions}</p>
        </section>
      ) : null}

      {banks.length > 0 ? (
        <section className="print-receipt-details">
          <h2 className="print-receipt-section-title">Bank Account Details</h2>
          <div className="print-receipt-table-wrap">
            <table className="print-receipt-table print-receipt-kv-table">
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Detail</th>
                  <th>Information</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((row) => (
                  <tr key={row.label}>
                    <td style={{ fontWeight: 700, color: "#374151" }}>{row.label}</td>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {settings.qr_code_url ? (
        <section className="print-receipt-details">
          <h2 className="print-receipt-section-title">QR Payment</h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.qr_code_url} alt="Payment QR code" style={{ width: 120, height: 120, objectFit: "contain" }} />
            <p style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>{settings.qr_code_url}</p>
          </div>
        </section>
      ) : null}

      <PrintDocumentFooter company={company} />
    </div>
  );
}
