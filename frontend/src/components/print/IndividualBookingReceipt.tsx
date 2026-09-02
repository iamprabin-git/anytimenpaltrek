import type { CompanySettings } from "@/types";
import PrintDocumentFooter from "@/components/print/PrintDocumentFooter";
import PrintReceiptHeader from "@/components/print/PrintReceiptHeader";
import {
  bookingDocumentRef,
  bookingMethodLabel,
  bookingStatusLabel,
  formatReceiptDate,
  formatReceiptDateTime,
  type BookingReceiptData,
} from "@/lib/booking-receipt";

interface IndividualBookingReceiptProps {
  booking: BookingReceiptData;
  company: CompanySettings | null;
  logoSrc?: string | null;
  printedAt: Date;
  title?: string;
  subtitle?: string;
}

function ticketDetailRows(booking: BookingReceiptData) {
  const rows: { label: string; value: string }[] = [
    { label: "Booking Reference", value: `#${booking.id}` },
    { label: "Document Ref", value: bookingDocumentRef(booking.id) },
    { label: "Submitted On", value: formatReceiptDateTime(booking.created_at) },
    { label: "Trip Date", value: formatReceiptDate(booking.booking_date) },
    { label: "Customer Name", value: booking.customer_name || "—" },
    { label: "Customer Email", value: booking.customer_email || "—" },
    { label: "Customer Phone", value: booking.customer_phone || "—" },
    { label: "Customer Address", value: booking.customer_address || "—" },
    { label: "Package / Trip", value: booking.package.title },
    { label: "Category", value: booking.package.category || "Trip" },
    { label: "Payment Method", value: bookingMethodLabel(booking.payment_method) },
    { label: "Amount", value: `${booking.currency.toUpperCase()} ${booking.amount}` },
    { label: "Status", value: bookingStatusLabel(booking.status) },
  ];

  if (booking.approved_at) {
    rows.push({ label: "Approved On", value: formatReceiptDateTime(booking.approved_at) });
  }
  if (booking.approver_name) {
    rows.push({ label: "Approved By", value: booking.approver_name });
  }
  if (booking.customer_notes) {
    rows.push({ label: "Customer Notes", value: booking.customer_notes });
  }
  if (booking.review_note) {
    rows.push({ label: "Manager Note", value: booking.review_note });
  }
  if (booking.payment_proof_url) {
    rows.push({ label: "Payment Proof", value: booking.payment_proof_url });
  }

  return rows;
}

export default function IndividualBookingReceipt({
  booking,
  company,
  logoSrc,
  printedAt,
  title = "Booking Receipt",
  subtitle = "Individual trip booking ticket",
}: IndividualBookingReceiptProps) {
  const details = ticketDetailRows(booking);

  return (
    <div className="hidden print:block">
      <PrintReceiptHeader
        title={title}
        subtitle={subtitle}
        company={company}
        logoSrc={logoSrc}
        printedAt={printedAt}
        customerName={booking.customer_name}
        customerEmail={booking.customer_email}
        customerPhone={booking.customer_phone || undefined}
        customerAddress={booking.customer_address || undefined}
        documentRef={bookingDocumentRef(booking.id)}
        metaItems={[{ label: "Booking Status", value: bookingStatusLabel(booking.status) }]}
      />

      <section className="print-receipt-details">
        <h2 className="print-receipt-section-title">Ticket Summary</h2>
        <div className="print-receipt-table-wrap">
          <table className="print-receipt-table print-receipt-ticket-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Package / Trip</th>
                <th>Category</th>
                <th>Trip Date</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#{booking.id}</td>
                <td>{booking.package.title}</td>
                <td style={{ textTransform: "capitalize" }}>{booking.package.category || "Trip"}</td>
                <td>{formatReceiptDate(booking.booking_date)}</td>
                <td>{bookingMethodLabel(booking.payment_method)}</td>
                <td style={{ fontWeight: 700 }}>
                  {booking.currency.toUpperCase()} {booking.amount}
                </td>
                <td>{bookingStatusLabel(booking.status)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="print-receipt-details">
        <h2 className="print-receipt-section-title">Ticket Details</h2>
        <div className="print-receipt-table-wrap">
          <table className="print-receipt-table print-receipt-kv-table">
            <thead>
              <tr>
                <th style={{ width: "32%" }}>Detail</th>
                <th>Information</th>
              </tr>
            </thead>
            <tbody>
              {details.map((row) => (
                <tr key={row.label}>
                  <td style={{ fontWeight: 700, color: "#374151" }}>{row.label}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <PrintDocumentFooter company={company} />
    </div>
  );
}
