import type { CompanySettings } from "@/types";

interface PrintDocumentFooterProps {
  company: CompanySettings | null;
}

export default function PrintDocumentFooter({ company }: PrintDocumentFooterProps) {
  const companyName = company?.company_name || "Anytime Nepal Trek";
  const phone = company?.phone || "+977 9851086445";
  const email = company?.email || "info@anytimenepaltrek.com";

  return (
    <div className="hidden print:block print-receipt-footer">
      <p>
        Thank you for choosing <strong>{companyName}</strong>. For booking support or inquiries, contact us at{" "}
        <strong>{phone}</strong> or <strong>{email}</strong>.
      </p>
      <p style={{ marginTop: 6 }}>This is a computer-generated document and does not require a signature.</p>
    </div>
  );
}
