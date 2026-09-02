export type BlogCategory = {
  value: string;
  label: string;
  keywords: string[];
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  { value: "travel-tips", label: "Travel Tips", keywords: ["guide", "budget", "beginner", "tips", "planning", "complete guide"] },
  { value: "trekking", label: "Trekking", keywords: ["trek", "everest", "annapurna", "himalaya", "base camp", "circuit"] },
  { value: "tours", label: "Tours", keywords: ["tour", "helicopter", "city", "cultural"] },
  { value: "adventure", label: "Adventure", keywords: ["zipline", "adventure", "zipflyer", "rafting"] },
];

export function detectBlogCategory(input: {
  title: string;
  excerpt?: string | null;
  slug: string;
}): BlogCategory {
  const haystack = `${input.title} ${input.excerpt || ""} ${input.slug}`.toLowerCase();

  for (const category of BLOG_CATEGORIES) {
    if (category.keywords.some((keyword) => haystack.includes(keyword))) {
      return category;
    }
  }

  return BLOG_CATEGORIES[0];
}

export function matchesBlogCategory(
  input: { title: string; excerpt?: string | null; slug: string },
  categoryValue: string
) {
  if (categoryValue === "all") return true;
  return detectBlogCategory(input).value === categoryValue;
}
