"use client";

import { useEffect, useMemo, useState } from "react";
import IndividualBookingReceipt from "@/components/print/IndividualBookingReceipt";
import PrintDocumentFooter from "@/components/print/PrintDocumentFooter";
import PrintDocumentStyles from "@/components/print/PrintDocumentStyles";
import PrintReceiptHeader from "@/components/print/PrintReceiptHeader";
import { useBookingPrint } from "@/hooks/useBookingPrint";
import { usePrintCompany } from "@/hooks/usePrintCompany";
import { getAuthUser } from "@/lib/auth";
import {
  bookingMethodLabel,
  formatMoney,
  formatReceiptDate,
  formatReceiptDateTime,
  isPaidOrConfirmed,
  paymentStatusLabel,
  userBookingToReceipt,
} from "@/lib/booking-receipt";
import { exportUserPayments, getUserPayments, type UserBooking } from "@/lib/user-api";

export default function AccountPaymentsPage() {
  const { company, logoSrc } = usePrintCompany();
  const user = getAuthUser();
  const { printMode, printList, printSingle } = useBookingPrint();
  const [payments, setPayments] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getUserPayments()
      .then(setPayments)
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const primaryCurrency = payments[0]?.currency?.toUpperCase() || "USD";
    const sameCurrency = payments.every((item) => item.currency.toUpperCase() === primaryCurrency);
    const totalAmount = payments.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0);
    const paidAmount = payments
      .filter((item) => isPaidOrConfirmed(item.status))
      .reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0);

    return {
      totalRecords: payments.length,
      paidRecords: payments.filter((item) => isPaidOrConfirmed(item.status)).length,
      pendingRecords: payments.filter((item) => !isPaidOrConfirmed(item.status) && item.status !== "rejected").length,
      totalAmountLabel: sameCurrency ? formatMoney(totalAmount.toFixed(2), primaryCurrency) : "Multiple currencies",
      paidAmountLabel: sameCurrency ? formatMoney(paidAmount.toFixed(2), primaryCurrency) : "Multiple currencies",
    };
  }, [payments]);

  async function handleExport() {
    setExporting(true);
    setError("");
    setMessage("");
    try {
      await exportUserPayments();
      setMessage("Payment list exported to Excel.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export payments.");
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
            <h1 className="panel-title mb-2">My Payment</h1>
            <p className="text-sm text-muted">
              Amounts paid and due for your tour and travel bookings, with payment mode and status for each trip.
            </p>
          </div>
          {payments.length > 0 ? (
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
                title="Payment Statement"
                subtitle="Tour and travel booking payments"
                company={company}
                logoSrc={logoSrc}
                printedAt={listPrintedAt}
                customerName={user?.name}
                customerEmail={user?.email}
                customerPhone={user?.phone || undefined}
                customerAddress={user?.country ? `${user.country}` : undefined}
                documentRef={`PAY-${listPrintedAt.getFullYear()}${String(listPrintedAt.getMonth() + 1).padStart(2, "0")}${String(listPrintedAt.getDate()).padStart(2, "0")}-${user?.id || "0"}`}
                metaItems={[
                  { label: "Total Records", value: String(summary.totalRecords) },
                  { label: "Total Amount", value: summary.totalAmountLabel },
                  { label: "Paid / Confirmed", value: summary.paidAmountLabel },
                ]}
              />
            ) : null}

            {!loading && payments.length > 0 ? (
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 print-hidden">
                <div className="panel-card">
                  <p className="text-sm text-muted">Total bookings</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{summary.totalRecords}</p>
                </div>
                <div className="panel-card">
                  <p className="text-sm text-muted">Total amount</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{summary.totalAmountLabel}</p>
                </div>
                <div className="panel-card">
                  <p className="text-sm text-muted">Paid / confirmed</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{summary.paidAmountLabel}</p>
                </div>
              </div>
            ) : null}

            {loading ? (
              <p className="text-muted print-hidden">Loading payment history...</p>
            ) : payments.length === 0 ? (
              <p className="text-muted">You have no booking payments yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm print-receipt-table-wrap">
                <table className="w-full min-w-[1100px] text-sm print-receipt-table">
                  <thead className="border-b border-border bg-surface-muted">
                    <tr>
                      <th className="p-3 text-left font-semibold">S.N.</th>
                      <th className="p-3 text-left font-semibold">Ref</th>
                      <th className="p-3 text-left font-semibold">Package / Trip</th>
                      <th className="p-3 text-left font-semibold">Trip Date</th>
                      <th className="p-3 text-left font-semibold">Payment Mode</th>
                      <th className="p-3 text-left font-semibold">Amount</th>
                      <th className="p-3 text-left font-semibold">Payment Status</th>
                      <th className="p-3 text-left font-semibold">Submitted</th>
                      <th className="p-3 text-left font-semibold print-hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment.id} className="border-b border-border align-top last:border-0">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">#{payment.id}</td>
                        <td className="p-3">
                          <p className="font-medium">{payment.package?.title || "Trip booking"}</p>
                          <p className="capitalize text-muted">{payment.package?.category || "trip"}</p>
                        </td>
                        <td className="p-3">{formatReceiptDate(payment.booking_date)}</td>
                        <td className="p-3">{bookingMethodLabel(payment.payment_method)}</td>
                        <td className="p-3 font-semibold">{formatMoney(payment.amount, payment.currency)}</td>
                        <td className="p-3">
                          <p>{paymentStatusLabel(payment.status)}</p>
                          {payment.approved_at ? (
                            <p className="mt-1 text-xs text-muted">Approved {formatReceiptDateTime(payment.approved_at)}</p>
                          ) : null}
                          {payment.review_note ? (
                            <p className="mt-1 text-xs text-muted">Note: {payment.review_note}</p>
                          ) : null}
                        </td>
                        <td className="p-3">{formatReceiptDateTime(payment.created_at)}</td>
                        <td className="p-3 print-hidden">
                          <button
                            type="button"
                            onClick={() => printSingle(userBookingToReceipt(payment, user))}
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
              title="Payment Receipt"
              subtitle="Tour and travel booking payment details"
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
