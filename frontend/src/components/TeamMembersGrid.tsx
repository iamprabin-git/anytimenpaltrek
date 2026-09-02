import TeamMemberCard from "@/components/TeamMemberCard";
import type { TeamMember } from "@/types/site-content";

interface TeamMembersGridProps {
  members: TeamMember[];
  teamPageSlug: string;
}

export default function TeamMembersGrid({ members, teamPageSlug }: TeamMembersGridProps) {
  const visibleMembers = members.filter((member) => member.visible !== false);

  if (visibleMembers.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#f8faf9] via-white to-[#f3f7f5] py-8 sm:py-10 md:py-12 lg:rounded-none lg:py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#0f594d]/5 blur-3xl" />

      <div className="relative w-full">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {visibleMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} teamPageSlug={teamPageSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}
