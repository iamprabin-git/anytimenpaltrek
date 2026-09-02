import { googleMapsDirectionsUrl } from "@/lib/contact-page";

interface ContactMapProps {
  embedUrl: string;
  address?: string;
  title: string;
  subtitle?: string;
}

export default function ContactMap({ embedUrl, address, title, subtitle }: ContactMapProps) {
  const directionsUrl = address ? googleMapsDirectionsUrl(address) : null;

  return (
    <section className="bg-surface-muted/40 py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="section-subtitle px-2">{subtitle}</p> : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_12px_40px_rgba(15,89,77,0.08)] sm:rounded-2xl">
          <iframe
            title={title}
            src={embedUrl}
            className="h-[260px] w-full sm:h-[360px] md:h-[420px] lg:h-[480px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        {address && directionsUrl ? (
          <p className="mt-4 px-1 text-center text-sm text-muted">
            {address}{" "}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Open in Google Maps
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
