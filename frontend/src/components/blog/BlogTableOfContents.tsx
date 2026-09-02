"use client";

import type { BlogTocItem } from "@/lib/blog-content";

export default function BlogTableOfContents({
  items,
  className = "hidden lg:block",
}: {
  items: BlogTocItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <aside className={`blog-toc ${className}`}>
      <div className="blog-toc-panel">
        <h2 className="blog-toc-title">Table of Contents</h2>
        <ol className="blog-toc-list">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? "blog-toc-subitem" : undefined}>
              <button type="button" onClick={() => scrollToSection(item.id)} className="blog-toc-link">
                {item.label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
