"use client";

import { useEffect, useMemo, useState } from "react";
import MediaImage from "@/components/MediaImage";
import IndividualBookingReceipt from "@/components/print/IndividualBookingReceipt";
import PrintDocumentFooter from "@/components/print/PrintDocumentFooter";
import PrintDocumentStyles from "@/components/print/PrintDocumentStyles";
import PrintReceiptHeader from "@/components/print/PrintReceiptHeader";
import { useBookingPrint } from "@/hooks/useBookingPrint";
import { usePrintCompany } from "@/hooks/usePrintCompany";
import {
  approveAgentBooking,
  exportAgentBookings,
  getAgentBookings,
  rejectAgentBooking,
  type AgentBooking,
} from "@/lib/agent-api";
import { agentBookingToReceipt } from "@/lib/booking-receipt";
import { getAuthUser, hasPermission } from "@/lib/auth";

type StatusFilter = "" | "pending" | "confirmed" | "rejected";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  return new Date(normalized).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function methodLabel(method: string | null) {
  switch (method) {
    case "manual":
      return "Manual Payment";
    case "cod":
      return "Cash on Delivery";
    case "online":
      return "Online Payment";
    default:
      return method || "—";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "pending_approval":
      return "Pending approval";
    case "confirmed":
      return "Confirmed";
    case "rejected":
      return "Rejected";
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    default:
      return status.replace(/_/g, " ");
  }
}

function isPendingStatus(status: string) {
  return status === "pending_approval" || status === "pending";
}

