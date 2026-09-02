"use client";

import { useCallback, useEffect, useState } from "react";
import type { BookingPrintMode, BookingReceiptData } from "@/lib/booking-receipt";

export function useBookingPrint() {
  const [printMode, setPrintMode] = useState<BookingPrintMode | null>(null);

  useEffect(() => {
    function handleAfterPrint() {
      setPrintMode(null);
    }

    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const printList = useCallback(() => {
    const printedAt = new Date();
    setPrintMode({ type: "list", printedAt });
    window.setTimeout(() => window.print(), 50);
  }, []);

  const printSingle = useCallback((booking: BookingReceiptData) => {
    const printedAt = new Date();
    setPrintMode({ type: "single", printedAt, booking });
    window.setTimeout(() => window.print(), 50);
  }, []);

  return { printMode, printList, printSingle };
}
