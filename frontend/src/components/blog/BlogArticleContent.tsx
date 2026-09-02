import { formatInlineBlogText, type BlogBlock } from "@/lib/blog-content";

function MountainBulletIcon() {
  return (
    <svg viewBox="0 0 20 20" className="blog-bullet-icon" fill="currentColor" aria-hidden="true">
      <path d="M2 16h16L10 4 6 11 2 16Z" />
      <path d="M8 16 10 11l2 5H8Z" opacity="0.65" />
    </svg>
  );
}

export default function BlogArticleContent({ blocks }: { blocks: BlogBlock[] }) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="blog-article-content">
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2 key={block.id} id={block.id} className="blog-content-h2">
              {block.text}
            </h2>
          );
        }

        if (block.type === "h3") {
          return (
            <h3 key={block.id} id={block.id} className="blog-content-h3">
              {block.text}
            </h3>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={`list-${index}`} className="blog-content-list">
              {block.items.map((item) => (
                <li key={item}>
                  <MountainBulletIcon />
                  <span dangerouslySetInnerHTML={{ __html: formatInlineBlogText(item) }} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={`p-${index}`}
            className="blog-content-paragraph"
            dangerouslySetInnerHTML={{ __html: formatInlineBlogText(block.text) }}
          />
        );
      })}
    </div>
  );
}
