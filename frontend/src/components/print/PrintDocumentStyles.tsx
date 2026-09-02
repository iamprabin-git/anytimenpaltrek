export default function PrintDocumentStyles() {
  return (
    <style jsx global>{`
      @media print {
        @page {
          margin: 12mm;
        }

        body * {
          visibility: hidden;
        }

        .print-document-root,
        .print-document-root * {
          visibility: visible;
        }

        .print-document-root {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 0;
          color: #111827;
          background: #fff;
        }

        .print-hidden {
          display: none !important;
        }

        .print-receipt-header {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1.25rem;
        }

        .print-receipt-header-accent {
          height: 4px;
          background: linear-gradient(90deg, #1e3a5f 0%, #c9a227 100%);
        }

        .print-receipt-header-body {
          padding: 1.25rem 1.5rem 1rem;
        }

        .print-receipt-brand-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
        }

        .print-receipt-brand {
          display: flex;
          gap: 1rem;
          align-items: center;
          min-width: 0;
        }

        .print-receipt-logo {
          width: 72px;
          height: 72px;
          object-fit: contain;
          flex-shrink: 0;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 6px;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .print-receipt-logo-fallback {
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f3f4f6;
          color: #1e3a5f;
          font-size: 1.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .print-receipt-doc-meta {
          text-align: right;
          flex-shrink: 0;
        }

        .print-receipt-doc-subtitle {
          margin-top: 4px;
          font-size: 0.78rem;
          color: #6b7280;
        }

        .print-receipt-doc-ref {
          margin-top: 6px;
          font-size: 0.78rem;
          color: #374151;
        }

        .print-receipt-company-name {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e3a5f;
          letter-spacing: 0.02em;
        }

        .print-receipt-doc-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .print-receipt-contact {
          margin-top: 0.75rem;
          font-size: 0.8rem;
          line-height: 1.5;
          color: #4b5563;
        }

        .print-receipt-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem 2rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .print-receipt-meta-grid-single {
          grid-template-columns: 1fr;
        }

        .print-receipt-meta-block h3 {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b7280;
          margin-bottom: 0.35rem;
        }

        .print-receipt-meta-block p {
          font-size: 0.82rem;
          line-height: 1.45;
          color: #111827;
        }

        .print-receipt-meta-block strong {
          font-weight: 600;
        }

        .print-receipt-footer {
          margin-top: 1.25rem;
          padding-top: 0.75rem;
          border-top: 1px dashed #d1d5db;
          font-size: 0.75rem;
          line-height: 1.5;
          color: #6b7280;
          text-align: center;
        }

        .print-receipt-table-wrap {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
        }

        .print-receipt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
        }

        .print-receipt-table thead {
          background: #f3f4f6;
        }

        .print-receipt-table th,
        .print-receipt-table td {
          border: 1px solid #e5e7eb;
          padding: 0.55rem 0.65rem;
          vertical-align: top;
          text-align: left;
        }

        .print-receipt-table th {
          font-weight: 700;
          color: #1e3a5f;
        }

        .print-receipt-section-title {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #1e3a5f;
          margin-bottom: 0.75rem;
        }

        .print-receipt-details {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          margin-bottom: 1rem;
        }

        .print-receipt-ticket-table td {
          font-size: 0.8rem;
        }

        .print-receipt-kv-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .print-receipt-kv-table td:first-child {
          background: #f3f4f6;
        }
      }
    `}</style>
  );
}
