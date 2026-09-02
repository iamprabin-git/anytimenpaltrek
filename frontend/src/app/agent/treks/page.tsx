"use client";

import AgentPackagesPanel from "@/components/agent/AgentPackagesPanel";

export default function AgentTreksPage() {
  return (
    <AgentPackagesPanel
      title="Trek Management"
      description="Manage trekking packages shown on the public website."
      categories={["trekking"]}
      defaultCategory="trekking"
      addLabel="Add Trek"
    />
  );
}
