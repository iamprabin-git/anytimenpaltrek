export type PaymentModeId = "manual" | "cod" | "online";

export interface PaymentModeInfo {
  id: PaymentModeId;
  name: string;
  description: string;
  instructions: string;
}

export const PAYMENT_MODES: PaymentModeInfo[] = [
  {
    id: "manual",
    name: "Manual Payment",
    description: "Bank transfer or QR scan",
    instructions: "Transfer to our bank account or scan the QR code, then upload payment proof when booking.",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay in cash on arrival",
    instructions: "Submit your booking request. After manager approval, pay in cash when your trip begins.",
  },
  {
    id: "online",
    name: "Online Payment",
    description: "Pay securely with card",
    instructions: "Complete payment online during checkout using a debit or credit card.",
  },
];

export function paymentModeStatus(id: PaymentModeId, onlineEnabled: boolean) {
  if (id === "online") {
    return onlineEnabled ? "Available" : "Coming soon";
  }

  return "Available";
}
