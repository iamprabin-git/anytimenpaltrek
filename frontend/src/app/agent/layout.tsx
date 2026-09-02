import AgentShell from "@/components/AgentShell";

export const metadata = {
  title: "Agent Panel",
  robots: { index: false, follow: false },
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AgentShell>{children}</AgentShell>;
}
