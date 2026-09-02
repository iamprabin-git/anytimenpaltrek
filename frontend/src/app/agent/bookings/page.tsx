import { redirect } from "next/navigation";

export default function AgentBookingsRedirect() {
  redirect("/agent/payments");
}
