import MediaImage from "@/components/MediaImage";
import type { LegalDocument } from "@/types/site-content";

interface LegalDocumentsGridProps {
  documents: LegalDocument[];
}

export default function LegalDocumentsGrid({ documents }: LegalDocumentsGridProps) {
  const visibleDocuments = documents.filter((document) => document.visible !== false);

  if (visibleDocuments.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl bg-[#f5f5f5] py-8 sm:py-10 md:py-12 lg:rounded-none lg:py-16">
      <div className="w-full">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {visibleDocuments.map((document) => (
            <article key={document.id}>
              <h3 className="mb-3 text-base font-semibold text-primary md:text-lg">{document.title}</h3>
              <div className="overflow-hidden rounded-lg border border-border/60 bg-white p-3 shadow-sm">
                {document.image ? (
                  <MediaImage
                    src={document.image}
                    alt={document.title}
                    width={640}
                    height={820}
                    className="mx-auto h-auto w-full object-contain"
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center rounded-md border border-dashed border-border bg-surface-muted/40 px-4 text-center text-sm text-muted">
                    Document image will appear here once uploaded in admin.
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
