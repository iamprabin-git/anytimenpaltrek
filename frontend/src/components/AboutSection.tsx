import Link from "next/link";
import type { SiteStats } from "@/types";
import type { SiteHomeContent } from "@/types/site-content";

interface AboutSectionProps {
  copy: SiteHomeContent["about"];
  stats: Pick<SiteStats, "years_experience">;
}

export default function AboutSection({ copy, stats }: AboutSectionProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-title text-left">{copy.title}</h2>
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-muted leading-relaxed mb-4 last:mb-8">
                {paragraph}
              </p>
            ))}
            <ul className="space-y-4 mb-8">
              {copy.bullets.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    ✓
                  </span>
                  <span className="font-semibold text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            {copy.cta_text && copy.cta_link ? (
              <Link href={copy.cta_link} className="btn-primary">
                {copy.cta_text}
              </Link>
            ) : null}
          </div>
          <div className="relative h-96 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <div className="text-white text-center p-8">
              <p className="text-6xl font-bold mb-2">{stats.years_experience}+</p>
              <p className="text-xl font-semibold">{copy.stat_label}</p>
              <p className="text-white/80 mt-4">{copy.stat_note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
