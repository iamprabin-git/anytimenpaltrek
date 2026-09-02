import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import { teamMemberProfileHref } from "@/lib/site-content";
import type { TeamMember } from "@/types/site-content";

interface TeamMemberCardProps {
  member: TeamMember;
  teamPageSlug: string;
}

function memberInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function TeamMemberCard({ member, teamPageSlug }: TeamMemberCardProps) {
  const profileHref = teamMemberProfileHref(teamPageSlug, member);
  const initials = memberInitials(member.name);

  return (
    <Link href={profileHref} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-muted">
        {member.photo ? (
          <MediaImage
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
            <span className="text-3xl font-bold text-primary">{initials || "?"}</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-base font-bold leading-snug text-foreground">{member.name}</p>
        {member.role ? <p className="text-sm leading-snug text-[#1e3a8a]">{member.role}</p> : null}
      </div>
    </Link>
  );
}
