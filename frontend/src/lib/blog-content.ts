export type BlogBlock =
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type BlogTocItem = {
  id: string;
  label: string;
  level: 2 | 3;
};

function slugify(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "section";

  let slug = base;
  let counter = 1;
  while (used.has(slug)) {
    slug = `${base}-${counter++}`;
  }
  used.add(slug);
  return slug;
}

export function formatInlineBlogText(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="blog-content-link">$1</a>'
  );

  return html;
}

export function parseBlogContent(content: string | null | undefined): {
  blocks: BlogBlock[];
  toc: BlogTocItem[];
} {
  if (!content?.trim()) {
    return { blocks: [], toc: [] };
  }

  const usedIds = new Set<string>();
  const blocks: BlogBlock[] = [];
  const toc: BlogTocItem[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  let h2Count = 0;
  let h3Count = 0;
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    const text = paragraphLines.join(" ").trim();
    if (text) blocks.push({ type: "p", text });
    paragraphLines = [];
  }

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: "ul", items: [...listItems] });
      listItems = [];
    }
  }

  function pushHeading(level: 2 | 3, text: string) {
    const id = slugify(text, usedIds);
    if (level === 2) {
      h2Count += 1;
      h3Count = 0;
      toc.push({ id, label: `${h2Count}. ${text}`, level: 2 });
      blocks.push({ type: "h2", id, text });
      return;
    }

    h3Count += 1;
    const label = h2Count > 0 ? `${h2Count}.${h3Count} ${text}` : text;
    toc.push({ id, label, level: 3 });
    blocks.push({ type: "h3", id, text });
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      pushHeading(3, line.slice(4).trim());
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      pushHeading(2, line.slice(3).trim());
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return { blocks, toc };
}
