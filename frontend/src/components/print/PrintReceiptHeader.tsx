import type { CompanySettings } from "@/types";
import { formatPrintDate, formatPrintDateTime } from "@/lib/print-document";
import { resolveMediaUrl } from "@/lib/media";

export interface PrintReceiptMetaItem {
  label: string;
  value: string;
}

interface PrintReceiptHeaderProps {
  title: string;
  subtitle?: string;
  company: CompanySettings | null;
  logoSrc?: string | null;
  printedAt: Date;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  documentRef?: string;
  metaItems?: PrintReceiptMetaItem[];
}

export default function PrintReceiptHeader({
  title,
  subtitle,
  company,
  logoSrc,
  printedAt,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  documentRef,
  metaItems = [],
}: PrintReceiptHeaderProps) {
  const companyName = company?.company_name || "Anytime Nepal Trek";
  const address = company?.address || "Thamel, Kathmandu, Nepal";
  const phone = company?.phone || "+977 9851086445";
  const email = company?.email || "info@anytimenepaltrek.com";
  const website = company?.website || "www.anytimenepaltrek.com";
  const logo = logoSrc || resolveMediaUrl(company?.logo_url || company?.logo);
  const hasCustomer = customerName || customerEmail || customerPhone || customerAddress;

  return (
    <div className="hidden print:block print-receipt-header">
      <div className="print-receipt-header-accent" />
      <div className="print-receipt-header-body">
        <div className="print-receipt-brand-row">
          <div className="print-receipt-brand">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={`${companyName} logo`} className="print-receipt-logo" />
            ) : (
              <div className="print-receipt-logo-fallback">{companyName.charAt(0)}</div>
            )}
            <div>
              <p className="print-receipt-company-name">{companyName}</p>
              <p className="print-receipt-contact">{address}</p>
            </div>
          </div>
          <div className="print-receipt-doc-meta">
            <p className="print-receipt-doc-title">{title}</p>
            {subtitle ? <p className="print-receipt-doc-subtitle">{subtitle}</p> : null}
            {documentRef ? (
              <p className="print-receipt-doc-ref">
                <strong>Ref:</strong> {documentRef}
              </p>
            ) : null}
          </div>
        </div>

        <div className="print-receipt-contact">
          <strong>Phone:</strong> {phone}
          {" · "}
          <strong>Email:</strong> {email}
          {" · "}
          <strong>Web:</strong> {website}
        </div>

        <div className={`print-receipt-meta-grid${hasCustomer ? "" : " print-receipt-meta-grid-single"}`}>
          {hasCustomer ? (
            <div className="print-receipt-meta-block">
              <h3>Customer Details</h3>
              {customerName ? (
                <p>
                  <strong>Name:</strong> {customerName}
                </p>
              ) : null}
              {customerEmail ? (
                <p>
                  <strong>Email:</strong> {customerEmail}
                </p>
              ) : null}
              {customerPhone ? (
                <p>
                  <strong>Phone:</strong> {customerPhone}
                </p>
              ) : null}
              {customerAddress ? (
                <p>
                  <strong>Address:</strong> {customerAddress}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="print-receipt-meta-block">
            <h3>Document Information</h3>
            <p>
              <strong>Print Date:</strong> {formatPrintDate(printedAt)}
            </p>
            <p>
              <strong>Print Time:</strong>{" "}
              {printedAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p>
              <strong>Generated:</strong> {formatPrintDateTime(printedAt)}
            </p>
            {metaItems.map((item) => (
              <p key={item.label}>
                <strong>{item.label}:</strong> {item.value}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
