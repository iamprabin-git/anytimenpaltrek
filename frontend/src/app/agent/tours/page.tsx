"use client";

import AgentPackagesPanel from "@/components/agent/AgentPackagesPanel";

export default function AgentToursPage() {
  return (
    <AgentPackagesPanel
      title="Tour Management"
      description="Manage tour and adventure packages shown on the public website."
      categories={["tour", "adventure"]}
      defaultCategory="tour"
      addLabel="Add Tour"
    />
  );
}
