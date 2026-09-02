import MediaImage from "@/components/MediaImage";
import type { FooterPartnerBadge } from "@/types/site-content";

function PlatformLabel({ badge }: { badge: FooterPartnerBadge }) {
  switch (badge.id) {
    case "tripadvisor":
      return (
        <span className="text-center text-[11px] font-bold leading-tight text-[#00AF87]">
          Trip
          <br />
          Advisor
        </span>
      );
    case "booking-com":
      return <span className="text-sm font-bold text-[#003580]">Booking.com</span>;
    case "google":
      return (
        <span className="text-sm font-bold">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </span>
      );
    case "viator":
      return <span className="text-sm font-bold text-[#1A1A1A]">viator</span>;
    case "expedia":
      return <span className="text-sm font-bold text-[#191E3B]">Expedia</span>;
    case "trustpilot":
      return <span className="text-xs font-bold text-[#00B67A]">Trustpilot</span>;
    default:
      return <span className="text-[10px] font-bold leading-tight">{badge.label}</span>;
  }
}

export default function FooterPartnerBadgeItem({ badge }: { badge: FooterPartnerBadge }) {
  const content = badge.image ? (
    <MediaImage src={badge.image} alt={badge.label} width={88} height={40} className="h-8 w-auto object-contain" />
  ) : (
    <PlatformLabel badge={badge} />
  );

  const className =
    "footer-badge flex h-12 min-w-[76px] items-center justify-center rounded-md px-2 shadow-sm transition-transform hover:scale-105";

  if (badge.href) {
    return (
      <a href={badge.href} target="_blank" rel="noopener noreferrer" className={className} title={badge.label}>
        {content}
      </a>
    );
  }

  return (
    <span className={className} title={badge.label}>
      {content}
    </span>
  );
}
