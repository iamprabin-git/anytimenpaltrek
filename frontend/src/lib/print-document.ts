export function formatPrintDateTime(value: Date) {
  return value.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrintDate(value: Date) {
  return value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function triggerPrint(setPrintedAt: (value: Date) => void) {
  setPrintedAt(new Date());
  window.setTimeout(() => window.print(), 50);
}
