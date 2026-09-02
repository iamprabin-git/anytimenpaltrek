"use client";

import { useEffect, useState } from "react";
import IndividualBookingReceipt from "@/components/print/IndividualBookingReceipt";
import PrintDocumentFooter from "@/components/print/PrintDocumentFooter";
import PrintDocumentStyles from "@/components/print/PrintDocumentStyles";
import PrintReceiptHeader from "@/components/print/PrintReceiptHeader";
import { useBookingPrint } from "@/hooks/useBookingPrint";
import { usePrintCompany } from "@/hooks/usePrintCompany";
import { getAuthUser } from "@/lib/auth";
import {
  bookingMethodLabel,
  bookingStatusLabel,
  formatReceiptDate,
  formatReceiptDateTime,
  userBookingToReceipt,
} from "@/lib/booking-receipt";
import { exportUserBookings, getUserBookings, type UserBooking } from "@/lib/user-api";

export default function AccountBookingsPage() {
  const { company, logoSrc } = usePrintCompany();
  const user = getAuthUser();
  const { printMode, printList, printSingle } = useBookingPrint();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getUserBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleExport() {
    setExporting(true);
    setError("");
    setMessage("");
    try {
      await exportUserBookings();
      setMessage("Booking list exported to Excel.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export bookings.");
    } finally {
      setExporting(false);
    }
  }

  const listPrintedAt = printMode?.type === "list" ? printMode.printedAt : null;

  return (
    <>
      <PrintDocumentStyles />

      <div>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 print-hidden">
          <div>
            <h2 className="text-2xl font-bold mb-2">My Bookings</h2>
            <p className="text-muted text-sm">
              All your trip bookings with dates, payment method, and approval status.
            </p>
          </div>
          {bookings.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {exporting ? "Exporting..." : "Export to Excel"}
              </button>
              <button
                type="button"
                onClick={printList}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
              >
                Print All
              </button>
            </div>
          ) : null}
        </div>

        {message ? <p className="mb-4 text-green-600 print-hidden">{message}</p> : null}
        {error ? <p className="mb-4 text-red-600 print-hidden">{error}</p> : null}

        <div className="print-document-root">
          <div className={printMode?.type === "single" ? "print-hidden" : undefined}>
            {listPrintedAt ? (
              <PrintReceiptHeader
                title="Booking Receipt"
                subtitle="Customer booking summary"
                company={company}
                logoSrc={logoSrc}
                printedAt={listPrintedAt}
                customerName={user?.name}
                customerEmail={user?.email}
                customerPhone={user?.phone || undefined}
                customerAddress={user?.country ? `${user.country}` : undefined}
                documentRef={`BK-${listPrintedAt.getFullYear()}${String(listPrintedAt.getMonth() + 1).padStart(2, "0")}${String(listPrintedAt.getDate()).padStart(2, "0")}-${user?.id || "0"}`}
                metaItems={[{ label: "Total Bookings", value: String(bookings.length) }]}
              />
            ) : null}

            {loading ? (
              <p className="text-muted print-hidden">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p className="text-muted">You have no bookings yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm print-receipt-table-wrap">
                <table className="w-full min-w-[980px] text-sm print-receipt-table">
                  <thead className="border-b border-border bg-surface-muted">
                    <tr>
                      <th className="p-3 text-left font-semibold">S.N.</th>
                      <th className="p-3 text-left font-semibold">Ref</th>
                      <th className="p-3 text-left font-semibold">Submitted</th>
                      <th className="p-3 text-left font-semibold">Trip Date</th>
                      <th className="p-3 text-left font-semibold">Package / Trip</th>
                      <th className="p-3 text-left font-semibold">Payment</th>
                      <th className="p-3 text-left font-semibold">Status</th>
                      <th className="p-3 text-left font-semibold print-hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <tr key={booking.id} className="border-b border-border align-top last:border-0">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">#{booking.id}</td>
                        <td className="p-3">{formatReceiptDateTime(booking.created_at)}</td>
                        <td className="p-3">{formatReceiptDate(booking.booking_date)}</td>
                        <td className="p-3">
                          <p className="font-medium">{booking.package?.title || "Trip booking"}</p>
                          <p className="capitalize text-muted">{booking.package?.category || "trip"}</p>
                        </td>
                        <td className="p-3">
                          <p>{bookingMethodLabel(booking.payment_method)}</p>
                          <p className="font-semibold">
                            {booking.currency.toUpperCase()} {booking.amount}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="capitalize">{bookingStatusLabel(booking.status)}</p>
                          {booking.approved_at ? (
                            <p className="mt-1 text-xs text-muted">Approved {formatReceiptDateTime(booking.approved_at)}</p>
                          ) : null}
                          {booking.review_note ? (
                            <p className="mt-1 text-xs text-muted">Note: {booking.review_note}</p>
                          ) : null}
                        </td>
                        <td className="p-3 print-hidden">
                          <button
                            type="button"
                            onClick={() => printSingle(userBookingToReceipt(booking, user))}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
                          >
                            Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {listPrintedAt ? <PrintDocumentFooter company={company} /> : null}
          </div>

          {printMode?.type === "single" ? (
            <IndividualBookingReceipt
              booking={printMode.booking}
              company={company}
              logoSrc={logoSrc}
              printedAt={printMode.printedAt}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
