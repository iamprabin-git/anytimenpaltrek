"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";
import MediaImage from "@/components/MediaImage";
import {
  deleteAgentBlogPost,
  getAgentBlogPosts,
  saveAgentBlogPostForm,
} from "@/lib/agent-api";
import { hasPermission } from "@/lib/auth";
import type { BlogPost } from "@/types";

function appendCheckbox(formData: FormData, form: HTMLFormElement, name: string) {
  const input = form.elements.namedItem(name) as HTMLInputElement | null;
  formData.set(name, input?.checked ? "1" : "0");
}

function formatPublishedDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BlogPostForm({
  initial,
  slug,
  submitLabel,
  onCancel,
  onSaved,
}: {
  initial: Partial<BlogPost>;
  slug?: string;
  submitLabel: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const publishedAt = initial.published_at ? initial.published_at.slice(0, 16) : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    appendCheckbox(formData, form, "is_published");

    try {
      await saveAgentBlogPostForm(initial.id ?? null, formData);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save blog post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="panel-card mb-8 grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      {slug ? (
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">URL Slug</label>
          <input value={slug} disabled className="panel-input bg-surface-muted" />
        </div>
      ) : null}

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Title *</label>
        <input name="title" required defaultValue={initial.title || ""} className="panel-input" />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Excerpt</label>
        <textarea name="excerpt" rows={2} defaultValue={initial.excerpt || ""} className="panel-input" />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Content</label>
        <textarea name="content" rows={8} defaultValue={initial.content || ""} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Published at</label>
        <input name="published_at" type="datetime-local" defaultValue={publishedAt} className="panel-input" />
      </div>

      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" name="is_published" defaultChecked={initial.is_published ?? true} />
        Published
      </label>

      <div className="md:col-span-2">
        <ImageUploadField
          label="Featured image"
          name="image_file"
          removeName="remove_image"
          previewUrl={initial.image}
          allowRemove={!!initial.id}
        />
      </div>

      {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}

      <div className="flex flex-wrap gap-3 md:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AgentBlogPanel() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [mode, setMode] = useState<"none" | "create" | "edit">("none");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canCreate = hasPermission("blog.create");
  const canUpdate = hasPermission("blog.update");
  const canDelete = hasPermission("blog.delete");

  async function load() {
    setPosts(await getAgentBlogPosts());
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  function closeForm() {
    setMode("none");
    setEditing(null);
  }

  function handleSaved(wasEdit: boolean) {
    closeForm();
    setMessage(wasEdit ? "Blog post updated." : "Blog post created.");
    setError("");
    load().catch(() => {});
  }

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;

    try {
      await deleteAgentBlogPost(post.id);
      setMessage("Blog post deleted.");
      setError("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setMessage("");
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">Blog Management</h1>
          <p className="text-sm text-muted">Create and publish blog posts shown on the public website.</p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => (mode === "create" ? closeForm() : (setEditing(null), setMode("create")))}
            className="btn-primary"
          >
            {mode === "create" ? "Cancel" : "Add Blog Post"}
          </button>
        ) : null}
      </div>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      {mode === "create" ? (
        <BlogPostForm
          initial={{ is_published: true }}
          submitLabel="Create Post"
          onCancel={closeForm}
          onSaved={() => handleSaved(false)}
        />
      ) : null}

      {mode === "edit" && editing ? (
        <BlogPostForm
          initial={editing}
          slug={editing.slug}
          submitLabel="Save Changes"
          onCancel={closeForm}
          onSaved={() => handleSaved(true)}
        />
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {posts.length === 0 ? (
          <p className="p-6 text-sm text-muted">No blog posts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-4 text-left font-semibold">Image</th>
                <th className="p-4 text-left font-semibold">Title</th>
                <th className="p-4 text-left font-semibold">Slug</th>
                <th className="p-4 text-left font-semibold">Published</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    {post.image ? (
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg border border-border bg-surface-muted">
                        <MediaImage src={post.image} alt={post.title} fill className="object-cover" sizes="64px" />
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{post.title}</p>
                    {post.excerpt ? (
                      <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted">{post.excerpt}</p>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <code className="rounded bg-surface-muted px-2 py-1 text-xs">/blog/{post.slug}</code>
                  </td>
                  <td className="p-4 whitespace-nowrap">{formatPublishedDate(post.published_at)}</td>
                  <td className="p-4">
                    <span className={post.is_published ? "text-green-600" : "text-muted"}>
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {canUpdate ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(post);
                            setMode("edit");
                          }}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
                        >
                          Edit
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