export default function AgentPaymentsPage() {
  const { company, logoSrc } = usePrintCompany();
  const agent = getAuthUser();
  const { printMode, printList, printSingle } = useBookingPrint();
  const [bookings, setBookings] = useState<AgentBooking[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const canApprove = hasPermission("bookings.approve");
  const canView = hasPermission("bookings.view");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  async function load() {
    setBookings(
      await getAgentBookings({
        status: filter || undefined,
        search: debouncedSearch || undefined,
      })
    );
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load booking list."));
  }, [filter, debouncedSearch]);

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((booking) => isPendingStatus(booking.status)).length,
      confirmed: bookings.filter((booking) => booking.status === "confirmed" || booking.status === "paid").length,
    };
  }, [bookings]);

  async function handleApprove(id: number) {
    setActionId(id);
    setError("");
    try {
      const reviewNote = window.prompt("Optional note for the customer (leave blank to skip):") || undefined;
      const result = await approveAgentBooking(id, reviewNote);
      setMessage(result.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve booking.");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: number) {
    setActionId(id);
    setError("");
    try {
      const reviewNote = window.prompt("Optional reason for rejection (leave blank to skip):") || undefined;
      const result = await rejectAgentBooking(id, reviewNote);
      setMessage(result.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject booking.");
    } finally {
      setActionId(null);
    }
  }

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      await exportAgentBookings({
        status: filter || undefined,
        search: debouncedSearch || undefined,
      });
      setMessage("Booking list exported to Excel.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export bookings.");
    } finally {
      setExporting(false);
    }
  }

  const listPrintedAt = printMode?.type === "list" ? printMode.printedAt : null;

  const filterLabel =
    filter === "pending"
      ? "Pending approval"
      : filter === "confirmed"
        ? "Confirmed / Paid"
        : filter === "rejected"
          ? "Rejected"
          : "All bookings";

  const printMetaItems = useMemo(() => {
    const items = [
      { label: "Prepared By", value: agent?.name || "Staff" },
      { label: "Filter", value: filterLabel },
      { label: "Total Records", value: String(summary.total) },
    ];
    if (debouncedSearch) {
      items.push({ label: "Search", value: debouncedSearch });
    }
    return items;
  }, [agent?.name, debouncedSearch, filterLabel, summary.total]);

  return (
    <>
      <PrintDocumentStyles />

      <div>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 print-hidden">
          <div>
            <h1 className="panel-title mb-2">Booking List</h1>
            <p className="text-sm text-muted">
              View all trip bookings with customer details, trip dates, payment proof, and manager approval status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StatusFilter)}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm"
            >
              <option value="">All bookings</option>
              <option value="pending">Pending approval</option>
              <option value="confirmed">Confirmed / Paid</option>
              <option value="rejected">Rejected</option>
            </select>
            {canView ? (
              <>
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
              </>
            ) : null}
          </div>
        </div>

        {!canApprove ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print-hidden">
            You can view booking requests, but only managers with approval permission can confirm or reject them.
          </p>
        ) : null}

        {message ? <p className="mb-4 text-green-600 print-hidden">{message}</p> : null}
        {error ? <p className="mb-4 text-red-600 print-hidden">{error}</p> : null}

        <div className="mb-6 print-hidden">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, package, phone, address, notes..."
            className="panel-input max-w-2xl"
          />
        </div>

        <div id="booking-print-area" className="print-document-root">
          <div className={printMode?.type === "single" ? "print-hidden" : undefined}>
            {listPrintedAt ? (
              <PrintReceiptHeader
                title="Booking Receipt"
                subtitle="Official booking list report"
                company={company}
                logoSrc={logoSrc}
                printedAt={listPrintedAt}
                documentRef={`RPT-${listPrintedAt.getFullYear()}${String(listPrintedAt.getMonth() + 1).padStart(2, "0")}${String(listPrintedAt.getDate()).padStart(2, "0")}-${agent?.id || "0"}`}
                metaItems={printMetaItems}
              />
            ) : null}

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 print-hidden">
            <div className="panel-card">
              <p className="text-sm text-muted">Total shown</p>
              <p className="mt-1 text-2xl font-bold text-primary">{summary.total}</p>
            </div>
            <div className="panel-card">
              <p className="text-sm text-muted">Pending approval</p>
              <p className="mt-1 text-2xl font-bold text-primary">{summary.pending}</p>
            </div>
            <div className="panel-card">
              <p className="text-sm text-muted">Confirmed / paid</p>
              <p className="mt-1 text-2xl font-bold text-primary">{summary.confirmed}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm print-receipt-table-wrap">
            {bookings.length === 0 ? (
              <p className="p-6 text-sm text-muted">No bookings found.</p>
            ) : (
              <table className="w-full min-w-[1200px] text-sm print-receipt-table">
                <thead className="border-b border-border bg-surface-muted">
                  <tr>
                    <th className="p-3 text-left font-semibold">S.N.</th>
                    <th className="p-3 text-left font-semibold">Ref</th>
                    <th className="p-3 text-left font-semibold">Submitted</th>
                    <th className="p-3 text-left font-semibold">Trip Date</th>
                    <th className="p-3 text-left font-semibold">Package / Trip</th>
                    <th className="p-3 text-left font-semibold">Customer</th>
                    <th className="p-3 text-left font-semibold">Payment</th>
                    <th className="p-3 text-left font-semibold">Proof</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                    <th className="p-3 text-left font-semibold print-hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={booking.id} className="border-b border-border align-top last:border-0">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">#{booking.id}</td>
                      <td className="p-3">{formatDateTime(booking.created_at)}</td>
                      <td className="p-3">{formatDate(booking.booking_date)}</td>
                      <td className="p-3">
                        <p className="font-medium">{booking.package.title}</p>
                        <p className="capitalize text-muted">{booking.package.category || "trip"}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{booking.customer_name}</p>
                        <p className="text-muted">{booking.customer_email}</p>
                        <p className="text-muted">{booking.customer_phone || "—"}</p>
                        <p className="mt-1 text-xs text-muted">{booking.customer_address || "—"}</p>
                        {booking.customer_notes ? (
                          <p className="mt-1 text-xs text-muted">Notes: {booking.customer_notes}</p>
                        ) : null}
                        {booking.user ? (
                          <p className="mt-1 text-xs text-muted">Account: {booking.user.email}</p>
                        ) : null}
                      </td>
                      <td className="p-3">
                        <p>{methodLabel(booking.payment_method)}</p>
                        <p className="font-semibold">
                          {booking.currency.toUpperCase()} {booking.amount}
                        </p>
                      </td>
                      <td className="p-3">
                        {booking.payment_proof_url ? (
                          <a href={booking.payment_proof_url} target="_blank" rel="noreferrer" className="inline-block print:hidden">
                            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                              <MediaImage src={booking.payment_proof_url} alt="Payment proof" fill className="object-cover" />
                            </div>
                          </a>
                        ) : null}
                        {booking.payment_proof_url ? (
                          <p className="hidden text-xs break-all print:block">{booking.payment_proof_url}</p>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="capitalize">{statusLabel(booking.status)}</p>
                        {booking.approver ? (
                          <p className="mt-1 text-xs text-muted">Approved by {booking.approver.name}</p>
                        ) : null}
                        {booking.approved_at ? (
                          <p className="mt-1 text-xs text-muted">{formatDateTime(booking.approved_at)}</p>
                        ) : null}
                        {booking.review_note ? (
                          <p className="mt-1 text-xs text-muted">Note: {booking.review_note}</p>
                        ) : null}
                      </td>
                      <td className="p-3 print-hidden">
                        <div className="flex flex-wrap gap-2">
                          {canView ? (
                            <button
                              type="button"
                              onClick={() => printSingle(agentBookingToReceipt(booking))}
                              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
                            >
                              Print
                            </button>
                          ) : null}
                          {isPendingStatus(booking.status) && canApprove ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(booking.id)}
                                disabled={actionId === booking.id}
                                className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-50"
                              >
                                {actionId === booking.id ? "Working..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(booking.id)}
                                disabled={actionId === booking.id}
                                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

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
